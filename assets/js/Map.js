import { isMobile, isValidGeoJSON } from './utils.js';

export class Map {

    constructor(configInstance, configSystem) {

        // Enable error logging for debugging
        this.debug = configInstance.debug;

        // Apply system configuration settings
        this.system = configSystem;

        // Apply custom configuration settings
        this.config = {
            webpage: configInstance.webpage,
            map: configInstance.map,
            mapOperations: configInstance.mapOperations,
            data: configInstance.data,
            schema: configInstance.schema,
            layerCategories: configSystem.layerCategories,
        };

        // Map interface object
        this.map = null;

        // Map layer configuration
        this.layers = {

            // The marker layer
            markers: {
                geojson: null, // All marker data as GeoJSON
                mapped: [], // Dynamic array of markers filtered and displayed on the map
                status: {
                    drawing: false, // If markers are currently being drawn
                    filter: null, // Current active marker data filter
                }
            },

            // The regions layer for map tile labeling and styling
            regions: { // Data for regions on the map
                geojson: [], // Data for regions, including boundary definitions and category values
                labels: [], // Generated array of region labels for map labeling
            }
        };
    }// constructor

    /**
     * init
     * Initialize the Map application
     */
    init() {

        // Initialize the Map interface and layers
        this.initMapInterface();

        // Initialize the page template
        this.initPageTemplate();
    }// init

    /**
     * initMapInterface
     * Initialize the mapping software interface
     */
    initMapInterface() {

        // Initialize the map object with default settings
        this.map = new mapboxgl.Map({
            accessToken: this.config.map.accessToken,
            container: this.config.map.canvasId,
            style: this.config.map.style,
            center: this.config.map.center,
            zoom: this.config.map.zoom.default,
            minZoom: this.config.map.zoom.min,
            maxZoom: this.config.map.zoom.max,
            attributionControl: false,
            maxBounds: this.config.map.bounds.max,
        });

        // Add initial view animation
        this.map.fitBounds(this.config.map.bounds.fit.bbox, {
            padding: this.config.map.bounds.fit.padding,
            duration: this.config.map.bounds.fit.duration,
        });

        // Add map controls
        let nav = new mapboxgl.NavigationControl({
            showCompass: false,
        });
        this.map.addControl(nav, 'bottom-right');

        // Customize map attribution
        this.map.addControl(new mapboxgl.AttributionControl({
            compact: true,
            customAttribution: 'Map design by <a href="https://bloom.li" target="_blank" title="Bloom Labs">Bloom Labs</a>'
        }));

        // Disable map rotation using mouse or touch gestures
        this.map.dragRotate.disable();
        this.map.touchZoomRotate.disableRotation();

        /**
         * Apply Map Listeners
         */

        // Listener: Map loading completed
        this.map.on('load', () => {
            this.initMapLayers();
        });

        // Listener: Error handling
        if (this.debug) {
            this.map.on('error', (e) => {
                console.error('Map error:', e);
            });
        }
    }// initMapInterface

    /**
    * initMapLayers
    * Conduct the initial build of map layers, components, and functionality
    */
    async initMapLayers() {

        try {
            // Load Marker layer data and functionality
            await this.loadMarkerLayer();

            // Load Region layer data and functionality
            await this.loadRegionLayer();

        } catch (error) {
            if (this.debug) {
                console.error('Error in initMapLayers(): ', error);
            }
        }
    }// initMapLayers

    /**
     * initPageTemplate
     * Initialize the page template
     */
    initPageTemplate() {

        // Set webpage URL to external links
        $('.external-map-link').attr('href', this.config.webpage);

        /**
         * Activate listeners for menu
         */

        // Listener: Menu engagement
        $('#menu #menu-toggle a#menu-toggle-open').on('click', () => {
            if ($('#menu').attr('data-visible') == 'true') {
                $('#menu').attr('data-visible', 'false');
            } else {
                $('#menu').attr('data-visible', 'true');
            }
        });

        // Open menu on desktop
        if(! isMobile()) {
            $('#menu').attr('data-visible', 'true');
        }
    }// initPageTemplate

