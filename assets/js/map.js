// Initialize map configuration
let base_dir = 'assets/data/';

let config = {
    data: {
        counties: base_dir + 'nm_counties_wgs84.geojson',
        census: base_dir + 'nm_counties_with_census.geojson',
    },
    colors: {
        medium: {
            digital: '#2196f3', //Bright blue
            print: '#4caf50', //Green
            radio: '#ff9800', //Orange
            television: '#f44336', //Red
            tv: '#f44336', //Red
            multiplatform: '#9c27b0', // Purple
            default: '#000', //Purple
        }
    }
};

/**
 * Data Schema Definitions
 * 
 * Each schema is an array of sections.
 * Each section includes:
 * -- id: The unique ID of the section.
 * -- title: Optional; The title for the section.
 * -- properties: An array of properties for the section.
 * 
 * Each property includes:
 * -- id: The unique ID or slug for the property.
 * -- column: The column name of the property in the data file.
 * -- type: Optional; The formatting type to apply to the property value; Options: "text" (default), "int", "url", "index"
 * -- description: Optional; The explainer for the property; Displays as a tooltip.
 */

let schema = [
    {
        id: 'outlet_name',
        column: 'OUTLET_NAME',
        label: 'Outlet Name',
    },
    {
        id: 'website',
        column: 'WEBSITE',
        label: 'Website',
        type: 'website',
    },
    {
        id: 'medium_primary',
        column: 'PRIMARY_MEDIA',
        label: 'Primary Media',
    },
    {
        id: 'city_based',
        column: 'City_Based',
        label: 'City Based',
        description: "The city of the outlet's office headquarters",
    },
    {
        id: 'frequency',
        column: 'FREQ',
        label: 'Frequency',
    },
    {
        id: 'language',
        column: 'LANGUAGE',
        label: 'Language',
    },
    {
        id: 'year_founded',
        column: 'Year_Founded',
        label: 'Year Founded',
    },
    {
        id: 'owner_name',
        column: 'OWNER',
        label: 'Owner',
    },
    {
        id: 'owner_type',
        county: 'OWNER_TYPE',
        label: 'Owner Type',
    },
    {
        id: 'social_facebook',
        column: 'Social_Media_Facebook',
        label: 'Facebook',
        type: 'social',
    },
    {
        id: 'social_instagram',
        column: 'Social_Media_Instagram',
        label: 'Instagram',
        type: 'social',
    },
    {
        id: 'social_youtube',
        column: 'Social_Media_YouTube',
        label: 'YouTube',
        type: 'social',
    },
    {
        id: 'social_x',
        column: 'Social_Media_X',
        label: 'X',
        type: 'social',
    },
    {
        id: 'social_tiktok',
        column: 'Social_Media_TikTok',
        label: 'TikTok',
        type: 'social',
    },
    {
        id: 'social_other',
        column: 'Social_Media_Other',
        label: 'Other',
        type: 'social',
    },
    {
        id: 'cil_number',
        column: 'COMMUNITY_IMPACT_LVL',
        label: 'Community Impact Level',
    },
    {
        id: 'cil_description',
        column: 'IMPACT_LVL_DESCRIPTION',
        label: 'Community Impact Level Description',
    },
    {
        id: 'summary',
        column: 'Summary',
    },
    {
        id: 'counties_served',
        column: 'COUNTIES_SERVED',
        label: 'Counties Served'
    },
    {
        id: 'updated_at',
        column: 'Last Update',
        label: 'Updated:'
    },
];

// Initialize map
mapboxgl.accessToken = 'pk.eyJ1Ijoibm1uZXdzbWFwIiwiYSI6ImNtYjVkbmEwZDFlOXIyam9sM21mcDZsbDgifQ.LDcxjUWCHp-XRBbD5IbL3A';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-106.2485, 34.5199], // New Mexico
    zoom: 5, // State level
    minZoom: 5,
    maxZoom: 10,
    attributionControl: false,
    maxBounds: [
        [-110.301, 29.741],
        [-101.205, 37.828]
    ],
});

