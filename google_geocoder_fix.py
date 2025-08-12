#!/usr/bin/env python3
"""
Fix failed geocoding using Google Geocoding API for better accuracy.
Targets outlets with 'Fallback success' status and identical coordinates.
"""

import pandas as pd
import requests
import time
import json
import sys

def geocode_with_google(address, api_key):
    """Geocode an address using Google Geocoding API."""
    
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }
    
    try:
        response = requests.get(base_url, params=params, timeout=10)
        data = response.json()
        
        if data['status'] == 'OK' and len(data['results']) > 0:
            location = data['results'][0]['geometry']['location']
            formatted_address = data['results'][0]['formatted_address']
            return location['lat'], location['lng'], "Success", formatted_address
        elif data['status'] == 'ZERO_RESULTS':
            return None, None, "No results", address
        else:
            return None, None, f"API Error: {data['status']}", address
            
    except Exception as e:
        return None, None, f"Request Error: {str(e)}", address

def main():
    print("🗺️  Google Geocoding API Fix for New Mexico News Outlets")
    print("=" * 60)
    
    # Check for API key
    api_key = input("Enter your Google Geocoding API key: ").strip()
    if not api_key:
        print("❌ API key required. Get one at: https://developers.google.com/maps/documentation/geocoding/get-api-key")
        return
    
    # Load the current improved CSV
    csv_file = 'NM_NEWS_OUTLETS_GEOCODED_2025_IMPROVED.csv'
    print(f"\n📊 Loading {csv_file}")
    
    df = pd.read_csv(csv_file)
    print(f"✅ Loaded {len(df)} outlets")
    
    # Find outlets that need fixing (Fallback success or city-center coordinates)
    city_center_lat = 35.0841034
    city_center_lon = -106.650985
    
    # Identify outlets that need re-geocoding
    needs_fixing = df[
        (df['geocoding_status'] == 'Fallback success') |
        ((df['improved_latitude'] == city_center_lat) & (df['improved_longitude'] == city_center_lon))
    ].copy()
    
    print(f"\n🎯 Found {len(needs_fixing)} outlets that need re-geocoding")
    
    # Focus on Albuquerque outlets first
    albuquerque_outlets = needs_fixing[needs_fixing['Address_City'].str.contains('Albuquerque', na=False)]
    print(f"📍 Albuquerque outlets to fix: {len(albuquerque_outlets)}")
    
    for idx, row in albuquerque_outlets.iterrows():
        print(f"  - {row['OUTLET_NAME']}")
    
    if len(needs_fixing) == 0:
        print("✅ No outlets need fixing!")
        return
    
    # Ask for confirmation
    response = input(f"\nProceed to re-geocode {len(needs_fixing)} outlets with Google API? (y/n): ").lower()
    if response != 'y':
        print("❌ Cancelled by user")
        return
    
    print(f"\n🚀 Starting Google API re-geocoding...")
    
    fixed_count = 0
    api_calls = 0
    
    for idx, row in needs_fixing.iterrows():
        outlet_name = row['OUTLET_NAME']
        
        # Build full address
        address_parts = []
        if pd.notna(row['Address_Street']) and row['Address_Street'].strip():
            address_parts.append(row['Address_Street'].strip())
        if pd.notna(row['Address_City']) and row['Address_City'].strip():
            address_parts.append(row['Address_City'].strip())
        if pd.notna(row['Address_State']) and str(row['Address_State']).strip():
            address_parts.append(str(row['Address_State']).strip())
        if pd.notna(row['Address_Zip']) and str(row['Address_Zip']).strip():
            address_parts.append(str(row['Address_Zip']).strip())
        
        full_address = ', '.join(address_parts)
        
        print(f"\n📍 Re-geocoding: {outlet_name}")
        print(f"   Address: {full_address}")
        
        # Try geocoding with Google API
        lat, lon, status, used_address = geocode_with_google(full_address, api_key)
        api_calls += 1
        
        if lat and lon:
            # Update the dataframe
            df.at[idx, 'improved_latitude'] = lat
            df.at[idx, 'improved_longitude'] = lon
            df.at[idx, 'geocoding_status'] = status
            df.at[idx, 'full_address_used'] = used_address
            fixed_count += 1
            print(f"   ✅ Fixed: {lat}, {lon}")
            print(f"   📍 Google result: {used_address}")
        else:
            print(f"   ❌ Still failed: {status}")
        
        # Rate limiting for Google API (avoid hitting quotas)
        time.sleep(0.1)  # Google allows higher rates than Nominatim
        
        # Progress update
        if api_calls % 10 == 0:
            print(f"\n📊 Progress: {api_calls}/{len(needs_fixing)} calls, {fixed_count} fixed")
    
    # Save the updated CSV
    output_file = 'NM_NEWS_OUTLETS_GEOCODED_2025_GOOGLE_FIXED.csv'
    df.to_csv(output_file, index=False)
    
    print(f"\n🎉 Google geocoding fix complete!")
    print(f"   Fixed: {fixed_count}/{len(needs_fixing)} outlets")
    print(f"   API calls used: {api_calls}")
    print(f"   Output: {output_file}")
    
    print(f"\n📋 Next steps:")
    print(f"   1. Update run_update.py to use {output_file}")
    print(f"   2. Run the conversion script")
    print(f"   3. Check your map for improved accuracy!")
    
    # Show some examples of fixed Albuquerque outlets
    if fixed_count > 0:
        print(f"\n✅ Successfully fixed outlets:")
        fixed_outlets = df[df['geocoding_status'] == 'Success']
        albuquerque_fixed = fixed_outlets[fixed_outlets['Address_City'].str.contains('Albuquerque', na=False)]
        for idx, row in albuquerque_fixed.head(5).iterrows():
            print(f"   - {row['OUTLET_NAME']}: {row['improved_latitude']}, {row['improved_longitude']}")

if __name__ == "__main__":
    main()
