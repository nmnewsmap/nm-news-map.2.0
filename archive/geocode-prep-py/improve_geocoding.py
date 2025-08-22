#!/usr/bin/env python3
"""
Improve geocoding by using full street addresses instead of city-level coordinates.
Reads from Excel file, geocodes with detailed addresses, saves to new CSV.
"""
import pandas as pd
import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import os

def safe_geocode(geolocator, address, max_retries=3):
    """Safely geocode an address with retry logic"""
    for attempt in range(max_retries):
        try:
            time.sleep(1)  # Rate limiting
            location = geolocator.geocode(address, timeout=10)
            if location:
                return location.latitude, location.longitude
            else:
                return None, None
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            print(f"  Geocoding attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(2)  # Wait before retry
            continue
    return None, None

def build_full_address(row):
    """Build full address from components"""
    address_parts = []
    
    # Add street address if available
    if pd.notna(row.get('Address_Street')) and str(row['Address_Street']).strip():
        address_parts.append(str(row['Address_Street']).strip())
    
    # Add city
    if pd.notna(row.get('Address_City')) and str(row['Address_City']).strip():
        address_parts.append(str(row['Address_City']).strip())
    
    # Add state
    if pd.notna(row.get('Address_State')) and str(row['Address_State']).strip():
        address_parts.append(str(row['Address_State']).strip())
    
    # Add zip if available
    if pd.notna(row.get('Address_Zip')) and str(row['Address_Zip']).strip():
        zip_code = str(row['Address_Zip']).strip()
        if zip_code != 'nan':
            address_parts.append(zip_code)
    
    return ', '.join(address_parts) if address_parts else None

def main():
    print("🗺️  Improving geocoding with full street addresses...")
    
    # File paths
    input_excel = 'NM_NEWS_OUTLETS_GEOCODED_2025 (1).xlsx'
    output_csv = 'NM_NEWS_OUTLETS_GEOCODED_2025_IMPROVED.csv'
    
    # Check if input file exists
    if not os.path.exists(input_excel):
        print(f"❌ Input file not found: {input_excel}")
        return
    
    # Load data
    print(f"📊 Loading data from: {input_excel}")
    df = pd.read_excel(input_excel)
    print(f"✅ Loaded {len(df)} outlets")
    
    # Initialize geocoder
    geolocator = Nominatim(user_agent="nm_news_outlets_improved_geocoder")
    
    # Show address fields available
    address_cols = [col for col in df.columns if 'address' in col.lower()]
    print(f"📍 Address columns found: {address_cols}")
    
    # Show sample addresses
    print("\n📋 Sample addresses to be geocoded:")
    for i in range(min(3, len(df))):
        full_addr = build_full_address(df.iloc[i])
        outlet_name = df.iloc[i].get('OUTLET_NAME', f'Row {i}')
        print(f"  {outlet_name}: {full_addr}")
    
    # Ask for confirmation
    print(f"\n🔄 Ready to geocode {len(df)} outlets using full addresses.")
    print(f"📁 Results will be saved to: {output_csv}")
    print("⚠️  This may take several minutes due to API rate limits.")
    
    response = input("\nProceed with geocoding? (y/n): ").lower().strip()
    if response != 'y':
        print("❌ Geocoding cancelled.")
        return
    
    # Create new columns for improved coordinates
    df['improved_latitude'] = None
    df['improved_longitude'] = None
    df['geocoding_status'] = None
    df['full_address_used'] = None
    
    successful = 0
    failed = 0
    
    print(f"\n🌍 Starting geocoding process...")
    
    for idx, row in df.iterrows():
        outlet_name = row.get('OUTLET_NAME', f'Row {idx}')
        print(f"\n📍 [{idx+1}/{len(df)}] Processing: {outlet_name}")
        
        # Build full address
        full_address = build_full_address(row)
        df.at[idx, 'full_address_used'] = full_address
        
        if not full_address:
            print("  ⚠️  No address components found")
            df.at[idx, 'geocoding_status'] = 'No address'
            failed += 1
            continue
        
        print(f"  🔍 Geocoding: {full_address}")
        
        # Geocode the full address
        lat, lng = safe_geocode(geolocator, full_address)
        
        if lat and lng:
            df.at[idx, 'improved_latitude'] = lat
            df.at[idx, 'improved_longitude'] = lng
            df.at[idx, 'geocoding_status'] = 'Success'
            print(f"  ✅ Success: ({lat:.6f}, {lng:.6f})")
            successful += 1
        else:
            # Try with just city, state as fallback
            fallback_address = f"{row.get('Address_City', '')}, {row.get('Address_State', '')}"
            print(f"  🔄 Trying fallback: {fallback_address}")
            lat, lng = safe_geocode(geolocator, fallback_address)
            
            if lat and lng:
                df.at[idx, 'improved_latitude'] = lat
                df.at[idx, 'improved_longitude'] = lng
                df.at[idx, 'geocoding_status'] = 'Fallback success'
                print(f"  ✅ Fallback success: ({lat:.6f}, {lng:.6f})")
                successful += 1
            else:
                df.at[idx, 'geocoding_status'] = 'Failed'
                print(f"  ❌ Failed to geocode")
                failed += 1
    
    # Save results
    print(f"\n💾 Saving results to: {output_csv}")
    df.to_csv(output_csv, index=False)
    
    # Summary
    print(f"\n🎉 Geocoding complete!")
    print(f"✅ Successfully geocoded: {successful} outlets")
    print(f"❌ Failed to geocode: {failed} outlets")
    print(f"📊 Success rate: {(successful/len(df)*100):.1f}%")
    
    if successful > 0:
        print(f"\n📁 Improved coordinates saved to: {output_csv}")
        print("🗺️  Next step: Update your conversion script to use the new CSV file")
        print("    You can modify run_update.py to read from the CSV instead of Excel")

if __name__ == "__main__":
    main()
