import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
from collections import Counter
import json
from matplotlib.colors import ListedColormap

def load_and_process_data():
    """Load news outlets data and county boundaries"""
    
    # Load news outlets data
    outlets_df = pd.read_csv('NM_NEWS_OUTLETS_GEOCODED_2025_FIXED.csv')
    
    # Load county boundaries
    counties_gdf = gpd.read_file('nm_counties_wgs84.geojson')
    
    print(f"Loaded {len(outlets_df)} news outlets")
    print(f"Loaded {len(counties_gdf)} counties")
    
    return outlets_df, counties_gdf

def calculate_media_density_by_county():
    """Calculate media outlet density by county using lat-lon coordinates"""
    
    outlets_df, counties_gdf = load_and_process_data()
    
    print("=== CALCULATING MEDIA DENSITY BY ACTUAL LOCATION ===")
    
    # Filter outlets with valid coordinates
    valid_coords = outlets_df[
        (pd.notna(outlets_df['improved_latitude'])) & 
        (pd.notna(outlets_df['improved_longitude']))
    ].copy()
    
    print(f"Outlets with valid coordinates: {len(valid_coords)}")
    
    # Convert outlets to GeoDataFrame
    outlets_gdf = gpd.GeoDataFrame(
        valid_coords,
        geometry=gpd.points_from_xy(valid_coords['improved_longitude'], valid_coords['improved_latitude']),
        crs='EPSG:4326'
    )
    
    # Ensure both datasets use the same CRS
    counties_gdf = counties_gdf.to_crs('EPSG:4326')
    
    # Perform spatial join to determine which county each outlet is in
    outlets_with_counties = gpd.sjoin(outlets_gdf, counties_gdf, how='left', predicate='within')
    
    # Count outlets per county
    county_counts = outlets_with_counties.groupby('NAME').size().reset_index(name='Media_Count')
    
    print("Media outlets per county (by location):")
    for idx, row in county_counts.iterrows():
        print(f"  {row['NAME']}: {row['Media_Count']}")
    
    # Check for outlets that didn't match any county
    unmatched = outlets_with_counties[pd.isna(outlets_with_counties['NAME'])]
    if len(unmatched) > 0:
        print(f"\nUnmatched outlets ({len(unmatched)}):")
        for idx, outlet in unmatched.iterrows():
            print(f"  {outlet['OUTLET_NAME']} at ({outlet['improved_latitude']}, {outlet['improved_longitude']})")
    
    print(f"\nFinal media density summary:")
    print(f"Total counties with media: {len(county_counts)}")
    print(f"Total media outlets located: {county_counts['Media_Count'].sum()}")
    
    return county_counts, counties_gdf

