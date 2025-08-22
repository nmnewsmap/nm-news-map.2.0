#!/usr/bin/env python3
"""
Fix failed geocoding for outlets that fell back to city-level coordinates.
Specifically targets outlets with 'Fallback success' status and identical coordinates.
"""

import pandas as pd
import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import sys

def geocode_with_retry(geolocator, address, max_retries=3):
    """Geocode an address with retry logic and multiple address formats."""
    
    # Try different address formats
    address_variants = [
        address,  # Original full address
        address.replace(', NM,', ', New Mexico,'),  # Expand state abbreviation
        address.replace('#', 'Suite').replace('Ste', 'Suite'),  # Standardize suite format
        address.split(',')[0] + ', ' + ', '.join(address.split(',')[1:]),  # Clean spacing
    ]
    
    for variant in address_variants:
        for attempt in range(max_retries):
            try:
                print(f"  Trying: {variant}")
                location = geolocator.geocode(variant, timeout=10)
                if location:
                    print(f"  ✅ Success: {location.latitude}, {location.longitude}")
                    return location.latitude, location.longitude, "Success", variant
                else:
                    print(f"  ❌ No result for: {variant}")
                    
            except (GeocoderTimedOut, GeocoderServiceError) as e:
                print(f"  ⚠️  Geocoding error (attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)  # Wait before retry
                    
        time.sleep(1)  # Brief pause between variants
    
    return None, None, "Failed", address

def main():
    # Load the current improved CSV
    csv_file = 'NM_NEWS_OUTLETS_GEOCODED_2025_IMPROVED.csv'
    print(f"📊 Loading {csv_file}")
    
    df = pd.read_csv(csv_file)
    print(f"✅ Loaded {len(df)} outlets")
    
    # Initialize geocoder
    geolocator = Nominatim(user_agent="nm_news_outlets_fix_geocoder_v2")
    
    # Find outlets that need fixing (Fallback success or city-center coordinates)
    city_center_lat = 35.0841034
    city_center_lon = -106.650985
    
    # Identify outlets that need re-geocoding
    needs_fixing = df[
        (df['geocoding_status'] == 'Fallback success') |
        ((df['improved_latitude'] == city_center_lat) & (df['improved_longitude'] == city_center_lon))
    ].copy()
    
    print(f"\n🎯 Found {len(needs_fixing)} outlets that need re-geocoding:")
    for idx, row in needs_fixing.iterrows():
        print(f"  - {row['OUTLET_NAME']}: {row['geocoding_status']}")
    
    if len(needs_fixing) == 0:
        print("✅ No outlets need fixing!")
        return
    
    # Ask for confirmation
    response = input(f"\nProceed to re-geocode {len(needs_fixing)} outlets? (y/n): ").lower()
    if response != 'y':
        print("❌ Cancelled by user")
        return
    
    print(f"\n🚀 Starting targeted re-geocoding...")
    
    fixed_count = 0
    
    for idx, row in needs_fixing.iterrows():
        outlet_name = row['OUTLET_NAME']
        
        # Build full address
        address_parts = []
        if pd.notna(row['Address_Street']) and row['Address_Street'].strip():
            address_parts.append(row['Address_Street'].strip())
        if pd.notna(row['Address_City']) and row['Address_City'].strip():
            address_parts.append(row['Address_City'].strip())
        if pd.notna(row['Address_State']) and row['Address_State'].strip():
            address_parts.append(row['Address_State'].strip())
        if pd.notna(row['Address_Zip']) and str(row['Address_Zip']).strip():
            address_parts.append(str(row['Address_Zip']).strip())
        
        full_address = ', '.join(address_parts)
        
        print(f"\n📍 Re-geocoding: {outlet_name}")
        print(f"   Address: {full_address}")
        
        # Try geocoding with multiple strategies
        lat, lon, status, used_address = geocode_with_retry(geolocator, full_address)
        
        if lat and lon:
            # Update the dataframe
            df.at[idx, 'improved_latitude'] = lat
            df.at[idx, 'improved_longitude'] = lon
            df.at[idx, 'geocoding_status'] = status
            df.at[idx, 'full_address_used'] = used_address
            fixed_count += 1
            print(f"   ✅ Fixed: {lat}, {lon}")
        else:
            print(f"   ❌ Still failed: {outlet_name}")
        
        # Rate limiting
        time.sleep(1.5)
    
    # Save the updated CSV
    output_file = 'NM_NEWS_OUTLETS_GEOCODED_2025_FIXED.csv'
    df.to_csv(output_file, index=False)
    
    print(f"\n🎉 Geocoding fix complete!")
    print(f"   Fixed: {fixed_count}/{len(needs_fixing)} outlets")
    print(f"   Output: {output_file}")
    print(f"\n📋 Next steps:")
    print(f"   1. Update run_update.py to use {output_file}")
    print(f"   2. Run the conversion script")
    print(f"   3. Check your map for improved accuracy!")

if __name__ == "__main__":
    main()
