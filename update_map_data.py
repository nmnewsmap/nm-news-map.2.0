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
        'PRIMARY_MEDIUM': 'Primary Medium',
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

def main():
    print("🗺️  Updating New Mexico News Map with new data...")
    
    # File paths
    excel_file = '/Users/mmmacbook/CascadeProjects/News Map/NM_NEWS_OUTLETS_GEOCODED_2025 (1).xlsx'
    output_js = '/Users/mmmacbook/CascadeProjects/News Map/outlets_geojson.js'
    
    # Check if Excel file exists
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        return
    
    try:
        # Load Excel file
        print(f"📊 Loading Excel file: {excel_file}")
        df = pd.read_excel(excel_file)
        print(f"✅ Loaded {len(df)} outlets")
        print(f"📋 Columns found: {len(df.columns)} columns")
        
        # Show first few column names for debugging
        print("🔍 First 10 columns:", list(df.columns[:10]))
        
        # Find coordinate columns
        lat_col = None
        lon_col = None
        
        for col in df.columns:
            if 'lat' in col.lower() and lat_col is None:
                lat_col = col
            if ('lon' in col.lower() or 'lng' in col.lower()) and lon_col is None:
                lon_col = col
        
        print(f"🌍 Coordinate columns: lat='{lat_col}', lon='{lon_col}'")
        
        if not lat_col or not lon_col:
            print("❌ Could not find latitude/longitude columns")
            return
        
        # Exclude coordinate and address columns from properties
        exclude_cols = [
            'Address_Street', 'Address_City', 'Address_County', 'Address_State', 'Address_Zip',
            lat_col, lon_col
        ]
        
        # Build label map
        label_map = {col: relabel(col) for col in df.columns if col not in exclude_cols}
        
        # Create GeoJSON features
        features = []
        skipped = 0
        
        for idx, row in df.iterrows():
            # Get coordinates
            lat = row[lat_col] if pd.notna(row[lat_col]) else None
            lon = row[lon_col] if pd.notna(row[lon_col]) else None
            
            if lat is None or lon is None:
                skipped += 1
                continue
            
            # Build properties
            properties = {}
            for col, label in label_map.items():
                if col in df.columns:
                    value = row[col]
                    if pd.notna(value):
                        properties[label] = str(value)
            
            # Create GeoJSON feature
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(lon), float(lat)]
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
        print("🔄 Refresh your browser to see the updated map!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