def create_choropleth_map():
    """Create choropleth map of media density by county"""
    
    density_df, counties_gdf = calculate_media_density_by_county()
    
    print("\n=== MERGING DATA ===")
    print("Counties in density data:", sorted(density_df['NAME'].unique()) if len(density_df) > 0 else [])
    print("Counties in shapefile:", sorted(counties_gdf['NAME'].unique()))
    
    # Merge the data using county NAME
    merged_gdf = counties_gdf.merge(density_df, on='NAME', how='left')
    
    # Fill NaN values with 0 (counties with no media outlets)
    merged_gdf['Media_Count'] = merged_gdf['Media_Count'].fillna(0)
    
    print(f"\nMerged data summary:")
    print(f"Counties with media outlets: {(merged_gdf['Media_Count'] > 0).sum()}")
    print(f"Counties with no media outlets: {(merged_gdf['Media_Count'] == 0).sum()}")
    
    # Create the choropleth map
    fig, ax = plt.subplots(1, 1, figsize=(12, 10))
    
    # Create custom colormap with white for zero values
    max_count = merged_gdf['Media_Count'].max()
    
    if max_count > 0:
        # Create blue color progression from light blue (almost white) to very dark blue
        # Scale from 0 to 35 outlets
        max_scale = max(35, int(max_count))
        
        # Generate blue color progression
        colors = []
        for i in range(max_scale + 1):
            if i == 0:
                colors.append('#FFFFFF')  # White for 0
            else:
                # Create blue progression from very light to very dark
                intensity = min(i / 35.0, 1.0)  # Scale to 0-1
                
                # Blue color progression
                if intensity <= 0.1:
                    # Very light blue (almost white)
                    blue_val = int(255 - (intensity * 10 * 20))  # 255 to 235
                    colors.append(f'#F0F8FF')  # Alice blue for very light
                elif intensity <= 0.2:
                    colors.append(f'#E6F3FF')  # Very light blue
                elif intensity <= 0.3:
                    colors.append(f'#CCE7FF')  # Light blue
                elif intensity <= 0.4:
                    colors.append(f'#99D6FF')  # Light medium blue
                elif intensity <= 0.5:
                    colors.append(f'#66C2FF')  # Medium blue
                elif intensity <= 0.6:
                    colors.append(f'#3399FF')  # Medium dark blue
                elif intensity <= 0.7:
                    colors.append(f'#0080FF')  # Dark blue
                elif intensity <= 0.8:
                    colors.append(f'#0066CC')  # Darker blue
                elif intensity <= 0.9:
                    colors.append(f'#004C99')  # Very dark blue
                else:
                    colors.append(f'#003366')  # Navy blue
        
        # Use only the colors we need
        colors_needed = min(len(colors), int(max_count) + 1)
        custom_cmap = ListedColormap(colors[:colors_needed])
        
        # Create bins for discrete coloring
        bins = list(range(int(max_count) + 2))  # 0, 1, 2, ..., max_count+1
        
        # Plot the choropleth with custom colormap
        merged_gdf.plot(
            column='Media_Count',
            ax=ax,
            cmap=custom_cmap,
            legend=True,
            legend_kwds={
                'label': 'Number of Media Outlets',
                'orientation': 'vertical',
                'shrink': 0.8
            },
            edgecolor='black',
            linewidth=0.5,
            vmin=0,
            vmax=max_count
        )
    else:
        # Fallback if no data
        merged_gdf.plot(
            ax=ax,
            color='white',
            edgecolor='black',
            linewidth=0.5
        )
    
    # Add county labels
    for idx, row in merged_gdf.iterrows():
        # Get centroid for label placement
        centroid = row.geometry.centroid
        
        # Add county name and count
        label = f"{row['NAME']}\n({int(row['Media_Count'])})"
        ax.annotate(
            label,
            xy=(centroid.x, centroid.y),
            ha='center',
            va='center',
            fontsize=8,
            bbox=dict(boxstyle='round,pad=0.2', facecolor='white', alpha=0.7)
        )
    
    # Set title and remove axis elements
    ax.set_title('New Mexico Media Outlet Density by County\n(Based on Physical Outlet Locations)', 
                 fontsize=16, fontweight='bold', pad=20)
    
    # Remove axis labels, ticks, and spines
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_xlabel('')
    ax.set_ylabel('')
    
    # Remove the box around the map
    for spine in ax.spines.values():
        spine.set_visible(False)
    
    # Remove grid for cleaner look
    ax.grid(False)
    
    # Tight layout
    plt.tight_layout()
    
    # Save the map
    plt.savefig('nm_media_density_choropleth.png', dpi=300, bbox_inches='tight')
    plt.savefig('nm_media_density_choropleth.pdf', bbox_inches='tight')
    
    print(f"\nMap saved as 'nm_media_density_choropleth.png' and 'nm_media_density_choropleth.pdf'")
    
    # Show summary statistics
    print("\n=== MEDIA DENSITY STATISTICS ===")
    print(f"Mean outlets per county: {merged_gdf['Media_Count'].mean():.2f}")
    print(f"Median outlets per county: {merged_gdf['Media_Count'].median():.2f}")
    print(f"Max outlets in a county: {merged_gdf['Media_Count'].max():.0f}")
    print(f"Counties with most outlets:")
    
    top_counties = merged_gdf.nlargest(5, 'Media_Count')[['NAME', 'Media_Count']]
    for idx, row in top_counties.iterrows():
        print(f"  {row['NAME']}: {int(row['Media_Count'])} outlets")
    
    plt.show()
    
    return merged_gdf