// Animate initial map view to show entire state
map.fitBounds([[-102.999,31.415], [-108.601,36.902]], {
    padding: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    },
});

// Map controls
const nav = new mapboxgl.NavigationControl({
    showCompass: false,
});
map.addControl(nav, 'top-right');

// disable map rotation using right click + drag
map.dragRotate.disable();

// disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();

/*
// Map attribution
map.addControl(new mapboxgl.AttributionControl({
    compact: true,
    customAttribution: 'Map design by Bloom Labs'
}));
*/

/**
 * Load Map
 */
map.on('load', function() {

    // Initialize feature collection for outlet data
    const outletData = {
      "type": "FeatureCollection",
      "features": []
    };

    // Load outlet data
    outletData.features = window.outletsGeojsonFeatures;

    // Load counties boundary source
    map.addSource('counties', {
      type: 'geojson',
      data: config.data.counties
    });

    // Load census-enhanced counties source
    map.addSource('census-counties', {
      type: 'geojson',
      data: config.data.census
    });

    // Initialize
    let allCountyNames = []; // Stores all county names
    let countiesLoaded = false; // Store loaded counties

    // Fetch counties GeoJSON
    fetch(config.data.counties)
      .then(response => response.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          // Store all county names
          allCountyNames = data.features
            .map(feature => feature.properties.NAME)
            .filter(name => name);
          
          console.log(`Direct fetch: Loaded ${allCountyNames.length} NM county names:`, allCountyNames);
          countiesLoaded = true;
        }
      })
      .catch(error => {
        console.error('Error fetching county GeoJSON directly:', error);
      });

    /**
     * getAllCountyNames
     * Helper function to get all county names (even if not loaded yet)
     */
    function getAllCountyNames() {
      // If already loaded, return the cached list
      if (countiesLoaded && allCountyNames.length > 0) {
        return [...allCountyNames];
      }
      
      console.log("Counties not loaded yet via direct fetch");
      return []; // Return empty array if we can't get the names yet
    }// getAllCountyNames

    /**
     * Load Map Source Data
     * Once the county GeoJSON is loaded, store all county names
     */
    map.on('sourcedata', function(e) {
      if (e.sourceId === 'counties' && e.isSourceLoaded && !countiesLoaded) {
        console.log('County GeoJSON loaded successfully');
        console.log('County source data:', map.getSource('counties'));

        // Extract all county names when source is loaded
        try {
          const source = map.getSource('counties');
          if (source._data && source._data.features) {
            allCountyNames = source._data.features
              .map(feature => feature.properties.NAME)
              .filter(name => name); // filter out any undefined/null

            console.log(`Loaded ${allCountyNames.length} NM county names:`, allCountyNames);
            
            // Mark counties as loaded
            countiesLoaded = true;
          }
        } catch (err) {
          console.error('Error extracting county names:', err);
        }
      }
    }); // on.sourcedata

    /**
     * County & Census Highlights
     */
    map.addLayer({
      id: 'counties-fill',
      type: 'fill',
      source: 'counties',
      paint: {
        'fill-color': '#b3d8f6', // Default: light blue
        'fill-opacity': 0.35
      },
      filter: ['in', 'NAME', '']
    });

    map.addLayer({
      id: 'census-overlay',
      type: 'fill',
      source: 'census-counties',
      paint: {
        'fill-color': [
          'case',
          ['==', ['get', 'Population Size'], null], '#f0f0f0', // Default for missing data
          '#f0f0f0' // Default color when no overlay is active
        ],
        'fill-opacity': 0.7
      },
      layout: {
        'visibility': 'none'
      }
    });

    // Add error handling for the county source
    map.on('error', function(e) {
      console.error('Map error:', e);
    });

    // Add county boundary outlines
    try {
      map.addLayer({
        id: 'counties-border',
        type: 'line',
        source: 'counties',
        paint: {
          'line-color': '#333',
          'line-width': 2,
          'line-opacity': 0.4
        }
      });

      map.addLayer({
        id: 'counties-border-highlight',
        type: 'line',
        source: 'counties',
        paint: {
          'line-color': '#333',
          'line-width': 2,
          'line-opacity': 0.8
        },
        filter: ['in', 'NAME', ''] // No counties highlighted initially
      });
    } catch (error) {
      console.error('Error adding county boundary layers:', error);
    }

    // Add county labels
    try {
      map.addLayer({
        id: 'counties-labels',
        type: 'symbol',
        source: 'counties',
        layout: {
          'text-field': ['get', 'NAME'],
          'text-size': 13
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5
        }
      });
    } catch (error) {
      console.error('Error adding county labels layer:', error);
    }

    // Zoom-adaptive marker system with dynamic clustering and sizing
    let allMarkers = []; // Store all markers for zoom-based updates
    
    /**
     * createMarkerWithDynamicOffset
     * Update marker clusters
     */
    function createMarkersWithDynamicOffset() {
      console.log('🎯 createMarkersWithDynamicOffset() called');

      // Clear existing markers
      console.log(`Clearing ${allMarkers.length} existing markers`);
      allMarkers.forEach(marker => marker.remove());
      allMarkers = [];
      
      // Get current zoom level for adaptive behavior
      const currentZoom = map.getZoom();
      console.log(`Current zoom level: ${currentZoom}`);
      
      // Dynamic proximity threshold based on zoom level
      // Higher zoom = smaller threshold (less clustering)
      // Lower zoom = larger threshold (more clustering)
      const baseThreshold = 0.003;
      const proximityThreshold = baseThreshold * Math.pow(0.7, currentZoom - 7);
      
      // Dynamic marker size based on zoom level
      const baseSize = 18;
      const markerSize = Math.max(12, Math.min(28, baseSize + (currentZoom - 7) * 2));
      
      // Dynamic offset distance with minimum threshold for visibility
      const baseOffset = 0.004; // ~440m base offset
      const dynamicOffset = baseOffset * Math.pow(0.75, currentZoom - 7);
      const minimumOffset = 0.002; // Minimum 220m offset for visibility
      const offsetDistance = Math.max(dynamicOffset, minimumOffset);
      
      console.log(`🔧 Zoom: ${currentZoom.toFixed(1)}, Threshold: ${proximityThreshold.toFixed(4)}, Size: ${markerSize}px, Offset: ${offsetDistance.toFixed(4)}`);
      
      // Check if outletData exists
      if (!outletData || !outletData.features) {
        console.error('❌ outletData not available or has no features');
        return;
      }
      console.log(`📊 Processing ${outletData.features.length} outlet features`);
      
      const clusters = [];
      
      // Group nearby outlets into clusters (with filtering)
      outletData.features.forEach(function(feature) {
        if (!feature.geometry || !feature.geometry.coordinates) return;
        
        // Apply media type filter
        const mediumType = (feature.properties["Primary Media"] || '').trim();
        if (window.activeFilter !== 'all' && mediumType !== window.activeFilter) {
          return; // Skip this outlet if it doesn't match the filter
        }
        
        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        
        // Find existing cluster within proximity threshold
        let foundCluster = null;
        for (let cluster of clusters) {
          const distance = Math.sqrt(
            Math.pow(lng - cluster.centerLng, 2) + 
            Math.pow(lat - cluster.centerLat, 2)
          );
          if (distance < proximityThreshold) {
            foundCluster = cluster;
            break;
          }
        }
        
        if (foundCluster) {
          // Add to existing cluster
          foundCluster.outlets.push(feature);
          // Update cluster center to be more central
          const totalOutlets = foundCluster.outlets.length;
          foundCluster.centerLng = foundCluster.outlets.reduce((sum, o) => sum + o.geometry.coordinates[0], 0) / totalOutlets;
          foundCluster.centerLat = foundCluster.outlets.reduce((sum, o) => sum + o.geometry.coordinates[1], 0) / totalOutlets;
        } else {
          // Create new cluster
          clusters.push({
            centerLng: lng,
            centerLat: lat,
            outlets: [feature]
          });
        }
      });
      
      // Create markers with zoom-adaptive offsets
      let clusteredCount = 0;
      clusters.forEach(function(cluster, clusterIndex) {
        if (cluster.outlets.length > 1) {
          clusteredCount += cluster.outlets.length;
          console.log(`🔗 Cluster ${clusterIndex + 1}: ${cluster.outlets.length} outlets at [${cluster.centerLng.toFixed(4)}, ${cluster.centerLat.toFixed(4)}]`);
          cluster.outlets.forEach((outlet, idx) => {
            console.log(`   - ${outlet.properties["Outlet Name"]}`);
          });
        }
        
        cluster.outlets.forEach(function(feature, index) {
          // Get original coordinates
          const originalLng = feature.geometry.coordinates[0];
          const originalLat = feature.geometry.coordinates[1];
          
          // Calculate offset for clustered markers
          let offsetLng = originalLng;
          let offsetLat = originalLat;
          
          if (cluster.outlets.length > 1) {
            // Check if outlets have identical coordinates (same address)
            const hasIdenticalCoords = cluster.outlets.every(outlet => 
              Math.abs(outlet.geometry.coordinates[0] - cluster.outlets[0].geometry.coordinates[0]) < 0.0001 &&
              Math.abs(outlet.geometry.coordinates[1] - cluster.outlets[0].geometry.coordinates[1]) < 0.0001
            );
            
            // Use larger offset for identical coordinates
            const actualOffset = hasIdenticalCoords ? Math.max(offsetDistance, 0.003) : offsetDistance; // Minimum 330m for identical coords
            
            if (index === 0) {
              // First outlet stays at cluster center
              offsetLng = cluster.centerLng;
              offsetLat = cluster.centerLat;
              console.log(`   📍 ${feature.properties["Outlet Name"]}: CENTER [${offsetLng.toFixed(4)}, ${offsetLat.toFixed(4)}]`);
            } else {
              // Smart urban clustering: Use different patterns based on cluster size
              let finalOffsetLng, finalOffsetLat, patternInfo;
              
              if (cluster.outlets.length <= 4) {
                // Small clusters: Simple circular pattern
                const angle = ((index - 1) * (360 / (cluster.outlets.length - 1))) * (Math.PI / 180);
                finalOffsetLng = cluster.centerLng + (actualOffset * Math.cos(angle));
                finalOffsetLat = cluster.centerLat + (actualOffset * Math.sin(angle));
                patternInfo = `circular-${((index - 1) * (360 / (cluster.outlets.length - 1))).toFixed(0)}°`;
              } else {
                // Large clusters: Multi-ring spiral pattern for better separation
                const ringSize = 3; // Outlets per ring
                const ringNumber = Math.floor((index - 1) / ringSize);
                const positionInRing = (index - 1) % ringSize;
                const ringRadius = actualOffset * (1 + ringNumber * 0.7); // Each ring 70% larger
                const angleStep = 360 / Math.min(ringSize, cluster.outlets.length - 1 - (ringNumber * ringSize));
                const angle = (positionInRing * angleStep) * (Math.PI / 180);
                
                finalOffsetLng = cluster.centerLng + (ringRadius * Math.cos(angle));
                finalOffsetLat = cluster.centerLat + (ringRadius * Math.sin(angle));
                patternInfo = `ring-${ringNumber + 1}-pos-${positionInRing + 1}`;
              }
              
              offsetLng = finalOffsetLng;
              offsetLat = finalOffsetLat;
              console.log(`   📍 ${feature.properties["Outlet Name"]}: OFFSET [${offsetLng.toFixed(4)}, ${offsetLat.toFixed(4)}] (${patternInfo}, ${hasIdenticalCoords ? 'IDENTICAL COORDS' : 'NEARBY'})`);
            }
          }
          
          createSingleMarker(feature, offsetLng, offsetLat, markerSize);
        });
      });
      
      console.log(`✅ Created ${allMarkers.length} markers (${clusteredCount} in clusters, ${allMarkers.length - clusteredCount} standalone)`);
    }// createMarkerWithDynamicOffset
    
    /**
     * createSingleMarker
     * Add a marker on the map
     */
    function createSingleMarker(feature, offsetLng, offsetLat, markerSize) {
      // Create a marker
      const el = document.createElement('div');
      el.id = btoa(feature.geometry.coordinates[0] + '-' + feature.geometry.coordinates[1]);
      el.className = 'marker';

      // Color by Primary Medium with optimized contrast colors
      const medium = (feature.properties["Primary Media"] || '').toLowerCase();
      
      // Dynamic marker styling based on zoom level
      el.style.background = config.colors.medium[medium];
      el.style.width = `${markerSize}px`;
      el.style.height = `${markerSize}px`;
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 0 2px #333';
      el.style.border = '2px solid #fff';
      el.style.cursor = 'pointer';

      // --- ADD COUNTY HIGHLIGHT ON MARKER CLICK ---
      const highlightColors = {
        digital: '#b3d8f6',      // light blue
        print: '#b8e6c1',        // light green
        radio: '#ffe0b3',        // light orange
        television: '#f8bbbb',   // light red
        multiplatform: '#e0e0e0' // light gray
      };

      // County name normalization mapping
      const countyNameMap = {
        "dona ana": "Doña Ana",
        "doña ana": "Doña Ana",
        "dona ana ": "Doña Ana",
        "do\u00f1a ana": "Doña Ana",
        "de baca": "De Baca",
        "guadelupe": "Guadalupe", // Common misspelling
        "mckinley": "McKinley"    // Handle lowercase variations
      };
      
      // County name normalization function
      function normalizeCountyName(name) {
        name = name.trim().toLowerCase();
        
        // Check special cases first
        if (countyNameMap[name]) {
          return countyNameMap[name];
        }
        
        // Title case for normal county names (first letter of each word capitalized)
        return name.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }//normalizeCountyName

      // Generate popup HTML
      let popupHtml = fillPopup(feature.properties);

      const popup = new mapboxgl.Popup({ 
        offset: 18,
        closeButton: true,
        closeOnClick: false,
        closeOnMove: false
      }).setHTML(popupHtml);
      
      // Track popup state
      let isPopupOpen = false;
      
      /**
       * handleMarkerOpen
       * Highlight counties and show popup
       */
      function handleMarkerOpen(action) {
        // Close all other popups first (only one popup at a time)
        document.querySelectorAll('.mapboxgl-popup').forEach(popupEl => {
          if (popupEl !== popup.getElement()) {
            popupEl.remove();
          }
        });

        console.log("Counties served raw:", feature.properties["Counties Served"]);

        // Check if outlet serves all counties
        const servesAll = (feature.properties["Counties Served"] || "").toLowerCase().includes("all");
        console.log("Serves all counties?", servesAll);
        
        let countiesServed = [];
        
        if (servesAll) {
          // Get all county names (this will try to load them if not loaded yet)
          countiesServed = getAllCountyNames();
          console.log("Outlet serves ALL counties:", countiesServed.length, "counties found");
        } else {
          // Normal processing for specific counties
          countiesServed = (feature.properties["Counties Served"] || "")
            .split(',')
            .map(s => s.trim())
            .filter(s => s && s.toLowerCase() !== "all")
            .map(s => normalizeCountyName(s));
          console.log("Normal counties to highlight:", countiesServed);
        }

        // Apply highlighting for normal counties
        const type = (feature.properties["Primary Media"] || '').toLowerCase();

        map.setPaintProperty('counties-fill', 'fill-color', highlightColors[type] || '#e0e0e0');
        map.setFilter('counties-fill', ['in', 'NAME', ...countiesServed]);
        map.setFilter('counties-border-highlight', ['in', 'NAME', ...countiesServed]);

        // Open the popup if not already open
        if (! isPopupOpen) {
          // Add popup to map
          popup.setLngLat([offsetLng, offsetLat]).addTo(map);
          isPopupOpen = true;
        }

      }// handleMarkerOpen

      function closePopup() {
        // Close popup
        popup.remove();
        isPopupOpen = false;

        // Reset county filters
        resetCountyFilters();
      }// closePopup

      function handleMarkerClick() {
        // Click toggles popup persistence
        if (isPopupOpen) {
          closePopup();
        } else {
          handleMarkerOpen('click');
        }
      }//handleMarkerClick

      /*
      function handleMarkerMouseEnter() {
        handleMarkerOpen('hover');

        // Add popup interaction handlers
        setTimeout(() => {
            const popupElement = popup.getElement();
            if (popupElement) {
                // Keep popup open when hovering over it
                popupElement.addEventListener('mouseenter', () => {
                    if (popupTimeout) {
                    clearTimeout(popupTimeout);
                    popupTimeout = null;
                    }
                });

                // Set timeout to close when leaving popup
                popupElement.addEventListener('mouseleave', () => {
                    popupTimeout = setTimeout(() => {
                    handlePopupClose();
                    }, 300); // 300ms delay before closing
                });
            }
        }, 50);
      }//handleMarkerMouseEnter
      */

      /*
      function handleMarkerMouseLeave() {
        // Set timeout to close popup after leaving marker
        popupTimeout = setTimeout(() => {
          handlePopupClose();
        }, 300); // 300ms delay before closing
      }//handleMarkerMouseLeave
      */

      // Add event listeners
      el.addEventListener('click', handleMarkerClick);
      //el.addEventListener('mouseenter', handleMarkerMouseEnter);
      //el.addEventListener('mouseleave', handleMarkerMouseLeave);

      // Create and add marker to map, store reference for zoom updates
      const marker = new mapboxgl.Marker(el)
        .setLngLat([offsetLng, offsetLat])
        .addTo(map);
      
      allMarkers.push(marker);
    }//createSingleMarker

    /**
     * filterMarkersByType
     * Filter markers by media type
     */
    function filterMarkersByType(filterType) {
      console.log(`🎯 Filtering markers by: ${filterType}`);
      window.activeFilter = filterType;
      
      // Update legend visual state
      document.querySelectorAll('.legend-item').forEach(item => {
        if (item.dataset.type === filterType) {
          item.style.backgroundColor = '#e3f2fd';
          item.style.fontWeight = 'bold';
        } else {
          item.style.backgroundColor = 'transparent';
          item.style.fontWeight = 'normal';
        }
      });
      
      // Recreate markers with filtering applied
      createMarkersWithDynamicOffset();
    }// filterMarkersByType

    /**
     * fillPopup
     * Fill the popup template with data
     */
    function fillPopup(data) {

        // Get data schema for popups
        let schema = schemas['popup'];

        // Get HTML template for popups
        let html = $('#map-templates div[data-template="popup"]').clone();

        let propertyTitle = '';

        // Popuplate the template based on the schema's definition and the given data
        schema.forEach((property) => {

            // Get property value
            let propertyValue = data[property.column];

            // Ignore if property value not provided
            if (! propertyValue) {
                return false;
            }

            // Clean property value
            if (typeof propertyValue == 'string') {
                propertyValue = propertyValue.trim();
            }

            // Ignore if property value not applicable
            if (propertyValue == '*') {
                return false;
            }

            if (property.type) {

                switch(property.type) {

                    case 'website':

                        html.find(`[data-mp-property="${property.id}"]`).attr('href', propertyValue);
                        html.find(`[data-mp-property="${property.id}"]`).attr('title', property.label);
                        html.find(`[data-mp-property-label="${property.id}"]`).text(property.label);

                        break;
                    
                    case 'social':

                        break;

                }
    
            } else {

                // Apply property value
                html.find(`[data-mp-property="${property.id}"]`).text(propertyValue);

                // Apply property label
                html.find(`[data-mp-property-label="${property.id}"]`).text(property.label);

            }
        });

        // Remove templates
        html.find('[data-type="template"]').remove();

        return html.html();
    }// fillPopup

    /** 
     * setupLegendInteractivity
     * Add legend click event listeners
     */
    function setupLegendInteractivity() {
      document.querySelectorAll('.legend-item').forEach(item => {
        item.addEventListener('click', function() {
          const filterType = this.dataset.type;
          filterMarkersByType(filterType);
        });
        
        // Add hover effects
        item.addEventListener('mouseenter', function() {
          if (this.dataset.type !== window.activeFilter) {
            this.style.backgroundColor = '#f5f5f5';
          }
        });
        
        item.addEventListener('mouseleave', function() {
          if (this.dataset.type !== window.activeFilter) {
            this.style.backgroundColor = 'transparent';
          }
        });
      });
    }//setupLegendInteractivity

    // Initial marker and legend creation
    try {
      createMarkersWithDynamicOffset();
      setupLegendInteractivity();
    } catch (error) {
      console.error('Error in dynamic marker creation:', error);
    }

    function resetCountyFilters() {
        // Remove county filter styles
        map.setFilter('counties-fill', ['in', 'NAME', '']);
        map.setFilter('counties-border-highlight', ['in', 'NAME', '']);
    }// resetCountyFilters

    function closeAllPopups() {
        // Reset county filters
        resetCountyFilters();

        // Close all popups
        document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            popup.remove();
        });
    }// closeAllPopups

    // Handle popup close request
    $(document).on('click', '.mapboxgl-popup-close-button', closeAllPopups);
    $('#map').on('keyup', closeAllPopups);

    /**
     * Map Zoom
     */
    map.on('zoom', function() {
      // Debounce zoom updates to avoid excessive recalculation
      clearTimeout(window.zoomUpdateTimeout);
      window.zoomUpdateTimeout = setTimeout(() => {
        // Update markers
        createMarkersWithDynamicOffset();
      }, 150);
    });

    /**
     * Map Click
     */
    map.on('click', function() {
        //
    });

    // --- CENSUS OVERLAY FUNCTIONALITY ---
    
    // Function to create color expression for a census layer
    function createColorExpression(layerConfig) {
      const expression = ['case'];
      
      for (let i = 0; i < layerConfig.breaks.length; i++) {
        const condition = i === 0 
          ? ['<', ['get', layerConfig.property], layerConfig.breaks[i]]
          : ['<', ['get', layerConfig.property], layerConfig.breaks[i]];
        expression.push(condition, layerConfig.colors[i]);
      }
      
      // Default color for highest values
      expression.push(layerConfig.colors[layerConfig.colors.length - 1]);
      
      return expression;
    }// createColorExpression

    /**
     * updateCensusOverlay
     * Function to update census overlay
     */
    function updateCensusOverlay(layerType) {      
      if (layerType === 'none') {
        map.setLayoutProperty('census-overlay', 'visibility', 'none');
        document.getElementById('census-legend').innerHTML = '';
        return;
      }
      
      const layerConfig = censusLayers[layerType];
      if (!layerConfig) return;
      
      // Update layer paint properties
      map.setPaintProperty('census-overlay', 'fill-color', createColorExpression(layerConfig));
      map.setLayoutProperty('census-overlay', 'visibility', 'visible');
      
      // Update legend
      updateCensusLegend(layerConfig);
    }// updateCensusOverlay

    // Function to update census legend
    function updateCensusLegend(layerConfig) {
      const legendDiv = document.getElementById('census-legend');
      let legendHtml = `<div style="font-weight: bold; margin-bottom: 5px;">${layerConfig.title}</div>`;
      
      // Create color scale legend
      for (let i = 0; i < layerConfig.colors.length; i++) {
        const color = layerConfig.colors[i];
        const minVal = i === 0 ? 0 : layerConfig.breaks[i - 1];
        const maxVal = i < layerConfig.breaks.length ? layerConfig.breaks[i] : '∞';
        
        legendHtml += `
          <div style="display: flex; align-items: center; margin-bottom: 2px;">
            <div style="width: 12px; height: 12px; background: ${color}; margin-right: 5px; border: 1px solid #ccc;"></div>
            <span>${layerConfig.format(minVal)} - ${maxVal === '∞' ? '∞' : layerConfig.format(maxVal)}</span>
          </div>
        `;
      }
      
      legendDiv.innerHTML = legendHtml;
    }// updateCensusLegend

    // Add event listeners to census controls
    document.querySelectorAll('input[name="census-layer"]').forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          updateCensusOverlay(this.value);
        }
      });
    });
});