import { isMobile } from './utils.js';
import { layerCensusCounties } from '/assets/data/censusCounties.js';
import { layerMarkers } from '/assets/data/markers.js';

export class Map_ECO {

    constructor(config, config_system) {
        this.debug = config.debug;
        this.config = {
            icons: config_system.icons,
            map: config.map,
            mapOperations: config.mapOperations,
            schema: config.schema,
            layerCensusCategories: config_system.layerCensusCategories,
        },
        this.map = null;
        this.markerData = null;
        this.allMarkers = []; // Current, filtered markers
        this.clusters = []; // Marker clusters

        this.allCountyNames = []; // Stores all county names
        this.countiesLoaded = false; // Store loaded counties
        this.activeFilters = [];
        this.activeFilterCategory = '';

        this.timeouts = {
            zoomUpdate: null
        };
    }// constructor

    /**
     * init
     * Initialize the map
     */
    init() {

        // Initialize map
        this.map = new mapboxgl.Map({
            accessToken: this.config.map.access_token,
            container: this.config.map.canvas_id,
            style: this.config.map.style,
            center: this.config.map.center,
            zoom: this.config.map.zoom.default,
            minZoom: this.config.map.zoom.min,
            maxZoom: this.config.map.zoom.max,
            attributionControl: false,
            maxBounds: this.config.map.bounds.max,
        });

        // Animate initial map view
        this.map.fitBounds(this.config.map.bounds.fit.bbox, {
            padding: this.config.map.bounds.fit.padding,
            duration: this.config.map.bounds.fit.duration,
        });

        // Map controls
        const nav = new mapboxgl.NavigationControl({
            showCompass: false,
        });
        this.map.addControl(nav, 'bottom-right');

        // disable map rotation using right click + drag
        this.map.dragRotate.disable();

        // disable map rotation using touch rotation gesture
        this.map.touchZoomRotate.disableRotation();

        // Map attribution
        this.map.addControl(new mapboxgl.AttributionControl({
            compact: true,
            customAttribution: 'Map design by <a href="https://bloom.li" target="_blank" title="Bloom Labs">Bloom Labs</a>'
        }));

        // Load the map
        this.map.on('load', () => {

            // Initialize marker data
            this.markerData = layerMarkers;

            // Fetch counties GeoJSON
            if (layerCensusCounties && layerCensusCounties.features.length > 0) {
                // Store all county names
                this.allCountyNames = layerCensusCounties.features
                    .map(feature => feature.properties.NAME)
                    .filter(name => name);

                this.countiesLoaded = true;
            }

            // Conduct the initial build of map components
            this.initializeBuildProcess();
        });// map load

        /**
         * Define Map Listeners
         */

        // Handle popup close request
        $(document).on('click', '.mapboxgl-popup-close-button, .mp-close', () => {
            this.closeAllPopups(true);
        });
        $('#map').on('keyup', (e) => {
            if (e.keyCode === 27) {
                this.closeAllPopups(true);
            }
        });

        // Map Marker Open
        $(document).on('click', '.map-popup-wrapper .mp-body-row', (e) => {
            let id = $(e.currentTarget).attr('data-index');

            this.handleMarkerOpen(
                'cluster-click',
                layerMarkers.features[id].properties,
                layerMarkers.features[id].geometry.coordinates[0],
                layerMarkers.features[id].geometry.coordinates[1],
            );
        });

        // Map Zoom
        this.map.on('zoomend', () => {
            // Check if map animation is initializing
            const zoomInit = (! this.timeouts.zoomUpdate);

            clearTimeout(this.timeouts.zoomUpdate);

            this.timeouts.zoomUpdate = setTimeout(() => {
                // Update markers if not initializing the map
                if (! zoomInit) {
                    this.drawMarkers();
                }
            }, 150);
        });

        // Menu
        $('#menu #menu-toggle a#menu-toggle-open').on('click', () => {
            if ($('#menu').attr('data-visible') == 'true') {
                $('#menu').attr('data-visible', 'false');
            } else {
                $('#menu').attr('data-visible', 'true');
            }
        });

        /**
        * Responsive Effects
        * Fill URL for small-screen popout link
        */
        let page_url = window.location.href;
        $('#warning-reason-smallscreen a').attr('href', page_url);
    }// init

    /**
    * initializeBuildProcess
    * Conduct the initial build of map components
    */
    initializeBuildProcess() {
        try {
            // Clean the data
            this.cleanData();

            // Add layer data
            this.addLayerData();

            // Add filter options
            this.buildFilterOptions();

            // Add layer options
            this.buildLayerOptions();

            // Add markers
            this.drawMarkers();

            // Open menu on desktop
            if(! isMobile()) {
                $('#menu').attr('data-visible', 'true');
            }
        } catch (error) {
            if (this.debug) {
                console.error('Error in initial build process:', error);
            }
        }
    }// initializeBuildProcess