    /**
     * loadMarkerLayer
     * Load the marker layer
     */
    async loadMarkerLayer() {

        // Load the layer data from the given file
        let layerData = await this.loadFileData(this.config.data.markerDataFile);

        // Handle invalid layer data
        if (! layerData) {
            return false;
        }

        // Save the layer data
        this.layers.markers.geojson = layerData;

        // Clean the data
        this.cleanMarkerData();

        // Add markers
        this.setMarkerData();

        // Add marker filter options
        this.buildMarkerMenuOptions();

        /**
         * Activate marker listeners
         */

        // Listener: Map zoom completed
        setTimeout(() => {
            this.map.on('zoomend', () => {
                this.setMarkerData();
            });
            // Initialize after fitBounds is complete
        }, this.config.map.bounds.fit.duration);

        // Listener: Map cluster popup open request
        $(document).on('click', '.map-popup-wrapper .mp-body-row', (e) => {
            let id = $(e.currentTarget).attr('data-index');

            this.openPopup(
                'cluster-click',
                this.layers.markers.geojson.features[id].properties,
                this.layers.markers.geojson.features[id].geometry.coordinates[0],
                this.layers.markers.geojson.features[id].geometry.coordinates[1],
            );
        });

        // Listener: Map popup close request
        $(document).on('click', '.mapboxgl-popup-close-button, .mp-close', () => {
            this.closeAllPopups(true);
        });
        $('#map').on('keyup', (e) => {
            if (e.keyCode === 27) {
                this.closeAllPopups(true);
            }
        });
    }// loadMarkerLayer

    /**
     * loadRegionLayer
     * Load the data for the region layer
     */
    async loadRegionLayer() {

        // Load the layer data from the given file
        let layerData = await this.loadFileData(this.config.data.regionDataFile);

        // Handle invalid layer data
        if (! layerData) {
            return false;
        }

        // Save the layer data
        this.layers.regions.geojson = layerData;

        // Extract labels for regions
        this.layers.regions.labels = this.layers.regions.geojson.features
            .map(feature => feature.properties[this.config.data.regionNameProperty])
            .filter(name => name);

        // Set layer data
        this.setRegionData();

        // Add layer options
        this.buildRegionMenuOptions();
    }// loadRegionLayer

    /**
     * loadFileData
     * Load data from the given file
     */
    async loadFileData(file) {

        // Check file requirements
        if (! file) {
            return false;
        }

        // Initialize data for the layer
        let layerData = null;

        // Load data from file
        try {
            let { data } = await import(this.system.dir_data + file);
            layerData = data;
        } catch (error) {
            if (this.debug) {
                console.error('Error loading file: ', error);
            }

            return false;
        }

        // Validate expected GeoJSON-formatted data
        if (! layerData || ! isValidGeoJSON(layerData)) {
            if (this.debug) {
                console.error('Error loading GeoJSON for layer');
            }

            return false;
        }

        return layerData;
    }// loadFileData

    /**
     * cleanMarkerData
     * Clean the marker data
     */
    cleanMarkerData() {

        // Filter and update data
        this.layers.markers.geojson.features.filter((feature) => 
                // Ignore if invalid GeoJSON properties
                (feature.geometry && feature.geometry.coordinates)
            )
            .map((feature, index) => {

                // Set marker index
                feature.properties.index = index;

                // Get list of regions served
                let regionsServed = feature.properties[
                    this.config.schema[
                        this.config.mapOperations.regions_column
                    ].column
                ];

                // Turn region list into array and clean the string
                regionsServed = regionsServed
                    .split(this.config.mapOperations.region_delimiter)
                    .map(s => s.trim());

                let regionsServedLabel = 'None';

                if (regionsServed.map(s => s.toLowerCase()).includes(this.config.mapOperations.region_all_term)) {
                    if (this.layers.regions.labels.length > 0) {
                        regionsServed = [...this.layers.regions.labels];
                    } else {
                        regionsServed = [];
                    }
                    regionsServedLabel = this.config.mapOperations.region_all_term.charAt(0).toUpperCase() + this.config.mapOperations.region_all_term.substring(1);
                } else {
                    regionsServed = regionsServed.map(s => this.normalizeRegionName(s));
                    regionsServedLabel = regionsServed.join(', ');
                }

                feature.properties[this.config.schema[this.config.mapOperations.regions_column].column] = regionsServed;
                feature.properties[this.config.schema[this.config.mapOperations.regions_column].column + '_label'] = regionsServedLabel;

                // Update CIL value to float
                feature.properties[this.config.schema.cil_number.column] = parseFloat(feature.properties[this.config.schema.cil_number.column]).toFixed(2);

                // Split CIL label and description
                let cil_description_parts = feature.properties[this.config.schema.cil_description.column].split(this.config.mapOperations.cil_label_delimiter);
                if (cil_description_parts.length > 1) {
                    feature.properties[this.config.schema.cil_label.column] = cil_description_parts.shift().trim();
                    feature.properties[this.config.schema.cil_description.column] = cil_description_parts.join(this.config.mapOperations.cil_label_delimiter).trim();
                }

                // Owner Type: Capitalize the first letter and lowercase everything else
                let owner_type = feature.properties[this.config.schema.owner_type.column];
                if (owner_type) {
                    owner_type = owner_type.charAt(0).toUpperCase() + owner_type.substring(1).toLowerCase();
                    feature.properties[this.config.schema.owner_type.column] = owner_type;
                }
            }
        );
    }// cleanMarkerData

