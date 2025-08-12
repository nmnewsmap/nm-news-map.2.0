# New Mexico Local News Map

A comprehensive interactive map displaying 139 local news outlets across New Mexico with advanced demographic analysis capabilities.

## 🌐 Live Map
**https://nm-news-outlets-map.windsurf.build**

## ✨ Features

### 📍 Interactive News Outlet Mapping
- **139 Accurately Geocoded Outlets** - Street-level precision using Google Geocoding API
- **Color-Coded by Media Type** - Digital (Blue), Print (Green), Radio (Orange), Television (Red), Multiplatform (Purple)
- **Smart Marker Clustering** - Dynamic offset system prevents overlapping markers
- **Zoom-Adaptive Sizing** - Markers scale appropriately at all zoom levels

### 🎛️ Interactive Legend & Filtering
- **Click-to-Filter** - Filter markers by media type (Digital, Print, Radio, TV, Multiplatform)
- **Show All Option** - Display all 139 outlets with counts
- **Professional Styling** - Transparent panels with glass effect
- **Real-time Updates** - Instant marker visibility changes

### 📊 Census Data Overlays
- **7 Demographic Layers** with professional choropleth mapping:
  - Population Size
  - Median Household Income  
  - Private Business (Workers)
  - College Education (%)
  - Median Age
  - Nonwhite Population (%)
  - Homes with Broadband (%)
- **2022 American Community Survey Data** - Latest available census statistics
- **Dynamic Color Legends** - Professional 8-color gradients with value ranges
- **Proper Attribution** - U.S. Census Bureau citation included

### 💬 Enhanced Popups
- **Comprehensive Information** - Outlet name, website, media type, location, staffing, demographics
- **Clickable Links** - Direct access to outlet websites and social media
- **Persistent Interaction** - Popups remain open for link clicking
- **Clean Data Formatting** - No decimal places in years, proper currency formatting

### 🗺️ County Integration
- **Boundary Visualization** - Dark county outlines for geographic context
- **Coverage Highlighting** - Counties served by each outlet highlighted in matching colors
- **33 New Mexico Counties** - Complete statewide coverage

### 🎨 Professional Interface
- **Cohesive Design** - Stacked panels in upper right with consistent styling
- **50% Transparency** - Map markers visible through control panels
- **Backdrop Blur Effect** - Modern glass aesthetic
- **Mobile Responsive** - Works on desktop, tablet, and mobile devices

## 📁 Project Structure

### Essential Files:
- `nm_news_map_interactive.html` - Main interactive map application
- `outlets_geojson.js` - News outlet data in GeoJSON format
- `nm_counties_wgs84.geojson` - New Mexico county boundaries (WGS84)
- `nm_counties_with_census.geojson` - Counties with embedded census data
- `NM_NEWS_OUTLETS_GEOCODED_2025_GOOGLE_FIXED.csv` - Final geocoded outlet data

### Data Processing Scripts:
- `run_update.py` - Convert Excel data to GeoJSON format
- `fetch_census_data.py` - Download and process U.S. Census data
- `google_geocoder_fix.py` - Improve geocoding accuracy using Google API
- `improve_geocoding.py` - Street-level geocoding enhancement
- `fix_failed_geocoding.py` - Address geocoding failures

### Configuration:
- `requirements.txt` - Python dependencies
- `netlify.toml` - Netlify deployment configuration
- `.gitignore` - Version control exclusions
- `windsurf_deployment.yaml` - Deployment settings

## 🚀 Quick Start

### View the Live Map:
Visit **https://nm-news-outlets-map.windsurf.build**

### Local Development:
1. **Start local server**: `python3 -m http.server 8000`
2. **Open browser**: `http://localhost:8000/nm_news_map_interactive.html`
3. **Explore features**: Try legend filtering and census overlays

### Update Data:
1. **Place new Excel file** in project directory
2. **Run conversion**: `python3 run_update.py`
3. **Refresh map** to see updated data

## 🔧 Technical Details

### Dependencies:
- **Mapbox GL JS** - Interactive mapping library
- **Python 3.x** - Data processing scripts
- **Pandas** - Data manipulation
- **Requests** - API interactions

### APIs Used:
- **Mapbox API** - Base map tiles and styling
- **Google Geocoding API** - Street-level address geocoding
- **U.S. Census Bureau API** - Demographic data (2022 ACS 5-Year Estimates)

### Browser Compatibility:
- Chrome, Firefox, Safari, Edge (modern versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled

## 📈 Data Sources

### News Outlets:
- **Primary Source**: New Mexico news outlet database (2025)
- **Geocoding**: Google Geocoding API for street-level accuracy
- **Verification**: Manual review and correction of failed geocodes

### Census Data:
- **Source**: U.S. Census Bureau
- **Dataset**: 2022 American Community Survey 5-Year Estimates
- **Coverage**: All 33 New Mexico counties
- **Variables**: Population, income, education, age, race, broadband access

### Geographic Data:
- **County Boundaries**: U.S. Census Bureau TIGER/Line Shapefiles
- **Coordinate System**: WGS84 (EPSG:4326)
- **Format**: GeoJSON for web compatibility

## 🎯 Use Cases

### Research & Analysis:
- **Media Landscape Studies** - Analyze outlet distribution and coverage patterns
- **Demographic Analysis** - Correlate media presence with community characteristics
- **Digital Divide Research** - Compare digital outlets with broadband access
- **Market Analysis** - Understand competitive media markets

### Professional Applications:
- **Journalism Education** - Teaching media geography and market analysis
- **Policy Development** - Informing media policy and community development
- **Grant Applications** - Supporting funding requests with demographic data
- **Community Planning** - Understanding local information ecosystems

## 🔄 Deployment

The map is automatically deployed to Netlify at **https://nm-news-outlets-map.windsurf.build**

### Redeploy Updates:
Changes to local files can be redeployed using the existing Netlify configuration.

## 📞 Support

For technical issues or feature requests, refer to the project documentation or contact the development team.

---

**New Mexico Local News Map** - Comprehensive interactive mapping of local news outlets with demographic context for research and analysis.
