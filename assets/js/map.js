// Initialize map configuration
const base_dir = 'assets/data/';

const config = {
    data: {
        markers: window.outletsGeojsonFeatures,
        counties: base_dir + 'nm_counties_wgs84.geojson', // General county geographic data
        census: base_dir + 'nm_counties_with_census.geojson', // County-based census data
    },
    operations: {
        sort_column: 'outlet_name', // The column for sorting markers by
        cil_max: 3.00, // The maximum Community Impact Level number
        cil_label_delimiter: '-', // The delimiter for the CIL label in the CIL description
        county_delimiter: ',', // The delimiter for multiple counties in the county column
        county_all_term: 'all', // The term used in marker county data for all-encompassing county coverage
        counties_column: 'counties_served', // The column that includes the marker's county data
        counties_color_column: 'medium_primary', // The column that controls the marker colors
        counties_color_default: '#e0e0e0', // The default color for highlighting counties 
        county_name_exceptions: { // County name normalization mapping
            "dona ana": "Doña Ana",
            "doña ana": "Doña Ana",
            "dona ana ": "Doña Ana",
            "do\u00f1a ana": "Doña Ana",
            "de baca": "De Baca",
            "guadelupe": "Guadalupe", // Common misspelling
            "mckinley": "McKinley", // Handle lowercase variations
        },
    },
    icons: {
        facebook: {
            id: 'facebook',
            color: '#1778f2',
            group: 'brands',
        },
        info: {
            id: 'info-circle',
            color: '#000000',
            group: 'solid',
        },
        instagram: {
            id: 'instagram',
            color: '#e1306c',
            group: 'brands',
        },
        pinterest: {
            id: 'pinterest',
            color: '#e60023',
            group: 'brands',
        },
        tiktok: {
            id: 'tiktok',
            color: '#fe2c55',
            group: 'brands',
        },
        youtube: {
            id: 'youtube',
            color: '#ff0000',
            group: 'brands',
        },
        x: {
            id: 'x-twitter',
            color: '#000000',
            group: 'brands',
        },
        default: {
            id: '',
            color: '#515151',
            group: 'initial',
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

const schema = {
    'outlet_name': {
        id: 'outlet_name',
        column: 'OUTLET_NAME',
        label: 'Outlet Name',
    },
    'website': {
        id: 'website',
        column: 'WEBSITE',
        label: 'Website',
        type: 'website',
    },
    'medium_primary': {
        id: 'medium_primary',
        column: 'PRIMARY_MEDIA',
        label: 'Primary Medium',
        description: "The platform that delivers 50% or more of the outlet's audience",
        filter: true,
        options: {
            'Digital': {
                icon: 'mobile-screen',
                color: '#2196f3', //Bright blue
            },
            'Radio': {
                icon: 'headphones',
                color: '#ff9800', //Orange
            },
            'Print': {
                icon: 'newspaper',
                color: '#4caf50', //Green
            },
            'Television': {
                icon: 'tv',
                color: '#f44336', //Red
            },
            'Multiplatform': {
                icon: 'cubes',
                color: '#9c27b0' //Purple
            },
        },
    },
    'city_based': {
        id: 'city_based',
        column: 'City_Based',
        label: 'City Based',
        description: "The city of the outlet's headquarters",
    },
    'county_based': {
        id: 'county_based',
        column: 'Address_County',
        label: 'County Based',
    },
    'frequency': {
        id: 'frequency',
        column: 'FREQ',
        label: 'Frequency',
        description: "The rate that coverage is typically published",
    },
    'language': {
        id: 'language',
        column: 'LANGUAGE',
        label: 'Language',
        description: "The languages that coverage is written in or translated to",
        filter: true,
    },
    'year_founded': {
        id: 'year_founded',
        column: 'Year_Founded',
        label: 'Year Founded',
    },
    'owner_name': {
        id: 'owner_name',
        column: 'OWNER',
        label: 'Owner',
    },
    'owner_type': {
        id: 'owner_type',
        column: 'OWNER_TYPE',
        label: 'Owner Type',
        filter: true,
    },
    'facebook': {
        id: 'facebook',
        column: 'Social_Media_Facebook',
        label: 'Facebook',
        type: 'social',
    },
    'instagram': {
        id: 'instagram',
        column: 'Social_Media_Instagram',
        label: 'Instagram',
        type: 'social',
    },
    'youtube': {
        id: 'youtube',
        column: 'Social_Media_YouTube',
        label: 'YouTube',
        type: 'social',
    },
    'x': {
        id: 'x',
        column: 'Social_Media_X',
        label: 'X',
        type: 'social',
    },
    'tiktok': {
        id: 'tiktok',
        column: 'Social_Media_TikTok',
        label: 'TikTok',
        type: 'social',
    },
    'social_other': {
        id: 'social_other',
        column: 'Social_Media_Other',
        label: 'Other',
        type: 'social',
    },
    'cil_number': {
        id: 'cil_number',
        column: 'COMMUNITY_IMPACT_LVL',
        label: 'Community Impact Level',
        format: 'float',
        filter: true,
    },
    'cil_percent': {
        id: 'cil_percent',
        column: 'COMMUNITY_IMPACT_LVL',
        label: 'Community Impact Level Percentage',
        type: 'cil_percent',
    },
    'cil_label': {
        id: 'cil_label',
        column: 'IMPACT_LVL_LABEL',
        label: 'Community Impact Level Label',
    },
    'cil_description': {
        id: 'cil_description',
        column: 'IMPACT_LVL_DESCRIPTION',
        label: 'Community Impact Level Description',
    },
    'summary': {
        id: 'summary',
        column: 'SUMMARY',
        label: 'Summary',
    },
    'counties_served': {
        id: 'counties_served',
        column: 'COUNTIES_SERVED',
        label: 'Counties Served',
        description: "The county(s) that coverage is provided about",
        format: 'csv',
    },
    'updated_at': {
        id: 'updated_at',
        column: 'LAST_UPDATE',
        label: 'Updated:',
    },
};

// Initialize
let allCountyNames = []; // Stores all county names
let countiesLoaded = false; // Store loaded counties
let activeFilters = [];
let activeFilterCategory = '';

// Initialize map
mapboxgl.accessToken = 'pk.eyJ1Ijoibm1uZXdzbWFwIiwiYSI6ImNtYjVkbmEwZDFlOXIyam9sM21mcDZsbDgifQ.LDcxjUWCHp-XRBbD5IbL3A';

const map = new mapboxgl.Map({
    container: 'map-canvas',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-106.2485, 34.5199], // New Mexico
    zoom: 5, // State level
    minZoom: 5,
    maxZoom: 9,
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
    duration: 500,
});

// Map controls
const nav = new mapboxgl.NavigationControl({
    showCompass: false,
});
map.addControl(nav, 'bottom-right');

// disable map rotation using right click + drag
map.dragRotate.disable();

// disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();

// Map attribution
map.addControl(new mapboxgl.AttributionControl({
    compact: true,
    customAttribution: 'Map design by Bloom Labs'
}));

/**
 * Load Map
 */
map.on('load', function() {

    // Initialize marker data
    const markerData = config.data.markers;

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

    // Fetch counties GeoJSON
    fetch(config.data.counties)
        .then(response => response.json())
        .then(data => {
            if (! data || ! data.features && data.features.length > 0) return;

            // Store all county names
            allCountyNames = data.features
                .map(feature => feature.properties.NAME)
                .filter(name => name);

            countiesLoaded = true;

            // Begin build process
            initializeBuildProcess();
        })
        .catch(error => {
            console.error('Error loading county GeoJSON:', error);
        });

    /**
     * Load Map Source Data
     * Once the county GeoJSON is loaded, store all county names
     */
    map.on('sourcedata', function(e) {
        if (e.sourceId !== 'counties' || ! e.isSourceLoaded || countiesLoaded) return;

        // Extract all county names when source is loaded
        try {
            const source = map.getSource('counties');
            if (source._data && source._data.features) {
                allCountyNames = source._data.features
                    .map(feature => feature.properties.NAME)
                    .filter(name => name); // filter out any undefined/null

                // Mark counties as loaded
                countiesLoaded = true;
            }
        } catch (err) {
            console.error('Error extracting county names:', err);
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

    /**
     * initializeBuildProcess
     * Conduct the initial build of map components
     */
    function initializeBuildProcess() {
        try {
            // Clean the data
            cleanData();

            // Add filter options
            buildFilterOptions();

            // Add layer options
            buildLayerOptions();

            // Add markers
            drawMarkers();
        } catch (error) {
            console.error('Error in initial build process:', error);
        }
    }// initializeBuildProcess

    /**
     * cleanData
     * Clean up incoming data
     */
    function cleanData() {

        // Initialize
        let cleaned = [];
      
        // County name normalization function
        function normalizeCountyName(name) {
            name = name.trim().toLowerCase();

            // Check special cases first
            if (config.operations.county_name_exceptions[name]) {
                return config.operations.county_name_exceptions[name];
            }

            // Title case for normal county names (first letter of each word capitalized)
            return name.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }//normalizeCountyName

        // Filter and update data
        markerData.features.filter((feature) => 
                // Ignore if invalid GeoJSON properties
                (feature.geometry && feature.geometry.coordinates)
            )
            .map((feature, index) => {
                // Set marker index
                feature.properties.index = index;

                // Get list of counties served
                let countiesServed = feature.properties[schema[config.operations.counties_column].column];

                // Turn county list into array and clean up
                countiesServed = countiesServed
                    .split(config.operations.county_delimiter)
                    .map(s => s.trim());

                if (countiesServed.map(s => s.toLowerCase()).includes(config.operations.county_all_term)) {
                    if (! countiesLoaded || allCountyNames.length === 0) {
                        countiesServed = [];
                    } else {
                        countiesServed = [...allCountyNames];
                    }
                } else {
                    countiesServed = countiesServed.map(s => normalizeCountyName(s));
                }

                feature.properties[schema[config.operations.counties_column].column] = countiesServed;

                // Split CIL label and description
                let cil_description_parts = feature.properties[schema['cil_description'].column].split(config.operations.cil_label_delimiter);
                if (cil_description_parts.length > 1) {
                    feature.properties[schema['cil_label'].column] = cil_description_parts.shift().trim();
                    feature.properties[schema['cil_description'].column] = cil_description_parts.join(config.operations.cil_label_delimiter).trim();
                }

                // Owner Type: Capitalize the first letter and lowercase everything else
                let owner_type = feature.properties[schema['owner_type'].column];
                if (owner_type) {
                    owner_type = owner_type.charAt(0).toUpperCase() + owner_type.substring(1).toLowerCase();
                    feature.properties[schema['owner_type'].column] = owner_type;
                }
            });
    }// cleanData

    /**
     * buildFilterOptions
     * Gather categories for filtering
     */
    function buildFilterOptions() {
        // Initialize with no filter option
        let categories = [
            {
                id: 'none',
                title: 'No filters',
                active: true,
            }
        ];

        // Populate categories with unique values from each data record
        markerData.features.forEach((record) => {

            // Popuplate the template based on the schema's definition and the given data
            Object.values(schema).forEach((property) => {

                // Ignore if property category isn't applicable for filters
                if (! property.filter) return false;

                // Get property value
                let propertyValue = record.properties[property.column];

                if (! propertyValue) return false;

                // Clean property value
                if (typeof propertyValue == 'string') {
                    propertyValue = propertyValue.trim();
                }

                // Ignore if property value not applicable
                if (! propertyValue || propertyValue == '*') return false;

                // Add category item
                if (! categories[property.label]) {
                    categories[property.label] = {
                        id: property.id,
                        title: property.label,
                        options_data: [],
                        options_unique: [],
                    };
                }

                if (! categories[property.label].options_unique.includes(propertyValue)) {
                    categories[property.label].options_unique.push(propertyValue);
                    categories[property.label].options_data.push({
                        value: propertyValue,
                        count: 1,
                        icon: property.options ? property.options[propertyValue].icon : '',
                        color: property.options ? property.options[propertyValue].color : '',
                    });
                } else {
                    categories[property.label].options_data.map(option => {
                        if (option.value == propertyValue) option.count++;
                    })
                }

            });

        });

        // Populate filters with each category
        Object.values(categories).forEach((category) => {

            // Get filter option template
            let categoryHtml = $('.menu-container[data-container="filters"] .mc-category-wrapper[data-type="template"]').clone();
            categoryHtml.removeAttr('data-type');
            categoryHtml.find('.mc-category').attr('data-id', category.id);

            if (category.active) {
                categoryHtml.find('.mc-category').addClass('active');
            }

            // Add category title
            categoryHtml.find('.mc-category-title .mc-item-label').text(category.title);
            categoryHtml.find('.mc-category-title .mc-item-input button').val(category.id);

            // Add category options
            if (category.options_data) {
                Object.values(category.options_data).forEach((option) => {

                    let optionHtml = $('.menu-container[data-container="filters"] .mc-category-option-wrapper[data-type="template"]').clone();
                    optionHtml.removeAttr('data-type');
                    optionHtml.find('.mc-category-option').attr('data-id', option.value);

                    optionHtml.find('.mc-item-label').text(option.value + ' (' + option.count + ')');
                    optionHtml.find('.mc-item-input button')
                        .val(option.value)
                        .css('background-color', option.color);

                    categoryHtml.find('.mc-category-options').append(optionHtml.html());
                });
            } else {
                categoryHtml.find('.mc-category-options').remove();
            }

            // Add category HTML to filter section
            $('.menu-container[data-container="filters"] .mc-categories').append(categoryHtml.html());
        });

        // Remove templates
        $('.menu-container[data-container="filters"] .mc-categories [data-type]').remove();

        // Filter category listener
        $('#menu').on('click', '.menu-container[data-container="filters"] .mc-category-title', function(){
            let parent = $(this).parent('.mc-category');

            // Ignore if already active
            if (parent.hasClass('active')) {
                return false;
            }

            // Deactivate active categories
            $('.menu-container[data-container="filters"] .mc-category.active').removeClass('active');

            // Activate requested category
            parent.addClass('active');

            // Select all category options upon initial selection
            if (! parent.attr('data-has-selected')) {
                parent.find('.mc-category-option').addClass('active');
            }

            parent.attr('data-has-selected', 'true');
            activeFilterCategory = parent.attr('data-id');

            // Update markers
            drawMarkers();
        });

        // Filter category listener
        $('#menu').on('click', '.menu-container[data-container="filters"] .mc-category-option', function(){
            // Activate or deactivate requested category
            $(this).toggleClass('active');

            // Update markers
            drawMarkers();
        });
    }//buildFilterOptions

    /**
     * buildLayerOptions
     * Gather categories for layering
     */
    function buildLayerOptions() {
        // Initialize with no layer option
        let layers = Object.values(censusLayers);
        layers.unshift({
            id: 'none',
            title: 'No Layer',
            active: true,
        });

        // Populate filters with each layer category
        Object.values(layers).forEach((layer) => {

            // Get filter option template
            let categoryHtml = $('.menu-container[data-container="layers"] .mc-category-wrapper[data-type="template"]').clone();
            categoryHtml.removeAttr('data-type');
            categoryHtml.find('.mc-category').attr('data-id', layer.id);

            if (layer.active) {
                categoryHtml.find('.mc-category').addClass('active');
            }

            // Add category title
            categoryHtml.find('.mc-category-title .mc-item-label').text(layer.title);
            categoryHtml.find('.mc-category-title .mc-item-input button').val(layer.id);

            // Add category options
            if (layer.breaks && layer.breaks.length > 0) {
                for (let i = 0; i < layer.breaks.length; i++) {
                    // Get option values
                    const minVal = i === 0 ? 0 : layer.breaks[i - 1];
                    const maxVal = i < layer.breaks.length ? layer.breaks[i] : '∞';

                    // Populate option HTML
                    let optionHtml = $('.menu-container[data-container="layers"] .mc-category-option-wrapper[data-type="template"]').clone();
                    optionHtml.removeAttr('data-type');
                    optionHtml.find('.mc-category-option').attr('data-id', i);

                    optionHtml.find('.mc-item-label').text(layer.format(minVal) + ' - ' + (maxVal === '∞' ? '∞' : layer.format(maxVal)));
                    optionHtml.find('.mc-item-input button')
                        .val(i)
                        .css('background-color', layer.colors[i]);

                    // Add option to category HTML
                    categoryHtml.find('.mc-category-options').append(optionHtml.html());
                }
            } else {
                categoryHtml.find('.mc-category-options').remove();
            }

            // Add category HTML to filter section
            $('.menu-container[data-container="layers"] .mc-categories').append(categoryHtml.html());
        });

        // Remove templates
        $('.mc-categories [data-type]').remove();

        // Filter category listener
        $('#menu').on('click', '.menu-container[data-container="layers"] .mc-category-title', function(){
            let parent = $(this).parent('.mc-category');

            // Ignore if already active
            if (parent.hasClass('active')) {
                return false;
            }

            // Deactivate active categories
            $('#menu .menu-container[data-container="layers"] .mc-category.active').removeClass('active');

            // Activate requested category
            parent.addClass('active');

            // Select all category options upon initial selection
            if (! parent.attr('data-has-selected')) {
                parent.find('.mc-category-option').addClass('active');
            }

            parent.attr('data-has-selected', 'true');
            activeLayerCategory = parent.attr('data-id');

            // Get layer
            const layer = censusLayers[parent.attr('data-id')];
      
            if (layer) {
                // Collect layer colors
                const expression = ['case'];
                for (let i = 0; i < layer.breaks.length; i++) {
                    const condition = i === 0 
                        ? ['<', ['get', layer.property], layer.breaks[i]]
                        : ['<', ['get', layer.property], layer.breaks[i]];
                        expression.push(condition, layer.colors[i]);
                }

                // Default color for highest values
                expression.push(layer.colors[layer.colors.length - 1]);

                // Paint and display layer
                map.setPaintProperty('census-overlay', 'fill-color', expression);
                map.setLayoutProperty('census-overlay', 'visibility', 'visible');
            } else {
                // Hide layer
                map.setLayoutProperty('census-overlay', 'visibility', 'none');
            }
        });
    }//buildLayerOptions

    // Store current, filtered markers
    let allMarkers = [];
    
    /**
     * drawMarkers
     * Update markers
     */
    function drawMarkers() {
        // Clear existing markers and popups
        allMarkers.forEach(marker => marker.remove());
        allMarkers = [];

        // Check if marker data exists
        if (! markerData || ! markerData.features) return;

        // Get current zoom level for adaptive behavior
        const currentZoom = map.getZoom();
        const maxZoom = map.getMaxZoom();
      
        // Dynamic proximity threshold based on zoom level
        // Higher zoom = smaller threshold (less clustering)
        // Lower zoom = larger threshold (more clustering)
        const baseThreshold = 0.2; // 0.003
        const proximityThreshold = baseThreshold * Math.pow(0.7, currentZoom - 7);

        // Dynamic marker size based on zoom level
        const baseSize = 30;
        const markerSize = Math.max(12, Math.min(28, baseSize + (currentZoom - 7) * 2));

        // Dynamic offset distance with minimum threshold for visibility
        const baseOffset = 0.014; // ~440m base offset
        const dynamicOffset = baseOffset * Math.pow(0.75, currentZoom - 7);
        const minimumOffset = 0.002; // Minimum 220m offset for visibility
        const offsetDistance = Math.max(dynamicOffset, minimumOffset);

        // Update active filters cache
        let filterCategoryActive = $('.menu-container[data-container="filters"]  .mc-category.active');

        if (filterCategoryActive.length == 0 || filterCategoryActive.find('.mc-category-option').length == 0) {
            activeFilters = ['all'];
        } else {
            let filterOptionsActive = filterCategoryActive.find('.mc-category-option.active');

            if (filterOptionsActive.length > 0) {
                activeFilters = [];
                filterOptionsActive.each(function() {
                    activeFilters.push($(this).attr('data-id'));
                });
            } else {
                activeFilters = [''];
            }
        }

        // Initialize marker clusters
        const clusters = [];

        // Group nearby markers into clusters with filtering
        markerData.features.forEach(function(feature) {
            // Ignore if invalid GeoJSON properties
            if (!feature.geometry || !feature.geometry.coordinates) return;

            // Apply filter
            if (activeFilterCategory && ! activeFilters.includes('all')) {
                let filterPropertyValue = feature.properties[schema[activeFilterCategory].column];
                if (! filterPropertyValue) return;
                filterPropertyValue = filterPropertyValue.toString().trim();
                if (! filterPropertyValue || ! activeFilters.includes(filterPropertyValue)) return;
            }

            // Get coordinates
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

            if (foundCluster) {// && currentZoom < (maxZoom - 2)) {
                // Add to existing cluster
                foundCluster.markers.push(feature);
                // Update cluster center to be more central
                const totalMarkers = foundCluster.markers.length;
                foundCluster.centerLng = foundCluster.markers.reduce((sum, o) => sum + o.geometry.coordinates[0], 0) / totalMarkers;
                foundCluster.centerLat = foundCluster.markers.reduce((sum, o) => sum + o.geometry.coordinates[1], 0) / totalMarkers;
            } else {
                // Create new cluster
                clusters.push({
                    centerLng: lng,
                    centerLat: lat,
                    markers: [feature]
                });
            }
        }); // foreach marker data

        // Create markers with zoom-adaptive offsets
        clusters.forEach(function(cluster) {
            // Add marker
            addMarker(
                cluster.markers[0], // Use first marker as dummy marker
                cluster.centerLng,
                cluster.centerLat,
                markerSize, 
                {
                    is: cluster.markers.length > 1 ? true : false,
                    count: cluster.markers.length,
                    coordinates: {
                        lng: cluster.centerLng,
                        lat: cluster.centerLat,
                    },
                    markers: cluster.markers,
                }
            );
        });// foreach clusters
    }// drawMarkers

    /**
     * addMarker
     * Add a marker on the map
     */
    function addMarker(feature, coordLng, coordLat, markerSize, cluster) {
        // Get HTML template for popups
        let html = $('#map-templates div[data-template="marker"]').clone();
        html.find('.map-marker').attr('data-index', feature.properties.index);
        html.find('.map-marker').css('width', `${markerSize}px`).css('height', `${markerSize}px`);

        // Get property for coloring
        const colorProperty = schema[config.operations.counties_color_column];
        const colorPropertyValue = feature.properties[colorProperty.column];

        // Add marker color
        html.find('.map-marker').css('border-color', colorProperty.options[colorPropertyValue].color);

        // Add marker icon
        if (cluster.is) {
            html.find('.map-marker').attr('data-cluster', 'true');
            html.find('.map-marker-icon').html(`<span style="line-height:calc(${markerSize}px - 4px);">${cluster.count}</span>`);
        } else {
            html.find('.map-marker-icon').html(`<i class="fa-solid fa-${colorProperty.options[colorPropertyValue].icon}" style="line-height:calc(${markerSize}px - 4px);"></i>`);
        }

        // Add event listeners
        html.on('click', '.map-marker', () => {
            if (isPopupOpen($(this).attr('data-index'))) {
                closeAllPopups();
            } else {
                handleMarkerOpen('click', feature.properties, coordLng, coordLat, cluster);
            }
        });

        html.on('mouseenter', '.map-marker', () => {
            // Ignore if popup open
            if (isPopupOpen()) {
                return true;
            }

            if (cluster && cluster.is) {
                updateRegionHighlight(feature.properties, []);
            } else {
                updateRegionHighlight(feature.properties);
            }
        });

        html.on('mouseleave', '.map-marker', () => {
            // Ignore if popup open
            if (isPopupOpen()) {
                return true;
            }

            updateRegionHighlight(feature.properties, []);
        });

        // Create and add marker to map, store reference for zoom updates
        const marker = new mapboxgl.Marker(html.get(0))
            .setLngLat([coordLng, coordLat])
            .addTo(map);

        allMarkers.push(marker);
    }//addMarker

    /**
     * handleMarkerOpen
    * Highlight counties and show popup
    */
    function handleMarkerOpen(action, properties, coordLng, coordLat, cluster) {
        // Close all other popups
        closeAllPopups();

        // Respond to cluster click
        if (cluster && cluster.is && map.getZoom() < map.getMaxZoom()) {

            // Fly and zoom into cluster location
            map.flyTo({
                center: cluster.coordinates,
                zoom: map.getZoom() + 1,
                duration: 200,
                essential: true,
            });

            return true;             
        } else if (! cluster || ! cluster.is) {
            // Determine if current zoom level is too large to view counties
            let zoomLevel = map.getZoom();
            let offsetLat = 0;
            if (action != 'cluster-click') {
                offsetLat = (zoomLevel > 6 ? 1: 2.1);

                if (zoomLevel > 7) {
                    zoomLevel = 7;
                }
            }

            // Fly and zoom into marker location
            map.flyTo({
                center: [
                    coordLng,
                    coordLat - offsetLat, // Offset latitude to make room for popup
                ],
                zoom: zoomLevel,
                duration: 500,
                essential: true,
            });
        }

        // Create popup
        const popup = new mapboxgl.Popup({ 
            offset: 18,
            closeButton: true,
            closeOnClick: false,
            closeOnMove: false
        }).setHTML(
            fillPopup(action, properties, cluster)
        );

        // Add popup to map
        popup.setLngLat([coordLng, coordLat]).addTo(map);

        // Paint map regions, not for cluster markers
        if (! cluster || ! cluster.is) {
            updateRegionHighlight(properties);
        } else {
            updateRegionHighlight(properties, []);
        }
    }// handleMarkerOpen

    function updateRegionHighlight(properties, regions) {
        // Get list of regions served, get marker counties if not provided
        let regionsServed = regions;
        if (typeof regions == 'undefined') {
            regionsServed = properties[schema.counties_served.column];
        }

        // Apply county highlighting
        const type = properties[schema[config.operations.counties_color_column].column];
        map.setPaintProperty('counties-fill', 'fill-color', schema[config.operations.counties_color_column].options[type].color ?? config.operations.counties_color_default);
        map.setFilter('counties-fill', ['in', 'NAME', ...regionsServed]);
        map.setFilter('counties-border-highlight', ['in', 'NAME', ...regionsServed]);
    }// updateRegionHighlight

    /**
     * fillPopup
     * Fill the popup template with data
     */
    function fillPopup(action, data, cluster) {
        // Get HTML template for popups
        let template = cluster && cluster.is ? 'popup-cluster' : 'popup';
        let html = $('#map-templates div[data-template="' + template + '"]').clone();

        // Populate HTML with data
        html.find('.map-popup-wrapper')
            .attr('data-template', template)
            .attr('data-index', data.index)
            .attr('data-action', action);
        html = populateHtmlData(html, data);

        // Handle cluster-specific components
        if (cluster && cluster.is) {
            // Sort list in cluster popup
            cluster.markers.sort((a,b) => {
                let a_name = a.properties[schema[config.operations.sort_column].column];
                let b_name = b.properties[schema[config.operations.sort_column].column];
                return (a_name > b_name) ? 1 : ((b_name > a_name) ? -1 : 0)
            });

            // Generate and append list HTML
            cluster.markers.forEach((item) => {
                // Get cluster list item
                let list_item = html.find('.mp-body-row[data-type="template"]').clone();
                list_item.removeAttr('data-type');

                // Populate HTML with data
                list_item = populateHtmlData(list_item, item.properties);

                // Append to HTML template
                html.find('.mp-body').append(list_item);
            });
        }

        // Remove templates
        html.find('[data-type="template"]').remove();

        return html.html();
    }// fillPopup

    function populateHtmlData(html, data) {
        // Add data index to root container
        html.attr('data-index', data.index);

        // Popuplate the template based on the schema's definition and the given data
        Object.values(schema).forEach((property) => {

            // Get property value
            let propertyValue = data[property.column];

            // Clean property value
            if (propertyValue) {
                if (typeof propertyValue == 'string') {
                    propertyValue = propertyValue.trim();
                }

                // Ignore if property value not applicable
                if (propertyValue == '*') {
                    propertyValue = '';
                }
            }

            // Format-specific values
            if (property.format) {

                switch (property.format) {

                    case 'float':
                        // Float format to two decimal places
                        propertyValue = propertyValue.toFixed(2);
                        break;

                    case 'csv':
                        // Comma-separated format for arrays
                        propertyValue = propertyValue.join(', ');
                        break;
                }

            }

            // Type-specific displays
            if (property.type) {

                switch(property.type) {

                    case 'website':

                        if (propertyValue) {
                            html.find(`[data-mp-property="${property.id}"]`).attr('href', propertyValue);
                            html.find(`[data-mp-property="${property.id}"]`).attr('title', property.label);
                            html.find(`[data-mp-property-label="${property.id}"]`).text(property.label);
                        } else {
                            html.find(`[data-mp-property="${property.id}"]`).remove();
                        }

                        break;
                    
                    case 'social':

                        if (propertyValue) {
                            let socialLink = html.find('.mp-footer-icons [data-type="template"]').clone();
                            socialLink.removeAttr('data-type');
                            socialLink.attr('href', propertyValue);
                            socialLink.attr('title', property.label);

                            let socialIcon = getIcon(property.id);
                            socialLink.css('background-color', socialIcon.color);
                            socialLink.html(socialIcon.html);

                            html.find('.mp-footer-icons').append(socialLink);
                        }

                        break;

                    case 'cil_percent':

                        if (propertyValue) {
                            propertyValue = Math.round((propertyValue / config.operations.cil_max) * 100);
                            html.find(`[data-mp-property="${property.id}"]`).css('background', `radial-gradient(closest-side, #fff 0%, transparent 80% 100%), conic-gradient(var(--color-ocean) ${propertyValue}%, #e1e1e1 0)`);
                        }

                        break;

                }
    
            } else {

                if (propertyValue) {
                    // Apply property label
                    html.find(`[data-mp-property-label="${property.id}"]`).text(property.label);

                    // Apply property value
                    html.find(`[data-mp-property="${property.id}"]`).text(propertyValue);

                    // Apply property label and value together
                    html.find(`[data-mp-property-pair="${property.id}"] label`).text(property.label);
                    html.find(`[data-mp-property-pair="${property.id}"] span`).text(propertyValue);

                    // Apply property description tooltip
                    if (property.description) {
                        let info_icon = getIcon('info');
                        html.find(`[data-mp-property-pair="${property.id}"] label`).append(info_icon.html);
                        html.find(`[data-mp-property-pair="${property.id}"] label`).attr('title', property.description);
                    }
                } else {
                    html.find(`[data-mp-property-label="${property.id}"]`).remove();
                    html.find(`[data-mp-property="${property.id}"]`).remove();
                    html.find(`[data-mp-property-pair="${property.id}"]`).remove();
                }

            }

        });

        return html;
    }//populateHtmlData

    /**
     * getIcon
     * Get the icon HTML for the give type
     */
    function getIcon (type) {
        // Initialize
        let icon = '';

        if (config.icons[type]) {
            icon = config.icons[type];

            // Format HTML to Font Awesome standards
            icon.html = `<i class="fa-${icon.group} fa-${icon.id}"></i>`;
        } else {
            icon = config.icons.default;
            icon.html = `<span>${type.charAt(0)}</span>`;
        }

        return icon;
    }// getIcon

    function resetCountyFilters() {
        // Remove county filter styles
        map.setFilter('counties-fill', ['in', 'NAME', '']);
        map.setFilter('counties-border-highlight', ['in', 'NAME', '']);
    }// resetCountyFilters

    function closeAllPopups(manual) {
        // Reset county filters
        resetCountyFilters();

        // Close all popups
        $('.mapboxgl-popup').each(function(){
            $(this).remove();
        });

        // Zoom out if manually closed
        if (manual) {
            let zoomLevel = map.getZoom();
            if (zoomLevel > 7) {
                zoomLevel = 7;
            }

            map.flyTo({
                zoom: zoomLevel
            });
        }
    }// closeAllPopups

    function isPopupOpen(id) {
        let popupElements = '.mapboxgl-popup';

        if (id) {
            popupElements += '.map-popup-wrapper[data-index="' + id + '"]';
        }
        
        return ($(popupElements).length > 0);
    }// isPopupOpen

    /**
     * Define Map Listeners
     */

    // Handle popup close request
    $(document).on('click', '.mapboxgl-popup-close-button, .mp-close', () => {
        closeAllPopups(true);
    });
    $('#map').on('keyup', function(e) {
        if (e.keyCode === 27) {
            closeAllPopups(true);
        }
    });

    $(document).on('click', '.map-popup-wrapper .mp-body-row', function() {
        let id = $(this).attr('data-index');

        handleMarkerOpen(
            'cluster-click',
            config.data.markers.features[id].properties,
            config.data.markers.features[id].geometry.coordinates[0],
            config.data.markers.features[id].geometry.coordinates[1],
        );
    });

    /**
     * Map Zoom
     */
    map.on('zoom', function() {

      clearTimeout(window.zoomUpdateTimeout);

      window.zoomUpdateTimeout = setTimeout(() => {
        // Update markers
        drawMarkers();
      }, 150);
    });

    /**
     * Menu
     */

    $('#menu #menu-toggle a').on('click', function() {
        if ($('#menu').attr('data-visible') == 'true') {
            $('#menu').attr('data-visible', 'false');
        } else {
            $('#menu').attr('data-visible', 'true');
        }
    });
});