    /**
     * normalizeRegionName
     * Normalize the given region name
     */
    normalizeRegionName(name) {
        // Transform name to lowercase
        name = name.trim().toLowerCase();

        // Check special cases first
        if (this.config.mapOperations.region_name_exceptions[name]) {
            return this.config.mapOperations.region_name_exceptions[name];
        }

        // Title case for normal region names (first letter of each word capitalized)
        return name.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }// normalizeRegionName

    /**
     * setMarkerData
     * Update marker data
     */
    setMarkerData() {
        // Ignore if drawing is currently active
        if (this.layers.markers.status.drawing) {return false;}

        // Update drawing status
        this.layers.markers.status.drawing = true;

        // Ignore if no marker layer
        if (! this.layers.markers.geojson) {
            this.layers.markers.status.drawing = false;
            return false;
        }

        // Clear existing markers
        while (this.layers.markers.mapped.length > 0) {
            // Shift marker off the mapped array
            let marker = this.layers.markers.mapped.shift();

            // Remove marker off the map
            marker.remove();
        }

        // Get current zoom level for adaptive behavior
        const currentZoom = this.map.getZoom();
        const maxZoom = this.map.getMaxZoom();
      
        // Dynamic proximity threshold based on zoom level
        // Higher zoom = smaller threshold (less clustering)
        // Lower zoom = larger threshold (more clustering)
        const baseThreshold = 0.2;
        const proximityThreshold = baseThreshold * Math.pow(0.7, currentZoom - 7);

        // Dynamic marker size based on zoom level
        const baseSize = 30;
        const markerSize = Math.max(12, Math.min(28, baseSize + (currentZoom - 7) * 2));

        // Initialize arrays for cluster and filter processing
        let clusters = [];
        let activeFilters = [];

        // Update active filters cache
        let filterCategoryActive = $('.menu-container[data-container="filters"]  .mc-category.active');

        if (filterCategoryActive.length == 0 || filterCategoryActive.find('.mc-category-option').length == 0) {
            activeFilters = ['all'];
        } else {
            let filterOptionsActive = filterCategoryActive.find('.mc-category-option.active');

            if (filterOptionsActive.length > 0) {
                activeFilters = [];
                filterOptionsActive.each((e, i) => {
                    activeFilters.push($(i).attr('data-id'));
                });
            } else {
                activeFilters = [''];
            }
        }

        // Group nearby markers into clusters with filtering
        this.layers.markers.geojson.features.forEach((feature) => {
            // Ignore if invalid GeoJSON properties
            if (!feature.geometry || !feature.geometry.coordinates) return;

            // Apply filter
            if (this.layers.markers.status.filter && ! activeFilters.includes('all')) {
                let filterPropertyValue = feature.properties[this.config.schema[this.layers.markers.status.filter].column];
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

            if (foundCluster) {
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
        clusters.forEach((cluster) => {
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
        });

        // Update drawing status
        this.layers.markers.status.drawing = false;

        return true;
    }// setMarkerData

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
        const colorProperty = this.config.schema[this.config.mapOperations.regions_color_column];
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

        /**
         * Add map marker listeners
         */

        // Listener: If marker is clicked
        html.on('click', '.map-marker', () => {
            this.openPopup('click', feature.properties, coordLng, coordLat, cluster);
        });

        // Listener: If cursor hovers over a marker
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

        // Listener: If cursor stops hovering over a marker
        html.on('mouseleave', '.map-marker', () => {
            // Ignore if popup open
            if (this.isPopupOpen()) {
                return true;
            }

            this.updateRegionHighlight(feature.properties, []);
        });

        // Add the marker to the map
        const marker = new mapboxgl.Marker(html.get(0))
            .setLngLat([coordLng, coordLat])
            .addTo(this.map);

        this.layers.markers.mapped.push(marker);
    }//addMarker

    /**
     * setRegionData
     * Set layer data to the map
     */
    setRegionData() {

        // Add data for 'internal' computed layers
        let layers = Object.values(this.config.layerCategories);
        Object.values(layers).forEach((layer) => {
            if (layer.compiler != 'internal') return;

            switch(layer.id) {
                case 'density':
                    let compiled = this.addDensityLayer();
                    if (! compiled) {
                        delete this.config.layerCategories[layer.id];
                    }
                    break;
            }
        });

        // Add regions data to map as a source to be used for layers
        this.map.addSource('regions', {
            type: 'geojson',
            data: this.layers.regions.geojson
        });

        /**
         * Region Highlighting
         */

        // Add region layers to the map
        try {

            // Map Layer: For marker-region engagement
            this.map.addLayer({
                id: 'regions-fill',
                type: 'fill',
                source: 'regions',
                paint: {
                    'fill-color': '#b3d8f6', // Default: light blue
                    'fill-opacity': 0.35
                },
                filter: ['in', this.config.data.regionNameProperty, '']
            });

            // Map Layer: For menu-region engagement
            this.map.addLayer({
                id: 'regions-overlay',
                type: 'fill',
                source: 'regions',
                paint: {
                    'fill-color': this.system.layerFill.defaultColorNoLayer,
                    'fill-opacity': this.system.layerFill.defaultFillOpacity
                },
                layout: {
                    'visibility': 'none'
                }
            });

            // Map Layer: Border for regions
            this.map.addLayer({
                id: 'regions-border',
                type: 'line',
                source: 'regions',
                paint: {
                    'line-color': '#333',
                    'line-width': 2,
                    'line-opacity': 0.4
                }
            });

            // Map Layer: Border for highlighted regions
            this.map.addLayer({
                id: 'regions-border-highlight',
                type: 'line',
                source: 'regions',
                paint: {
                    'line-color': '#333',
                    'line-width': 2,
                    'line-opacity': 0.8
                },
                filter: ['in', this.config.data.regionNameProperty, ''] // No regions highlighted initially
            });

            // Map Layer: Region labels
            this.map.addLayer({
                id: 'regions-labels',
                type: 'symbol',
                source: 'regions',
                layout: {
                    'text-field': ['get', this.config.data.regionNameProperty],
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
                console.error('Error adding region layers to map:', error);
            }
        }
    }// setRegionData

    /**
     * addDensityLayer
     * Generate and set a layer to measure marker density
     */
    addDensityLayer() {

        // Ignore if no marker data available
        if (! this.layers.markers.geojson) {
            return false;
        }

        // Initialize
        let regionsDensity = [];

        this.layers.markers.geojson.features.forEach((item) => {
            // Get regions the item is based
            let regionBased = item.properties[this.config.schema.region_based.column];

            // Initialize region tally
            if (! regionsDensity[regionBased]) {
                regionsDensity[regionBased] = 0;
            }

            // Tally region
            regionsDensity[regionBased]++;
        });

        this.layers.regions.geojson.features.forEach((region, i) =>  {
            let index = region.properties[this.config.data.regionNameProperty];
            region.properties[this.config.layerCategories.density.property] = 0;

            if (regionsDensity[index]) {
                this.layers.regions.geojson.features[i].properties[this.config.layerCategories.density.property] = regionsDensity[index];
            }
        });

        return true;
    }// addDensityLayer

    /**
     * buildMarkerMenuOptions
     * Gather categories for filtering
     */
    buildMarkerMenuOptions() {

        // Ignore if no data available
        if (! this.layers.markers.geojson) {
            return false;
        }

        // Initialize with no filter option
        let categories = [
            {
                id: 'none',
                title: 'No Filters',
                active: true,
            }
        ];

        // Populate categories with unique values from each data record
        this.layers.markers.geojson.features.forEach((record) => {

            // Validate GeoJSON-format for Feature
            if (record.type != 'Feature' || record.properties.length === 0) {
                return false;
            }

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
                    });
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
                    return (a.value > b.value) ? 1 : ((b.value > a.value) ? -1 : 0);
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

        //Display menu
        $('#menu .menu-container[data-container="filters"]').show();

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
            this.layers.markers.status.filter = parent.attr('data-id');

            // Update markers
            this.setMarkerData();
        });

        // Filter category option listener
        $('#menu').on('click', '.menu-container[data-container="filters"] .mc-category-option', (e) => {
            // Activate or deactivate requested category
            $(e.currentTarget).toggleClass('active');

            // Update markers
            this.setMarkerData();
        });
    }// buildMarkerMenuOptions

    /**
     * buildRegionMenuOptions
     * Gather categories for layering
     */
    buildRegionMenuOptions() {

        // Get layers
        let layers = Object.values(this.config.layerCategories);

        // Ignore if no data available
        if (layers.length === 0) {
            return false;
        }

        // Add "No Layer" option first
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
                    const minVal = i === 0 ? 0 : layer.breaks[i - 1] + 1;
                    const maxVal = i < layer.breaks.length ? layer.breaks[i] : '∞';

                    // Populate option HTML
                    let optionHtml = $('.menu-container[data-container="layers"] .mc-category-option-wrapper[data-type="template"]').clone();
                    optionHtml.removeAttr('data-type');
                    optionHtml.find('.mc-category-option').attr('data-id', i);

                    let breaksLabel = null;
                    if (minVal == maxVal) {
                        breaksLabel = minVal;
                    } else if (maxVal === '∞') {
                        breaksLabel = this.formatRangeValue(this.config.layerCategories[layer.id], minVal, true) + '+' + (layer.hasOwnProperty('suffix') ? layer.suffix : '');
                    } else {
                        breaksLabel = this.formatRangeValue(this.config.layerCategories[layer.id], minVal, true) + ' - ' + this.formatRangeValue(this.config.layerCategories[layer.id], maxVal);
                    }

                    optionHtml.find('.mc-item-label').text(breaksLabel);
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

        //Display menu
        $('#menu .menu-container[data-container="layers"]').show();

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
            const layer = this.config.layerCategories[parent.attr('data-id')];

            if (layer) {
                // Collect layer colors
                let expression = ['case'];
                for (let i = 0; i < layer.breaks.length; i++) {
                    let condition = '';

                    switch(layer.breaks[i]) {
                        case 0:
                            condition = ['==', ['get', layer.property], layer.breaks[i]];
                            break;

                        case '∞':
                            condition = ['>', ['get', layer.property], layer.breaks[i-1]]
                            break;

                        default:
                            condition = ['<=', ['get', layer.property], layer.breaks[i]];
                    }

                    expression.push(condition, layer.colors[i]);
                }

                // Default color for highest values
                expression.push(layer.colors[layer.colors.length - 1]);

                // Paint and display layer
                this.map.setPaintProperty('regions-overlay', 'fill-color', expression);
                this.map.setLayoutProperty('regions-overlay', 'visibility', 'visible');
            } else {
                // Hide layer
                this.map.setLayoutProperty('regions-overlay', 'visibility', 'none');
            }
        });
    }// buildRegionMenuOptions

    /**
     * formatRangeValue
     * Format the given value for a range/break
     */
    formatRangeValue(layer, value, simple) {
        // Format numeric string
        var value = value.toLocaleString();

        // Return number only, except for currency
        if (simple && (! layer.hasOwnProperty('prefix') || layer.prefix != '$')) {
            return value;
        }

        // Apply prefix if requested
        if (layer.hasOwnProperty('prefix')) {
            return layer.prefix + value;
        }

        // Apply suffix if requested
        if (layer.hasOwnProperty('suffix')) {
            return value + layer.suffix;
        }

        return value;
    }// formatRangeValue

    /**
     * updateRegionHighlight
     * Update the colored highlight for regions on the map
     */
    updateRegionHighlight(properties, regions) {
        // Get list of regions served, get marker regions if not provided
        let regionsServed = regions;
        if (typeof regions == 'undefined') {
            regionsServed = properties[this.config.schema.regions_served.column];
        }

        // Apply region highlighting
        const type = properties[this.config.schema[this.config.mapOperations.regions_color_column].column];
        this.map.setPaintProperty('regions-fill', 'fill-color', this.config.schema[this.config.mapOperations.regions_color_column].options[type].color ?? this.config.mapOperations.regions_color_default);
        this.map.setFilter('regions-fill', ['in', this.config.data.regionNameProperty, ...regionsServed]);
        this.map.setFilter('regions-border-highlight', ['in', this.config.data.regionNameProperty, ...regionsServed]);
    }// updateRegionHighlight

    /**
     * resetRegionFilters
     * Clear all active region highlighting on the map
     */
    resetRegionFilters() {
        // Remove region filter styles
        this.map.setFilter('regions-fill', ['in', this.config.data.regionNameProperty, '']);
        this.map.setFilter('regions-border-highlight', ['in', this.config.data.regionNameProperty, '']);
    }// resetRegionFilters

    /**
     * openPopup
    * Highlight regions and show popup
    */
    openPopup(action, properties, coordLng, coordLat, cluster) {
        // Close all other popups
        this.closeAllPopups();

        // Determine if current zoom level is too large to view regions
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
        let popup = new mapboxgl.Popup({ 
            offset: 18,
            closeButton: true,
            closeOnClick: false,
            closeOnMove: false
        }).setHTML(
            this.createPopup(action, properties, cluster)
        );

        // Add popup to map
        popup.setLngLat([coordLng, coordLat]).addTo(this.map);

        // Paint map regions, not for cluster markers
        if (! cluster || ! cluster.is) {
            this.updateRegionHighlight(properties);
        } else {
            this.updateRegionHighlight(properties, []);
        }
    }// openPopup

    /**
     * createPopup
     * Create a popup with the given data
     */
    createPopup(action, data, cluster) {
        // Get HTML template for popup
        let template = cluster && cluster.is ? 'popup-cluster' : 'popup';
        let html = $('#map-templates div[data-template="' + template + '"]').clone();

        // Populate popup HTML with data
        html.find('.map-popup-wrapper')
            .attr('data-template', template)
            .attr('data-index', data.index)
            .attr('data-action', action);
        html = this.populatePopupData(html, data);

        // Handle cluster-specific components
        if (cluster && cluster.is) {
            // Sort list in cluster popup
            cluster.markers.sort((a,b) => {
                let a_name = a.properties[this.config.schema[this.config.mapOperations.sort_column].column];
                let b_name = b.properties[this.config.schema[this.config.mapOperations.sort_column].column];
                return (a_name > b_name) ? 1 : ((b_name > a_name) ? -1 : 0);
            });

            // Generate and append list HTML
            cluster.markers.forEach((item) => {
                // Get cluster list item
                let list_item = html.find('.mp-body-row[data-type="template"]').clone();
                list_item.removeAttr('data-type');

                // Populate HTML with data
                list_item = this.populatePopupData(list_item, item.properties);

                // Append to HTML template
                html.find('.mp-body').append(list_item);
            });
        }

        // Remove templates
        html.find('[data-type="template"]').remove();

        return html.html();
    }// createPopup

    /**
     * populatePopupData
     * Fill the given data into the popup template
     */
    populatePopupData(html, data) {
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
    }// populatePopupData

    /**
     * closeAllPopups
     * Close all active popups on the map
     */
    closeAllPopups(manual) {
        // Reset region filters
        this.resetRegionFilters();

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

    /**
     * isPopupOpen
     * Check whether any popup is active on the map
     */
    isPopupOpen() {
        return ($('.mapboxgl-popup').length > 0);
    }// isPopupOpen

    /**
     * getIcon
     * Get the icon HTML for the give type
     */
    getIcon (type) {
        // Initialize
        let icon = '';

        if (this.system.icons[type]) {
            icon = this.system.icons[type];

            // Format HTML to Font Awesome standards
            icon.html = `<i class="fa-${icon.group} fa-${icon.id}"></i>`;
        } else {
            icon = this.system.icons.default;
            icon.html = `<span>${type.charAt(0)}</span>`;
        }

        return icon;
    }// getIcon
}// Map