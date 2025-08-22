#!/usr/bin/env python3
import pandas as pd
import json
import re
import os

def relabel(col):
    """Elegant relabeling: remove underscores, fix case, handle special names"""
    special = {
        'OUTLET_NAME': 'Outlet Name',
        'WEBSITE': 'Website',
        'PRIMARY_MEDIA': 'Primary Medium',
        'FREQ': 'Frequency',
        'MONTHLY_USERS': 'Monthly Users',
        'NEWS_STAFFING_FTES': 'News Staff (FTEs)',
        'NEWS_CONTRIB_FTES': 'News Contributors (FTEs)',
        'NEWS_CONTENT_INDEX': 'Content Index',
        'NEWS_CONTENT_REMARKS': 'Summary',
        'Year_Founded': 'Year Founded',
        'LAST_UPDATE': 'Last Update',
        'OWNER': 'Owner',
        'OWNER_TYPE': 'Owner Type',
        'TRANSLATION?': 'Translation',
    }
    if col in special:
        return special[col]
    # Social media columns
    if col.startswith('Social_Media_'):
        plat = col.replace('Social_Media_', '')
        plat = plat.replace('_', ' ').title()
        return plat
    # General relabel: replace underscores, fix case
    label = col.replace('_', ' ').title()
    label = re.sub(r'\bFtes\b', 'FTEs', label)
    return label

def safe_float(value):
    """Safely convert value to float, return None if not possible"""
    if pd.isna(value) or value == '*' or value == '':
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

# Execute the conversion
print("🗺️  Updating New Mexico News Map with new 2025 data...")

# File paths (in current MAP 1.0 directory)
csv_file = 'NM_NEWS_OUTLETS_GEOCODED_2025_GOOGLE_FIXED.csv'
output_js = 'outlets_geojson.js'

try:
    # Load improved CSV file with street-level coordinates
    print(f"📊 Loading improved CSV file: {csv_file}")
    df = pd.read_csv(csv_file)
    print(f"✅ Loaded {len(df)} outlets")
    
    # Find coordinate columns - use the improved coordinates from geocoding
    lat_col = 'improved_latitude'
    lon_col = 'improved_longitude'
    
    print(f"🌍 Using coordinate columns: lat='{lat_col}', lon='{lon_col}'")
    
    # Exclude coordinate and address columns from properties
    exclude_cols = [
        'Address_Street', 'Address_City', 'Address_County', 'Address_State', 'Address_Zip',
        'latitude', 'longitude', 'improved_latitude', 'improved_longitude', 
        'geocoding_status', 'full_address_used'
    ]
    
    # Build label map
    label_map = {col: relabel(col) for col in df.columns if col not in exclude_cols}
    
    # Create GeoJSON features
    features = []
    skipped = 0
    
    for idx, row in df.iterrows():
        # Get coordinates using safe conversion
        lat = safe_float(row[lat_col])
        lon = safe_float(row[lon_col])
        
        if lat is None or lon is None:
            skipped += 1
            outlet_name = row.get('OUTLET_NAME', f'Row {idx}')
            continue
        
        # Build properties
        properties = {}
        for col, label in label_map.items():
            if col in df.columns:
                value = row[col]
                if pd.notna(value) and value != '*':
                    properties[label] = str(value)
        
        # Create GeoJSON feature
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [lon, lat]
            },
            "properties": properties
        }
        
        features.append(feature)
    
    print(f"✅ Created {len(features)} GeoJSON features")
    if skipped > 0:
        print(f"⚠️  Skipped {skipped} outlets with missing coordinates")
    
    # Write JavaScript file
    js_content = f"window.outletsGeojsonFeatures = {json.dumps(features, indent=2)};"
    
    with open(output_js, 'w') as f:
        f.write(js_content)
    
    print(f"🎉 Successfully updated {output_js}")
    print("🔄 Your map is now ready! Open nm_news_map_interactive.html in your browser")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