    /**
     * cleanData
     * Clean up incoming data
     */
    cleanData() {

        // Initialize
        let cleaned = [];

        // Filter and update data
        this.markerData.features.filter((feature) => 
                // Ignore if invalid GeoJSON properties
                (feature.geometry && feature.geometry.coordinates)
            )
            .map((feature, index) => {

                // Set marker index
                feature.properties.index = index;

                // Get list of counties served
                let countiesServed = feature.properties[
                    this.config.schema[
                        this.config.mapOperations.counties_column
                    ].column
                ];

                // Turn county list into array and clean up
                countiesServed = countiesServed
                    .split(this.config.mapOperations.county_delimiter)
                    .map(s => s.trim());

                let countiesServedLabel = 'None';

                if (countiesServed.map(s => s.toLowerCase()).includes(this.config.mapOperations.county_all_term)) {
                    if (! this.countiesLoaded || this.allCountyNames.length === 0) {
                        countiesServed = [];
                    } else {
                        countiesServed = [...this.allCountyNames];
                    }
                    countiesServedLabel = this.config.mapOperations.county_all_term.charAt(0).toUpperCase() + this.config.mapOperations.county_all_term.substring(1);
                } else {
                    countiesServed = countiesServed.map(s => this.normalizeCountyName(s));
                    countiesServedLabel = countiesServed.join(', ');
                }

                feature.properties[this.config.schema[this.config.mapOperations.counties_column].column] = countiesServed;
                feature.properties[this.config.schema[this.config.mapOperations.counties_column].column + '_label'] = countiesServedLabel;

                // Update CIL value to float
                feature.properties[this.config.schema['cil_number'].column] = parseFloat(feature.properties[this.config.schema['cil_number'].column]).toFixed(2);

                // Split CIL label and description
                let cil_description_parts = feature.properties[this.config.schema['cil_description'].column].split(this.config.mapOperations.cil_label_delimiter);
                if (cil_description_parts.length > 1) {
                    feature.properties[this.config.schema['cil_label'].column] = cil_description_parts.shift().trim();
                    feature.properties[this.config.schema['cil_description'].column] = cil_description_parts.join(this.config.mapOperations.cil_label_delimiter).trim();
                }

                // Owner Type: Capitalize the first letter and lowercase everything else
                let owner_type = feature.properties[this.config.schema['owner_type'].column];
                if (owner_type) {
                    owner_type = owner_type.charAt(0).toUpperCase() + owner_type.substring(1).toLowerCase();
                    feature.properties[this.config.schema['owner_type'].column] = owner_type;
                }
            }
        );
    }// cleanData

    /**
     * normalizeCountyName
     * County name normalization function
     */
    normalizeCountyName(name) {
        name = name.trim().toLowerCase();

        // Check special cases first
        if (this.config.mapOperations.county_name_exceptions[name]) {
            return this.config.mapOperations.county_name_exceptions[name];
        }

        // Title case for normal county names (first letter of each word capitalized)
        return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }//normalizeCountyName

