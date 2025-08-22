import pandas as pd
import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import ListedColormap

def create_content_index_map():
    """Create a map showing outlets with their updated Content Index values"""
    
    print("Creating Content Index Map with Updated Format...")
    
    # Load the updated outlets data
    outlets_df = pd.read_csv('NM_NEWS_OUTLETS_GEOCODED_2025_FIXED_UPDATED.csv')
    print(f"Loaded {len(outlets_df)} outlets with updated Content Index format")
    
    # Load county boundaries
    counties_gdf = gpd.read_file('nm_counties_wgs84.geojson')
    print(f"Loaded {len(counties_gdf)} counties")
    
    # Filter outlets with valid coordinates
    valid_outlets = outlets_df.dropna(subset=['improved_latitude', 'improved_longitude'])
    print(f"Outlets with valid coordinates: {len(valid_outlets)}")
    
    # Create the map
    fig, ax = plt.subplots(1, 1, figsize=(14, 12))
    
    # Plot county boundaries
    counties_gdf.plot(ax=ax, color='lightgray', edgecolor='white', linewidth=0.5)
    
    # Plot outlets as points, colored by content index value
    # Extract numeric values for coloring
    def extract_numeric_value(index_str):
        if pd.isna(index_str) or not isinstance(index_str, str):
            return np.nan
        try:
            return float(index_str.split('/')[0])
        except:
            return np.nan
    
    valid_outlets['numeric_index'] = valid_outlets['NEWS_CONTENT_INDEX'].apply(extract_numeric_value)
    valid_outlets_with_index = valid_outlets.dropna(subset=['numeric_index'])
    
    # Create color mapping for content index values
    unique_values = sorted(valid_outlets_with_index['numeric_index'].unique())
    colors = plt.cm.viridis(np.linspace(0, 1, len(unique_values)))
    
    # Plot points for each content index value
    for i, value in enumerate(unique_values):
        subset = valid_outlets_with_index[valid_outlets_with_index['numeric_index'] == value]
        ax.scatter(subset['improved_longitude'], subset['improved_latitude'], 
                  c=[colors[i]], s=60, alpha=0.8, edgecolors='white', linewidth=0.5,
                  label=f"{value:.2f}/3.00 ({len(subset)} outlets)")
    
    # Add labels for major outlets
    major_outlets = valid_outlets_with_index[valid_outlets_with_index['numeric_index'] >= 2.5]
    for idx, row in major_outlets.iterrows():
        ax.annotate(f"{row['OUTLET_NAME']}\n{row['NEWS_CONTENT_INDEX']}", 
                   xy=(row['improved_longitude'], row['improved_latitude']),
                   xytext=(5, 5), textcoords='offset points',
                   fontsize=8, ha='left',
                   bbox=dict(boxstyle='round,pad=0.3', facecolor='white', alpha=0.8))
    
    # Styling
    ax.set_title('New Mexico News Outlets by Content Index\n(Updated Format: Score/3.00)', 
                 fontsize=16, fontweight='bold', pad=20)
    
    # Remove axis elements
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_xlabel('')
    ax.set_ylabel('')
    
    # Remove the box around the map
    for spine in ax.spines.values():
        spine.set_visible(False)
    
    # Remove grid
    ax.grid(False)
    
    # Add legend
    ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left', fontsize=10)
    
    # Tight layout
    plt.tight_layout()
    
    # Save the map
    plt.savefig('nm_content_index_map.png', dpi=300, bbox_inches='tight')
    plt.savefig('nm_content_index_map.pdf', bbox_inches='tight')
    
    print(f"\nContent Index Map saved as 'nm_content_index_map.png' and 'nm_content_index_map.pdf'")
    
    # Show statistics
    print("\n=== CONTENT INDEX STATISTICS ===")
    print(f"Outlets with Content Index data: {len(valid_outlets_with_index)}")
    print(f"Mean Content Index: {valid_outlets_with_index['numeric_index'].mean():.2f}")
    print(f"Median Content Index: {valid_outlets_with_index['numeric_index'].median():.2f}")
    
    print("\nContent Index Distribution:")
    index_counts = valid_outlets_with_index['NEWS_CONTENT_INDEX'].value_counts().sort_index()
    for index_val, count in index_counts.items():
        print(f"  {index_val}: {count} outlets")
    
    plt.show()
    
    return valid_outlets_with_index

