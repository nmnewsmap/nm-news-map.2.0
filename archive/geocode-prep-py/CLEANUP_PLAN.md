# Repository Cleanup Plan for Developer Collaboration

## 🔒 ESSENTIAL FILES (DO NOT DELETE)

### Core Application Files
- `nm_news_map_interactive.html` - **Main map application**
- `outlets_geojson.js` - **Current outlet data (115KB)**
- `nm_counties_wgs84.geojson` - **County boundaries**
- `nm_counties_with_census.geojson` - **Counties with census data**

### Configuration & Documentation
- `README.md` - **Project documentation**
- `netlify.toml` - **Deployment configuration**
- `windsurf_deployment.yaml` - **Deployment settings**
- `.gitignore` - **Version control exclusions**
- `requirements.txt` - **Python dependencies**

### Current Data Source
- `NM_NEWS_OUTLETS_GEOCODED_2025_GOOGLE_FIXED.csv` - **Final geocoded data**

## 🗑️ FILES TO REMOVE (Development Artifacts)

### Duplicate/Backup Data Files
- `NM_NEWS_OUTLETS_GEOCODED_2025 (1).xlsx` - **Excel duplicate**
- `NM_NEWS_OUTLETS_GEOCODED_2025_FIXED.csv` - **Intermediate version**
- `NM_NEWS_OUTLETS_GEOCODED_2025_FIXED_UPDATED.csv` - **Intermediate version**
- `NM_NEWS_OUTLETS_GEOCODED_2025_IMPROVED.csv` - **Intermediate version**
- `outlets_geojson_backup.js` - **Backup file (141KB)**

### Generated Images/PDFs (Can be regenerated)
- `NM Local News Outlet Density.png` - **Static map image**
- `nm_content_index_map.pdf` - **PDF export**
- `nm_content_index_map.png` - **PNG export**
- `nm_media_density_choropleth.pdf` - **PDF export**
- `nm_media_density_choropleth.png` - **PNG export**

### Development/Test Files
- `test_county_geojson.html` - **Test file**
- `nm_content_index_interactive.html` - **Alternative version**
- `nm_media_density_interactive.html` - **Alternative version**

## 🔧 UTILITY SCRIPTS (Keep for maintenance)
- `run_update.py` - **Main update script**
- `update_live_map.py` - **Live map updater**
- `update_map_data.py` - **Data updater**
- `fetch_census_data.py` - **Census data fetcher**
- `google_geocoder_fix.py` - **Geocoding improvements**
- `improve_geocoding.py` - **Geocoding enhancements**
- `fix_failed_geocoding.py` - **Geocoding fixes**
- `create_content_index_map.py` - **Content index generator**
- `create_media_density_choropleth.py` - **Density map generator**
- `analyze_media_types.py` - **Analysis script**
- `update_content_index.py` - **Content index updater**

## 📋 CLEANUP STEPS

### Step 1: Create Backup Branch
```bash
git checkout -b backup-before-cleanup
git push origin backup-before-cleanup
```

### Step 2: Remove Non-Essential Files
```bash
# Remove duplicate data files
rm "NM_NEWS_OUTLETS_GEOCODED_2025 (1).xlsx"
rm NM_NEWS_OUTLETS_GEOCODED_2025_FIXED.csv
rm NM_NEWS_OUTLETS_GEOCODED_2025_FIXED_UPDATED.csv
rm NM_NEWS_OUTLETS_GEOCODED_2025_IMPROVED.csv
rm outlets_geojson_backup.js

# Remove generated images (can be regenerated)
rm "NM Local News Outlet Density.png"
rm nm_content_index_map.pdf
rm nm_content_index_map.png
rm nm_media_density_choropleth.pdf
rm nm_media_density_choropleth.png

# Remove test/alternative files
rm test_county_geojson.html
rm nm_content_index_interactive.html
rm nm_media_density_interactive.html
```

### Step 3: Update .gitignore
Add these patterns to prevent future clutter:
```
# Generated images and PDFs
*.png
*.pdf
!README_images/

# Backup files
*_backup.*
*_BACKUP.*

# Excel files (use CSV instead)
*.xlsx
*.xls

# Test files
test_*.html
*_test.*
```

### Step 4: Commit Cleanup
```bash
git add .
git commit -m "Clean repository for developer collaboration

- Remove duplicate data files
- Remove generated images (can be regenerated)
- Remove test/development files
- Update .gitignore for cleaner future commits"
git push origin main
```

## 📁 FINAL CLEAN STRUCTURE

```
MAP 1.0/
├── nm_news_map_interactive.html    # Main application
├── outlets_geojson.js              # Current data
├── nm_counties_wgs84.geojson       # County boundaries
├── nm_counties_with_census.geojson # Census data
├── NM_NEWS_OUTLETS_GEOCODED_2025_GOOGLE_FIXED.csv # Source data
├── README.md                       # Documentation
├── netlify.toml                    # Deployment config
├── windsurf_deployment.yaml        # Deployment settings
├── requirements.txt                # Dependencies
├── .gitignore                      # Git exclusions
└── scripts/                        # Utility scripts
    ├── run_update.py
    ├── update_live_map.py
    ├── update_map_data.py
    ├── fetch_census_data.py
    └── [other utility scripts]
```

## ⚠️ SAFETY NOTES

1. **Backup First**: The backup branch ensures you can recover if needed
2. **Test After Cleanup**: Verify the live map still works
3. **Keep Scripts**: Utility scripts are valuable for maintenance
4. **Document Changes**: Update README if structure changes significantly

This cleanup reduces repository size by ~60% while preserving all essential functionality.