    /**
     * addLayerData
     * Add layer data to the map
     */
    addLayerData() {

        // Add density layer to map layer list
        this.addDensityLayer();

        // Load counties boundary source
        this.map.addSource('counties', {
            type: 'geojson',
            data: layerCensusCounties
        });

        // Load census-enhanced counties source
        this.map.addSource('census-counties', {
            type: 'geojson',
            data: layerCensusCounties
        });

        /**
         * Load Map Source Data
         * Once the county GeoJSON is loaded, store all county names
         */
        this.map.on('sourcedata', (e) => {
            if (e.sourceId !== 'counties' || ! e.isSourceLoaded || this.countiesLoaded) return;

            // Extract all county names when source is loaded
            try {
                const source = this.map.getSource('counties');
                if (source._data && source._data.features) {
                    this.allCountyNames = source._data.features
                        .map(feature => feature.properties.NAME)
                        .filter(name => name); // filter out any undefined/null

                    // Mark counties as loaded
                    this.countiesLoaded = true;
                }
            } catch (err) {
                if (this.debug) {
                    console.error('Error extracting county names:', err);
                }
            }
        }); // on.sourcedata

        /**
         * County & Census Highlights
         */
        this.map.addLayer({
            id: 'counties-fill',
            type: 'fill',
            source: 'counties',
            paint: {
                'fill-color': '#b3d8f6', // Default: light blue
                'fill-opacity': 0.35
            },
            filter: ['in', 'NAME', '']
        });

        this.map.addLayer({
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
        this.map.on('error', (e) => {
            if (this.debug) {
                console.error('Map error:', e);
            }
        });

        // Add county boundary outlines
        try {
            this.map.addLayer({
                id: 'counties-border',
                type: 'line',
                source: 'counties',
                paint: {
                    'line-color': '#333',
                    'line-width': 2,
                    'line-opacity': 0.4
                }
            });

            this.map.addLayer({
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
            if (this.debug) {
                console.error('Error adding county boundary layers:', error);
            }
        }

        // Add county labels
        try {
            this.map.addLayer({
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
            if (this.debug) {
                console.error('Error adding county labels layer:', error);
            }
        }

    }//addLayerData

    /**
     * buildFilterOptions
     * Gather categories for filtering
     */
    buildFilterOptions() {
        // Initialize with no filter option
        let categories = [
            {
                id: 'none',
                title: 'No Filters',
                active: true,
            }
        ];

        // Populate categories with unique values from each data record
        this.markerData.features.forEach((record) => {

            // Popuplate the template based on the schema's definition and the given data
            Object.values(this.config.schema).forEach((property) => {

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

                category.options_data = Object.values(category.options_data);

                // Sort category options
                category.options_data.sort((a,b) => {
                    return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0)
                });

                category.options_data.forEach((option) => {

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
        $('#menu').on('click', '.menu-container[data-container="filters"] .mc-category-title', (e) => {
            let parent = $(e.currentTarget).parent('.mc-category');

            // Ignore if already active
            if (parent.hasClass('active')) {
                return false;
            }

            // Deactivate active categories
            $('.menu-container[data-container="filters"] .mc-category.active').removeClass('active');

            // Activate requested category and its options
            parent.addClass('active');
            parent.find('.mc-category-option').addClass('active');
            parent.attr('data-has-selected', 'true');
            this.activeFilterCategory = parent.attr('data-id');

            // Update markers
            this.drawMarkers();
        });

        // Filter category option listener
        $('#menu').on('click', '.menu-container[data-container="filters"] .mc-category-option', (e) => {
            // Activate or deactivate requested category
            $(e.currentTarget).toggleClass('active');

            // Update markers
            this.drawMarkers();
        });
    }//buildFilterOptions

    /**
     * buildLayerOptions
     * Gather categories for layering
     */
    buildLayerOptions() {
        // Initialize with no layer option
        let layers = Object.values(this.config.layerCensusCategories);
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

            // Add category title and description
            categoryHtml.find('.mc-category-title .mc-item-label span:first-child').text(layer.title);
            categoryHtml.find('.mc-category-title .mc-item-label span:last-child').text(layer.source);
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
        $('#menu').on('click', '.menu-container[data-container="layers"] .mc-category-title', (e) => {
            let parent = $(e.currentTarget).parent('.mc-category');

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

            // Get layer
            const layer = this.config.layerCensusCategories[parent.attr('data-id')];

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
                this.map.setPaintProperty('census-overlay', 'fill-color', expression);
                this.map.setLayoutProperty('census-overlay', 'visibility', 'visible');
            } else {
                // Hide layer
                this.map.setLayoutProperty('census-overlay', 'visibility', 'none');
            }
        });
    }//buildLayerOptions
    
    /**
     * drawMarkers
     * Update markers
     */
    drawMarkers() {
        // Clear existing markers and popups
        this.allMarkers.forEach(marker => marker.remove());
        this.allMarkers = [];
        this.clusters = [];

        // Check if marker data exists
        if (! this.markerData || ! this.markerData.features) return;

        // Get current zoom level for adaptive behavior
        const currentZoom = this.map.getZoom();
        const maxZoom = this.map.getMaxZoom();
      
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
            this.activeFilters = ['all'];
        } else {
            let filterOptionsActive = filterCategoryActive.find('.mc-category-option.active');

            if (filterOptionsActive.length > 0) {
                this.activeFilters = [];
                filterOptionsActive.each((e, i) => {
                    this.activeFilters.push($(i).attr('data-id'));
                });
            } else {
                this.activeFilters = [''];
            }
        }

        // Group nearby markers into clusters with filtering
        this.markerData.features.forEach((feature) => {
            // Ignore if invalid GeoJSON properties
            if (!feature.geometry || !feature.geometry.coordinates) return;

            // Apply filter
            if (this.activeFilterCategory && ! this.activeFilters.includes('all')) {
                let filterPropertyValue = feature.properties[this.config.schema[this.activeFilterCategory].column];
                if (! filterPropertyValue) return;
                filterPropertyValue = filterPropertyValue.toString().trim();
                if (! filterPropertyValue || ! this.activeFilters.includes(filterPropertyValue)) return;
            }

            // Get coordinates
            const lng = feature.geometry.coordinates[0];
            const lat = feature.geometry.coordinates[1];

            // Find existing cluster within proximity threshold
            let foundCluster = null;
            for (let cluster of this.clusters) {
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
                this.clusters.push({
                    centerLng: lng,
                    centerLat: lat,
                    markers: [feature]
                });
            }
        }); // foreach marker data

        // Create markers with zoom-adaptive offsets
        this.clusters.forEach((cluster) => {
            // Add marker
            this.addMarker(
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
    addMarker(feature, coordLng, coordLat, markerSize, cluster) {
        // Get HTML template for popups
        let html = $('#map-templates div[data-template="marker"]').clone();
        html.find('.map-marker').attr('data-index', feature.properties.index);
        html.find('.map-marker').css('width', `${markerSize}px`).css('height', `${markerSize}px`);

        // Get property for coloring
        const colorProperty = this.config.schema[this.config.mapOperations.counties_color_column];
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
            this.handleMarkerOpen('click', feature.properties, coordLng, coordLat, cluster);
        });

        html.on('mouseenter', '.map-marker', () => {
            // Ignore if popup open
            if (this.isPopupOpen()) {
                return true;
            }

            if (cluster && cluster.is) {
                this.updateRegionHighlight(feature.properties, []);
            } else {
                this.updateRegionHighlight(feature.properties);
            }
        });

        html.on('mouseleave', '.map-marker', () => {
            // Ignore if popup open
            if (this.isPopupOpen()) {
                return true;
            }

            this.updateRegionHighlight(feature.properties, []);
        });

        // Create and add marker to map, store reference for zoom updates
        const marker = new mapboxgl.Marker(html.get(0))
            .setLngLat([coordLng, coordLat])
            .addTo(this.map);

        this.allMarkers.push(marker);
    }//addMarker

    /**
     * handleMarkerOpen
    * Highlight counties and show popup
    */
    handleMarkerOpen(action, properties, coordLng, coordLat, cluster) {
        // Close all other popups
        this.closeAllPopups();

        // Determine if current zoom level is too large to view counties
        let zoomLevel = this.map.getZoom();
        let offsetLat = (zoomLevel > 6 ? 1: 2.6);

        if (zoomLevel > 7) {
            zoomLevel = 7;
        }

        // Fly and zoom into marker location
        this.map.flyTo({
            center: [
                coordLng,
                coordLat - offsetLat, // Offset latitude to make room for popup
            ],
            zoom: zoomLevel,
            duration: 500,
            essential: true,
        });

        // Create popup
        const popup = new mapboxgl.Popup({ 
            offset: 18,
            closeButton: true,
            closeOnClick: false,
            closeOnMove: false
        }).setHTML(
            this.fillPopup(action, properties, cluster)
        );

        // Add popup to map
        popup.setLngLat([coordLng, coordLat]).addTo(this.map);

        // Paint map regions, not for cluster markers
        if (! cluster || ! cluster.is) {
            this.updateRegionHighlight(properties);
        } else {
            this.updateRegionHighlight(properties, []);
        }
    }// handleMarkerOpen

    updateRegionHighlight(properties, regions) {
        // Get list of regions served, get marker counties if not provided
        let regionsServed = regions;
        if (typeof regions == 'undefined') {
            regionsServed = properties[this.config.schema.counties_served.column];
        }

        // Apply county highlighting
        const type = properties[this.config.schema[this.config.mapOperations.counties_color_column].column];
        this.map.setPaintProperty('counties-fill', 'fill-color', this.config.schema[this.config.mapOperations.counties_color_column].options[type].color ?? this.config.mapOperations.counties_color_default);
        this.map.setFilter('counties-fill', ['in', 'NAME', ...regionsServed]);
        this.map.setFilter('counties-border-highlight', ['in', 'NAME', ...regionsServed]);
    }// updateRegionHighlight

    /**
     * fillPopup
     * Fill the popup template with data
     */
    fillPopup(action, data, cluster) {
        // Get HTML template for popups
        let template = cluster && cluster.is ? 'popup-cluster' : 'popup';
        let html = $('#map-templates div[data-template="' + template + '"]').clone();

        // Populate HTML with data
        html.find('.map-popup-wrapper')
            .attr('data-template', template)
            .attr('data-index', data.index)
            .attr('data-action', action);
        html = this.populateHtmlData(html, data);

        // Handle cluster-specific components
        if (cluster && cluster.is) {
            // Sort list in cluster popup
            cluster.markers.sort((a,b) => {
                let a_name = a.properties[this.config.schema[this.config.mapOperations.sort_column].column];
                let b_name = b.properties[this.config.schema[this.config.mapOperations.sort_column].column];
                return (a_name > b_name) ? 1 : ((b_name > a_name) ? -1 : 0)
            });

            // Generate and append list HTML
            cluster.markers.forEach((item) => {
                // Get cluster list item
                let list_item = html.find('.mp-body-row[data-type="template"]').clone();
                list_item.removeAttr('data-type');

                // Populate HTML with data
                list_item = this.populateHtmlData(list_item, item.properties);

                // Append to HTML template
                html.find('.mp-body').append(list_item);
            });
        }

        // Remove templates
        html.find('[data-type="template"]').remove();

        return html.html();
    }// fillPopup

    populateHtmlData(html, data) {
        // Add data index to root container
        html.attr('data-index', data.index);

        // Popuplate the template based on the schema's definition and the given data
        Object.values(this.config.schema).forEach((property) => {

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

                            // Get custom social title
                            let propertyValueTitle = property.label;
                            let propertyValueIcon = property.id;
                            if (propertyValue.includes('|')) {
                                let propertyValueParts = propertyValue.split('|');
                                propertyValue = propertyValueParts[0];
                                propertyValueTitle = propertyValueParts[1];
                                propertyValueIcon = propertyValueTitle.toLowerCase();
                            }

                            socialLink.attr('href', propertyValue);
                            socialLink.attr('title', propertyValueTitle);

                            let socialIcon = this.getIcon(propertyValueIcon);
                            socialLink.css('background-color', socialIcon.color);
                            socialLink.html(socialIcon.html);

                            html.find('.mp-footer-icons').append(socialLink);
                        }

                        break;

                    case 'cil_percent':

                        if (propertyValue) {
                            propertyValue = Math.round((propertyValue / this.config.mapOperations.cil_max) * 100);
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
                        let info_icon = this.getIcon('info');
                        html.find(`[data-mp-property-pair="${property.id}"] label`).append(info_icon.html);
                        html.find(`[data-mp-property-pair="${property.id}"] label i`).attr('title', property.description);
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
    getIcon (type) {
        // Initialize
        let icon = '';

        if (this.config.icons[type]) {
            icon = this.config.icons[type];

            // Format HTML to Font Awesome standards
            icon.html = `<i class="fa-${icon.group} fa-${icon.id}"></i>`;
        } else {
            icon = this.config.icons.default;
            icon.html = `<span>${type.charAt(0)}</span>`;
        }

        return icon;
    }// getIcon

    resetCountyFilters() {
        // Remove county filter styles
        this.map.setFilter('counties-fill', ['in', 'NAME', '']);
        this.map.setFilter('counties-border-highlight', ['in', 'NAME', '']);
    }// resetCountyFilters

    closeAllPopups(manual) {
        // Reset county filters
        this.resetCountyFilters();

        // Close all popups
        $('.mapboxgl-popup').each((e, i) => {
            $(i).remove();
        });

        // Zoom out if manually closed
        if (manual) {
            let zoomLevel = this.map.getZoom();

            if (zoomLevel > 6) {
                zoomLevel = 6;
            }

            this.map.flyTo({
                zoom: zoomLevel
            });
        }
    }// closeAllPopups

    isPopupOpen() {
        return ($('.mapboxgl-popup').length > 0);
    }// isPopupOpen

    addDensityLayer() {
        // Initialize
        let countiesDensity = {};

        this.markerData.features.forEach((outlet) => {
            // Get counties served value
            let countiesServed = outlet.properties[this.config.schema.counties_served.column];

            if (countiesServed.map(s => s.toLowerCase()).includes(this.config.mapOperations.county_all_term)) {
                countiesServed = [...this.allCountyNames];
            }

            // Tally each county served
            countiesServed.forEach((c) => {
                c = c.trim();

                if (! countiesDensity[c]) {
                    countiesDensity[c] = 0;
                }

                countiesDensity[c]++;
            });
        });

        layerCensusCounties.features.forEach((county, i) =>  {
            let index = county.properties.NAME;
            county.properties['Outlet Density'] = 0;

            if (countiesDensity[index]) {
                layerCensusCounties.features[i].properties['Outlet Density'] = countiesDensity[index];
            }
        });
    }//addDensityLayer
}; // Map_ECO