def create_simple_interactive_map():
    """Create a simple HTML map showing content index values without folium"""
    
    # Load the updated outlets data
    outlets_df = pd.read_csv('NM_NEWS_OUTLETS_GEOCODED_2025_FIXED_UPDATED.csv')
    valid_outlets = outlets_df.dropna(subset=['improved_latitude', 'improved_longitude'])
    
    # Create HTML content
    html_content = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>NM Content Index Map</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    </head>
    <body>
        <div id="map" style="width: 100%; height: 600px;"></div>
        <script>
            var map = L.map('map').setView([34.5, -106.0], 7);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            function getColor(indexStr) {
                if (!indexStr || indexStr === 'nan') return 'gray';
                try {
                    var value = parseFloat(indexStr.split('/')[0]);
                    if (value >= 2.5) return 'red';
                    else if (value >= 2.0) return 'orange';
                    else if (value >= 1.5) return 'yellow';
                    else if (value >= 1.0) return 'lightgreen';
                    else return 'green';
                } catch (e) {
                    return 'gray';
                }
            }
            
            var outlets = ''' + valid_outlets[['OUTLET_NAME', 'NEWS_CONTENT_INDEX', 'PRIMARY_MEDIA', 'Address_City', 'Address_County', 'improved_latitude', 'improved_longitude']].to_json(orient='records') + ''';
            
            outlets.forEach(function(outlet) {
                L.circleMarker([outlet.improved_latitude, outlet.improved_longitude], {
                    radius: 8,
                    fillColor: getColor(outlet.NEWS_CONTENT_INDEX),
                    color: 'white',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).bindPopup('<b>' + outlet.OUTLET_NAME + '</b><br>' +
                           'Content Index: ' + outlet.NEWS_CONTENT_INDEX + '<br>' +
                           'Media Type: ' + outlet.PRIMARY_MEDIA + '<br>' +
                           'City: ' + outlet.Address_City + '<br>' +
                           'County: ' + outlet.Address_County).addTo(map);
            });
            
            // Add legend
            var legend = L.control({position: 'bottomleft'});
            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                div.innerHTML = '<h4>Content Index Scale</h4>' +
                    '<i style="background:red; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; border-radius: 50%;"></i> 2.50-3.00/3.00<br>' +
                    '<i style="background:orange; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; border-radius: 50%;"></i> 2.00-2.49/3.00<br>' +
                    '<i style="background:yellow; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; border-radius: 50%;"></i> 1.50-1.99/3.00<br>' +
                    '<i style="background:lightgreen; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; border-radius: 50%;"></i> 1.00-1.49/3.00<br>' +
                    '<i style="background:green; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7; border-radius: 50%;"></i> <1.00/3.00<br>';
                div.style.background = 'white';
                div.style.padding = '6px 8px';
                div.style.border = '2px solid gray';
                div.style.borderRadius = '5px';
                return div;
            };
            legend.addTo(map);
        </script>
    </body>
    </html>
    '''
    
    # Save HTML file
    with open('nm_content_index_interactive.html', 'w') as f:
        f.write(html_content)
    
    print("Interactive Content Index map saved as 'nm_content_index_interactive.html'")
    
    return html_content

if __name__ == "__main__":
    # Create static map
    outlets_data = create_content_index_map()
    
    # Create interactive map
    interactive_map = create_simple_interactive_map()
    
    print("\nContent Index map creation complete!")
