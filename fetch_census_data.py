#!/usr/bin/env python3
"""
Census Data Fetcher for New Mexico Counties
Fetches demographic and economic data from the U.S. Census Bureau API
for integration with the New Mexico News Outlets Interactive Map.
"""

import requests
import json
import pandas as pd
from typing import Dict, List, Optional

class CensusDataFetcher:
    def __init__(self):
        self.base_url = "https://api.census.gov/data/2022/acs/acs5"
        self.state_code = "35"  # New Mexico FIPS code
        
        # Census variable mappings for our desired layers
        self.variables = {
            "Population Size": "B01003_001E",           # Total Population
            "Median Household Income": "B19013_001E",   # Median Household Income (dollars)
            "Private Business": "B08126_001E",          # Total Workers 16+ (proxy for business activity)
            "College Education": "B15003_022E",         # Bachelor's degree
            "Median Age": "B01002_001E",                # Median Age
            "Nonwhite Population": "B02001_002E",       # White alone population (we'll calculate nonwhite)
            "Homes with Broadband": "B28002_004E"       # With broadband internet subscription
        }
        
        # Additional variables needed for calculations
        self.calc_variables = {
            "Total Population": "B01003_001E",
            "Total White": "B02001_002E",
            "Total Education": "B15003_001E",           # Total population 25+ for education %
            "Total Households": "B28002_001E"           # Total households for broadband %
        }

    def fetch_county_data(self) -> Optional[Dict]:
        """Fetch census data for all New Mexico counties"""
        
        # Combine all variables we need
        all_vars = list(self.variables.values()) + list(self.calc_variables.values())
        variables_str = ",".join(set(all_vars))  # Remove duplicates
        
        # API request
        url = f"{self.base_url}?get={variables_str}&for=county:*&in=state:{self.state_code}"
        
        print(f"🔍 Fetching census data from: {url}")
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            print(f"✅ Successfully fetched data for {len(data)-1} counties")
            return data
            
        except requests.RequestException as e:
            print(f"❌ Error fetching census data: {e}")
            return None

    def process_census_data(self, raw_data: List) -> Dict:
        """Process raw census data into structured format"""
        
        if not raw_data:
            return {}
            
        # First row contains headers
        headers = raw_data[0]
        county_data = {}
        
        for row in raw_data[1:]:  # Skip header row
            county_fips = row[-1]  # Last column is county FIPS
            county_name = f"County {county_fips}"  # We'll map this to actual names
            
            # Create data dictionary for this county
            data_dict = dict(zip(headers, row))
            
            # Calculate derived metrics
            processed_data = self.calculate_metrics(data_dict)
            
            county_data[county_fips] = processed_data
            
        return county_data

    def calculate_metrics(self, data: Dict) -> Dict:
        """Calculate final metrics from raw census variables"""
        
        def safe_float(value):
            try:
                return float(value) if value not in [None, '', '-'] else 0
            except (ValueError, TypeError):
                return 0
        
        def safe_percentage(numerator, denominator):
            num = safe_float(numerator)
            den = safe_float(denominator)
            return round((num / den * 100), 1) if den > 0 else 0
        
        total_pop = safe_float(data.get('B01003_001E', 0))
        total_white = safe_float(data.get('B02001_002E', 0))
        total_education = safe_float(data.get('B15003_001E', 0))
        bachelor_degree = safe_float(data.get('B15003_022E', 0))
        total_households = safe_float(data.get('B28002_001E', 0))
        broadband_households = safe_float(data.get('B28002_004E', 0))
        
        return {
            "Population Size": int(total_pop),
            "Median Household Income": int(safe_float(data.get('B19013_001E', 0))),
            "Private Business": int(safe_float(data.get('B08126_001E', 0))),  # Workers as proxy
            "College Education": safe_percentage(bachelor_degree, total_education),
            "Median Age": round(safe_float(data.get('B01002_001E', 0)), 1),
            "Nonwhite Population": safe_percentage(total_pop - total_white, total_pop),
            "Homes with Broadband": safe_percentage(broadband_households, total_households)
        }

    def get_county_names(self) -> Dict[str, str]:
        """Map FIPS codes to county names for New Mexico"""
        return {
            "001": "Bernalillo County",
            "003": "Catron County", 
            "005": "Chaves County",
            "006": "Cibola County",
            "007": "Colfax County",
            "009": "Curry County",
            "011": "De Baca County",
            "013": "Doña Ana County",
            "015": "Eddy County",
            "017": "Grant County",
            "019": "Guadalupe County",
            "021": "Harding County",
            "023": "Hidalgo County",
            "025": "Lea County",
            "027": "Lincoln County",
            "028": "Los Alamos County",
            "029": "Luna County",
            "031": "McKinley County",
            "033": "Mora County",
            "035": "Otero County",
            "037": "Quay County",
            "039": "Rio Arriba County",
            "041": "Roosevelt County",
            "043": "Sandoval County",
            "045": "San Juan County",
            "047": "San Miguel County",
            "049": "Santa Fe County",
            "051": "Sierra County",
            "053": "Socorro County",
            "055": "Taos County",
            "057": "Torrance County",
            "059": "Union County",
            "061": "Valencia County"
        }

    def create_geojson_with_census(self, census_data: Dict) -> Dict:
        """Create GeoJSON with census data embedded"""
        
        county_names = self.get_county_names()
        
        # We'll need to load the existing county GeoJSON and add census data
        try:
            with open('nm_counties_wgs84.geojson', 'r') as f:
                geojson = json.load(f)
        except FileNotFoundError:
            print("❌ County GeoJSON file not found. Please ensure nm_counties_wgs84.geojson exists.")
            return {}
        
        # Add census data to each county feature
        for feature in geojson['features']:
            county_name = feature['properties'].get('NAME', '')
            
            # Find matching FIPS code
            fips_code = None
            for fips, name in county_names.items():
                if name.replace(' County', '').lower() in county_name.lower():
                    fips_code = fips
                    break
            
            if fips_code and fips_code in census_data:
                # Add census data to properties
                feature['properties'].update(census_data[fips_code])
        
        return geojson

    def save_census_geojson(self, geojson_data: Dict, filename: str = 'nm_counties_with_census.geojson'):
        """Save the enhanced GeoJSON with census data"""
        
        with open(filename, 'w') as f:
            json.dump(geojson_data, f, indent=2)
        
        print(f"✅ Census-enhanced GeoJSON saved as: {filename}")