def create_interactive_map():
    """Create an interactive HTML map"""
    
    density_df, counties_gdf = calculate_media_density_by_county()
    
    # Merge data using county NAME
    merged_gdf = counties_gdf.merge(density_df, on='NAME', how='left')
    merged_gdf['Media_Count'] = merged_gdf['Media_Count'].fillna(0)
    
    # Create interactive HTML map
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>New Mexico Media Density Map</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            #map { height: 100vh; width: 100%; }
            .info { padding: 6px 8px; font: 14px/16px Arial, Helvetica, sans-serif; background: white; background: rgba(255,255,255,0.8); box-shadow: 0 0 15px rgba(0,0,0,0.2); border-radius: 5px; }
            .info h4 { margin: 0 0 5px; color: #777; }
            .legend { text-align: left; line-height: 18px; color: #555; }
            .legend i { width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
            var map = L.map('map').setView([34.5, -106.0], 7);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Add county data and styling here
            var geojsonData = """ + merged_gdf.to_json() + """;
            
            function getColor(count) {
                if (count == 0) return '#FFFFFF';
                
                var intensity = Math.min(count / 35.0, 1.0);
                
                if (intensity <= 0.1) return '#F0F8FF';
                else if (intensity <= 0.2) return '#E6F3FF';
                else if (intensity <= 0.3) return '#CCE7FF';
                else if (intensity <= 0.4) return '#99D6FF';
                else if (intensity <= 0.5) return '#66C2FF';
                else if (intensity <= 0.6) return '#3399FF';
                else if (intensity <= 0.7) return '#0080FF';
                else if (intensity <= 0.8) return '#0066CC';
                else if (intensity <= 0.9) return '#004C99';
                else return '#003366';
            }
            
            function style(feature) {
                return {
                    fillColor: getColor(feature.properties.Media_Count || 0),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }
            
            function highlightFeature(e) {
                var layer = e.target;
                layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                    layer.bringToFront();
                }
                info.update(layer.feature.properties);
            }
            
            function resetHighlight(e) {
                geojson.resetStyle(e.target);
                info.update();
            }
            
            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    mouseout: resetHighlight
                });
            }
            
            var geojson = L.geoJson(geojsonData, {
                style: style,
                onEachFeature: onEachFeature
            }).addTo(map);
            
            var info = L.control();
            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info');
                this.update();
                return this._div;
            };
            
            info.update = function (props) {
                this._div.innerHTML = '<h4>NM Media Density</h4>' +  (props ?
                    '<b>' + props.NAME + '</b><br />' + (props.Media_Count || 0) + ' media outlets'
                    : 'Hover over a county');
            };
            
            info.addTo(map);
            
            var legend = L.control({position: 'bottomright'});
            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 1, 2, 3, 5, 7, 10],
                    labels = [];
                
                for (var i = 0; i < grades.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                }
                return div;
            };
            legend.addTo(map);
        </script>
    </body>
    </html>
    """
    
    with open('nm_media_density_interactive.html', 'w') as f:
        f.write(html_content)
    
    print("Interactive map saved as 'nm_media_density_interactive.html'")

if __name__ == "__main__":
    print("Creating New Mexico Media Density Choropleth Map...")
    
    # Create static choropleth map
    merged_data = create_choropleth_map()
    
    # Create interactive map
    create_interactive_map()
    
    print("\nMap creation complete!")
