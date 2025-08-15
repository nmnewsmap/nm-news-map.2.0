import pandas as pd
import json

def update_outlets_geojson():
    """Update the outlets_geojson.js file with new Content Index format"""
    
    print("Updating outlets_geojson.js with new Content Index format...")
    
    # Load the updated CSV data
    df = pd.read_csv('NM_NEWS_OUTLETS_GEOCODED_2025_FIXED_UPDATED.csv')
    
    print(f"Loaded {len(df)} outlets from updated CSV")
    
    # Filter outlets with valid coordinates
    valid_outlets = df.dropna(subset=['improved_latitude', 'improved_longitude'])
    print(f"Outlets with valid coordinates: {len(valid_outlets)}")
    
    # Create GeoJSON features
    features = []
    
    for idx, row in valid_outlets.iterrows():
        # Handle missing values
        def safe_str(val):
            if pd.isna(val) or val == '*':
                return ""
            return str(val)
        
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    float(row['improved_longitude']),
                    float(row['improved_latitude'])
                ]
            },
            "properties": {
                "Outlet Name": safe_str(row['OUTLET_NAME']),
                "Website": safe_str(row['WEBSITE']),
                "Primary Medium": safe_str(row['PRIMARY_MEDIA']),
                "City Based": safe_str(row['City_Based']),
                "Region Based": safe_str(row['Region_Based']),
                "Frequency": safe_str(row['FREQ']),
                "Language": safe_str(row['LANGUAGE']),
                "Owner": safe_str(row['OWNER']),
                "Owner Type": safe_str(row['OWNER_TYPE']),
                "Facebook": safe_str(row['Social_Media_Facebook']),
                "Content Index": safe_str(row['NEWS_CONTENT_INDEX']),  # This now has the /3.00 format
                "Summary": safe_str(row['NEWS_CONTENT_REMARKS']),
                "Last Update": safe_str(row['LAST_UPDATE']),
                "Counties Served": safe_str(row['COUNTIES_SERVED'])
            }
        }
        features.append(feature)
    
    # Create the JavaScript file content
    js_content = f"window.outletsGeojsonFeatures = {json.dumps(features, indent=2)};"
    
    # Write to file
    with open('outlets_geojson.js', 'w') as f:
        f.write(js_content)
    
    print(f"Updated outlets_geojson.js with {len(features)} outlets")
    print("Content Index values now display in X.XX/3.00 format")
    
    # Show some examples of the updated format
    print("\nSample Content Index values in updated file:")
    sample_indices = [f['properties']['Content Index'] for f in features[:10] if f['properties']['Content Index']]
    for idx, content_index in enumerate(sample_indices[:5]):
        outlet_name = features[idx]['properties']['Outlet Name']
        print(f"  {outlet_name}: {content_index}")
    
    return features

def backup_original_file():
    """Create a backup of the original outlets_geojson.js file"""
    import shutil
    try:
        shutil.copy('outlets_geojson.js', 'outlets_geojson_backup.js')
        print("Created backup: outlets_geojson_backup.js")
    except FileNotFoundError:
        print("No existing outlets_geojson.js file to backup")

if __name__ == "__main__":
    # Create backup first
    backup_original_file()
    
    # Update the file
    updated_features = update_outlets_geojson()
    
    print("\nUpdate complete! The live map will now show Content Index values in X.XX/3.00 format.")
    print("Next step: Push changes to GitHub to update the live demo.")