def main():
    print("🏛️  New Mexico Census Data Fetcher")
    print("=" * 50)
    
    fetcher = CensusDataFetcher()
    
    # Fetch raw census data
    raw_data = fetcher.fetch_county_data()
    if not raw_data:
        print("❌ Failed to fetch census data. Exiting.")
        return
    
    # Process the data
    print("\n📊 Processing census data...")
    processed_data = fetcher.process_census_data(raw_data)
    
    # Create enhanced GeoJSON
    print("\n🗺️  Creating census-enhanced GeoJSON...")
    geojson_with_census = fetcher.create_geojson_with_census(processed_data)
    
    if geojson_with_census:
        # Save the enhanced GeoJSON
        fetcher.save_census_geojson(geojson_with_census)
        
        # Display summary
        print("\n📈 Census Data Summary:")
        print("-" * 30)
        for fips, data in list(processed_data.items())[:3]:  # Show first 3 counties
            county_name = fetcher.get_county_names().get(fips, f"County {fips}")
            print(f"\n{county_name}:")
            for metric, value in data.items():
                if isinstance(value, float):
                    print(f"  {metric}: {value}%")
                elif isinstance(value, int) and value > 1000:
                    print(f"  {metric}: {value:,}")
                else:
                    print(f"  {metric}: {value}")
        
        print(f"\n✅ Successfully processed {len(processed_data)} counties")
        print("🎯 Ready to integrate with interactive map!")
        
    else:
        print("❌ Failed to create census-enhanced GeoJSON")

if __name__ == "__main__":
    main()
