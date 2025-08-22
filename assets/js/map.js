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

// Initialize map
mapboxgl.accessToken = 'pk.eyJ1Ijoibm1uZXdzbWFwIiwiYSI6ImNtYjVkbmEwZDFlOXIyam9sM21mcDZsbDgifQ.LDcxjUWCHp-XRBbD5IbL3A';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-106.2485, 34.5199],
    zoom: 7.1,
    minZoom: 6.2,
    maxZoom: 13,
    attributionControl: true
});

// Global variables for census data
let censusData = null;
let currentCensusLayer = 'none';

map.addControl(new mapboxgl.NavigationControl());

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

    // Directly fetch the counties GeoJSON to ensure we have access to county names
    fetch(config.data.counties)
      .then(response => response.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          // Extract all county names from the GeoJSON
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
      id: 'county-highlight',
      type: 'fill',
      source: 'counties',
      paint: {
        'fill-color': '#b3d8f6', // default light blue
        'fill-opacity': 0.35
      },
      filter: ['in', 'NAME', ''] // no counties highlighted initially
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
        'visibility': 'none' // Hidden by default
      }
    });

    // Add error handling for the county source
    map.on('error', function(e) {
      console.error('Map error:', e);
    });

    // Add county boundary outlines
    try {
      map.addLayer({
        'id': 'nm-counties',
        'type': 'line',
        'source': 'counties',
        'paint': {
          'line-color': '#333',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    } catch (error) {
      console.error('Error adding county boundary layer:', error);
    }

    // Add county labels
    try {
      map.addLayer({
        'id': 'nm-county-labels',
        'type': 'symbol',
        'source': 'counties',
        'layout': {
          'text-field': ['get', 'NAME'],
          'text-size': 13
        },
        'paint': {
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
        const mediumType = (feature.properties["Primary Medium"] || '').trim();
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
      const medium = (feature.properties["Primary Medium"] || '').toLowerCase();
      
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

      // Comprehensive popup content matching user specifications
      // Primary label: Outlet Name
      let popupHtml = `<strong>${feature.properties["Outlet Name"]}</strong><br>`;
      
      // Website (active link)
      if (feature.properties["Website"] && feature.properties["Website"].trim() !== "" && feature.properties["Website"].trim() !== "*") {
        let urls = feature.properties["Website"].split(',').map(u => u.trim()).filter(u => u !== '');
        if (urls.length > 0) {
          popupHtml += `<b>Website:</b> `;
          popupHtml += urls.map(u => `<a href="${/^https?:\/\//.test(u) ? u : 'http://' + u}" target="_blank">${u}</a>`).join(' | ');
          popupHtml += `<br>`;
        }
      }
      
      // Primary Medium (revised category label)
      if (feature.properties["Primary Medium"] && feature.properties["Primary Medium"].trim() !== "") {
        popupHtml += `<b>Primary Medium:</b> ${feature.properties["Primary Medium"]}<br>`;
      }
      
      // City Based
      if (feature.properties["City Based"] && feature.properties["City Based"].trim() !== "") {
        popupHtml += `<b>City Based:</b> ${feature.properties["City Based"]}<br>`;
      }
      
      // Frequency
      if (feature.properties["Frequency"] && feature.properties["Frequency"].trim() !== "") {
        popupHtml += `<b>Frequency:</b> ${feature.properties["Frequency"]}<br>`;
      }
      
      // Monthly Users
      if (feature.properties["Monthly Users"] && feature.properties["Monthly Users"].toString().trim() !== "" && feature.properties["Monthly Users"].toString().trim() !== "*") {
        popupHtml += `<b>Monthly Users:</b> ${feature.properties["Monthly Users"]}<br>`;
      }
      
      // News Staffing
      if (feature.properties["News Staff (FTEs)"] && feature.properties["News Staff (FTEs)"].toString().trim() !== "" && feature.properties["News Staff (FTEs)"].toString().trim() !== "*") {
        popupHtml += `<b>News Staff (FTEs):</b> ${feature.properties["News Staff (FTEs)"]}<br>`;
      }
      
      // Language
      if (feature.properties["Language"] && feature.properties["Language"].trim() !== "" && feature.properties["Language"].trim() !== "*") {
        popupHtml += `<b>Language:</b> ${feature.properties["Language"]}<br>`;
      }
      
      // Year Founded
      if (feature.properties["Year Founded"] && feature.properties["Year Founded"].toString().trim() !== "" && feature.properties["Year Founded"].toString().trim() !== "*") {
        let yearFounded = feature.properties["Year Founded"];
        // Convert to integer to remove any decimal places
        if (!isNaN(yearFounded)) {
          yearFounded = Math.round(parseFloat(yearFounded));
        }
        popupHtml += `<b>Year Founded:</b> ${yearFounded}<br>`;
      }
      
      // Owner Name (revised category label)
      if (feature.properties["Owner"] && feature.properties["Owner"].trim() !== "" && feature.properties["Owner"].trim() !== "*") {
        popupHtml += `<b>Owner Name:</b> ${feature.properties["Owner"]}<br>`;
      }
      
      // Owner Type (revised category label)
      if (feature.properties["Owner Type"] && feature.properties["Owner Type"].trim() !== "" && feature.properties["Owner Type"].trim() !== "*") {
        popupHtml += `<b>Owner Type:</b> ${feature.properties["Owner Type"]}<br>`;
      }
      
      // Social Media (grouped under one category with active links)
      const social = [];
      if (feature.properties["Facebook"] && feature.properties["Facebook"].trim() !== "*" && feature.properties["Facebook"].trim() !== "") {
        social.push(`<a href='${feature.properties["Facebook"]}' target='_blank'>Facebook</a>`);
      }
      if (feature.properties["Instagram"] && feature.properties["Instagram"].trim() !== "*" && feature.properties["Instagram"].trim() !== "") {
        social.push(`<a href='${feature.properties["Instagram"]}' target='_blank'>Instagram</a>`);
      }
      if (feature.properties["YouTube"] && feature.properties["YouTube"].trim() !== "*" && feature.properties["YouTube"].trim() !== "") {
        social.push(`<a href='${feature.properties["YouTube"]}' target='_blank'>YouTube</a>`);
      }
      if (feature.properties["X"] && feature.properties["X"].trim() !== "*" && feature.properties["X"].trim() !== "") {
        social.push(`<a href='${feature.properties["X"]}' target='_blank'>X</a>`);
      }
      if (feature.properties["TikTok"] && feature.properties["TikTok"].trim() !== "*" && feature.properties["TikTok"].trim() !== "") {
        social.push(`<a href='${feature.properties["TikTok"]}' target='_blank'>TikTok</a>`);
      }
      if (feature.properties["Other"] && feature.properties["Other"].trim() !== "*" && feature.properties["Other"].trim() !== "") {
        social.push(`<a href='${feature.properties["Other"]}' target='_blank'>Other</a>`);
      }
      if (social.length > 0) {
        popupHtml += `<b>Social:</b> ${social.join(' | ')}<br>`;
      }
      
      // Content Index
      if (feature.properties["Content Index"] && feature.properties["Content Index"].toString().trim() !== "" && feature.properties["Content Index"].toString().trim() !== "*") {
        // Use the Content Index value as-is to preserve the /3.00 format
        let ci = feature.properties["Content Index"];
        popupHtml += `<b>Content Index:</b> ${ci}<br>`;
      }
      
      // Summary
      if (feature.properties["Summary"] && feature.properties["Summary"].toString().trim() !== "" && feature.properties["Summary"].toString().trim() !== "*") {
        popupHtml += `<b>Summary:</b> ${feature.properties["Summary"]}<br>`;
      }
      
      // Last Update (always last)
      if (feature.properties["Last Update"] && feature.properties["Last Update"].toString().trim() !== "" && feature.properties["Last Update"].toString().trim() !== "*") {
        let lastUpdate = feature.properties["Last Update"].toString();
        // Fix any decimal years in the date string (e.g., "2024.0" → "2024")
        lastUpdate = lastUpdate.replace(/(\d{4})\.0+\b/g, '$1');
        popupHtml += `<b>Last Update:</b> ${lastUpdate}<br>`;
      }

      const popup = new mapboxgl.Popup({ 
        offset: 18,
        closeButton: true,
        closeOnClick: false,
        closeOnMove: false
      }).setHTML(popupHtml);
      
      // Track popup state
      let isPopupOpen = false;
      let popupTimeout = null;
      
      /**
       * handleMarkerOpen
       * Highlight counties and show popup
       */
      function handleMarkerOpen(action) {
        // Clear any pending popup close timeout
        if (popupTimeout) {
          clearTimeout(popupTimeout);
          popupTimeout = null;
        }

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
        const type = (feature.properties["Primary Medium"] || '').toLowerCase();
        map.setPaintProperty('county-highlight', 'fill-color', highlightColors[type] || '#e0e0e0');
        map.setFilter('county-highlight', ['in', 'NAME', ...countiesServed]);

        // Open the popup if not already open
        if (! isPopupOpen) {
          // Add popup to map
          popup.setLngLat([offsetLng, offsetLat]).addTo(map);
          isPopupOpen = true;
        }

        function closePopup() {
            // Close all popups when clicking on map
            document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
                popup.remove();
            });

            isPopupOpen = false;

            map.setFilter('county-highlight', ['in', 'NAME', '']);
        }

        // Handle popup close request
        $('.mapboxgl-popup-close-button').bind('click', closePopup);
        $(document).on('keyup', function(e){
            if(e.which == 27) {
                closePopup();
            }
        });
      }// handleMarkerOpen

      function handleMarkerClick() {
        // Click toggles popup persistence
        if (isPopupOpen) {
          handlePopupClose();
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

      function handlePopupClose() {
        if (popupTimeout) {
          clearTimeout(popupTimeout);
          popupTimeout = null;
        }
        
        if (isPopupOpen) {
          popup.remove();
          isPopupOpen = false;
        }

        map.setFilter('county-highlight', ['in', 'NAME', '']);
      }//handlePopupClose

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

    // Function to update census overlay
    function updateCensusOverlay(layerType) {
      currentCensusLayer = layerType;
      
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
        /*
        map.setFilter('county-highlight', ['in', 'NAME', '']);

        // Close all popups when clicking on map
        document.querySelectorAll('.mapboxgl-popup').forEach(popup => {
            //popup.remove();
        });
        */
    });
});