# New Mexico Local News Map

A comprehensive interactive map displaying local news outlets and demographic data across New Mexico.

**View the full report with live map at** https://www.nmnewsmap.org

**View the original GitHub Repository and Guide at** https://github.com/nmnewsmap/nm-news-map.2.0

**Version:** 2.0.0


## Features

- **Map Markers**: Markers representing local entities can be positioned on the map based on their central location. Clicking on markers provides more in depth data about each entity.
- **Dynamic Clustering**: To keep the map visually readable, markers are clustered together if they are within a specified proximity. Clusters dynamically update as the map zooms in and out. 
- **Marker Filtering**: Filters can be added to the map's menu to give options for showing or hiding markers by category.
- **Map Overlays**: Additional overlays can be applied to the map in addition to the markers to display demographic or regional data for specific regions, such as boundaries and census data.


## Use Cases

### Research & Analysis:
- **Media Landscape Studies:** Analyze news outlet distribution and coverage patterns
- **Demographic Analysis:** Correlate media presence with community characteristics
- **Digital Divide Research:** Compare digital outlets with broadband access
- **Market Analysis:** Understand competitive media markets

### Professional Applications:
- **Journalism Education:** Teaching media geography and market analysis
- **Policy Development:** Informing media policy and community development
- **Grant Applications:** Supporting funding requests with demographic data
- **Community Planning:** Understanding local information ecosystems


## Technical Configuration

### Configuration Files

There are two configuration files that are used to customize the application:
1. **Instance Configuration:** (File: config/instance.js) Contains settings that may be modified per implementation to apply unique data and a custom user experience. Comments are provided within this file to describe each configuration setting in detail.
2. **System Configuration:** (File: config/system.js) Contains core system settings that do not need to be modified for each implementation, but are available to provide deeper customization if needed.

### Data Layers

This application supports two types of data layers, a Marker Layer and a Regions Layer. Each layer is briefly described in the list below, and their technical schema and implementation guidelines are documented in the Instance Configuration file.
1. **Marker Layer:** Contains the geocoded markers to be positioned on the map. Markers can be clustered, controlled by filters, and have detailed popup windows to display additional information. This layer may be turned on or off by toggling the active filters on the map menu.
2. **Regions Layer:** Contains the regional properties for map overlays for tile labeling and styling. Layers may include boundary definitions, region names, and color overlays based on categories and values (e.g., population data). This layer may be turned on or off by toggling the active overlays on the map menu.

Overall, each of the two layers has their own data file, which is contains valid GeoJSON, including "Feature Collection" type and an array of one or more features of (i.e., "type": "Feature") and one or more items in the "properties" array.


## Contact Information & Support

For questions and support, contact the project team at https://www.nmnewsmap.org/contact

---
