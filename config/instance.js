export const CONFIG_INSTANCE = {
    debug: true,

    // General information about the map application
    title: 'New Mexico News Ecosystem Map',
    webpage: 'https://www.nmnewsmap.org', // Used to create links on the map

    // Define the map settings
    map: {
        source: 'mapbox',
        accessToken: 'pk.eyJ1Ijoibm1uZXdzbWFwIiwiYSI6ImNtYjVkbmEwZDFlOXIyam9sM21mcDZsbDgifQ.LDcxjUWCHp-XRBbD5IbL3A',
        style: 'mapbox://styles/mapbox/light-v11',
        canvasId: 'map-canvas',
        zoom: {
            min: 5,
            max: 9,
            default: 5, // State level
        },
        center: [-106.2485, 34.5199], // New Mexico
        bounds: {
            max: [ // Used for maxBounds (Reference: https://docs.mapbox.com/mapbox-gl-js/api/map/#map-class-parameters-options-maxbounds)
                [-110.301, 29.741], // [south, west]
                [-101.205, 37.828] // [north, east]
            ],
            fit: { // Used for fitBounds (Reference: https://docs.mapbox.com/mapbox-gl-js/api/map/#map#fitbounds)
                bbox: [
                    [-102.999, 31.415], // [south, west]
                    [-108.601, 36.902] // [north, east]
                ],
                padding: 50,
                duration: 500 
            },
        },
    },

    // Properties to assist the map functionality with given data 
    mapOperations: {
        sortColumn: 'outlet_name', // The column for sorting markers
        nullValue: '*', // Alternative value in data that means "None" or null.
        cilMax: 3.00, // The maximum Community Impact Level number
        cilLabelDelimiter: '-', // The delimiter for the CIL label in the CIL description
        regionDelimiter: ',', // The delimiter for multiple regions in the region column
        regionAllTerm: 'all', // The term used in marker region data for all-encompassing region coverage
        regionsColumn: 'regions_served', // The column that includes the marker's region data
        regionsColorColumn: 'medium_primary', // The column that controls the marker colors
        regionsColorDefault: '#e0e0e0', // The default color for highlighting regions 
    },

    // The data that defines the markers and regions
    data: {
        markerDataFile: 'outlets.js', // GeoJSON format required
        regionDataFile: 'censusCounties.js', // GeoJSON format required
        regionNameProperty: 'NAME', // The column in region data file 'properties' that will define the region labels on the map
        regionNameExceptions: { // Region name normalization mapping
            "dona ana": "Doña Ana",
            "doña ana": "Doña Ana",
            "dona ana ": "Doña Ana",
            "do\u00f1a ana": "Doña Ana",
            "de baca": "De Baca",
            "guadelupe": "Guadalupe", // Common misspelling
            "mckinley": "McKinley", // Handle lowercase variations
        }
    },

    /**
     * Data Property Definitions
     * 
     * Each property may include: (* is required)
     * -- id*: The unique ID or slug for the property.
     * -- column*: The column name of the property in the data file.
     * -- type: Optional; The formatting type to apply to the property value; Options: "text" (default), "int", "url", "index"
     * -- description: Optional; The explainer for the property; Displays as a tooltip.
     * -- format: Optional; 
     * -- filter: Optional; Whether the data category should be added to the map's filter menu.
     * -- options: Optional; Predefined options for the map's filter menu.
     */

    schemaMarker: {
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
            description: "Platform that delivers 50% or more of the outlet's audience",
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
            description: "City where outlet is located",
        },
        'region_based': {
            id: 'region_based',
            column: 'Address_County',
            label: 'County Based',
        },
        'frequency': {
            id: 'frequency',
            column: 'FREQ',
            label: 'Frequency',
            description: "Rate that coverage is typically published",
        },
        'language': {
            id: 'language',
            column: 'LANGUAGE',
            label: 'Language',
            description: "Primary language in which coverage is presented or translated",
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
            label: 'Business Model',
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
            column: 'IMPACT_LVL_LABEL', //Dynamic column, populated in cleanData()
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
        'regions_served': {
            id: 'regions_served',
            column: 'COUNTIES_SERVED',
            label: 'Counties Served',
            description: "Approximate geographic reach. Some outlets are more localized",
            format: 'csv',
        },
        'regions_served_label': {
            id: 'regions_served_label',
            column: 'COUNTIES_SERVED_label', //Dynamic column, populated in cleanData()
            label: 'Counties Served',
            description: "Approximate geographic reach. Some outlets are more localized",
        },
        'updated_at': {
            id: 'updated_at',
            column: 'LAST_UPDATE',
            label: 'Updated:',
        },
    },

    /**
     * Map Layer Overlay Definitions
     *
     * A list of layer categories that will produce highlighted overlays on regions on the map.
     * The list will be displayed in the map menu and can be selected to activate the overlay.
     * Example: Census data that highlights regions based on their population level or education level
     * 
     * Category Schema:    
     * -- index: Unique slug representing the category.
     * -- id: Same as index.
     * -- property: The key in the regions GeoJSON 'properties' array that has the data value.
     * -- title: The title for this category to be shown on the map interface.
     * -- source: The source for this category to be shown on the map interface.
     * -- compiler: The data compiling mechanism to generate the data, options include:
     * ---- "external": Data is provided directly by an external data file
     * ---- "internal": Data should be generated by the application; See options below.
     * -- colors: An array of hexidecimal color codes (e.g., #cadff0) for each data range 'break' to be used for painting the region on the map.
     * -- breaks: An array of data thresholds (i.e., plain number with no formatting) that split the data into chunks.
     * -- suffix: Optional; The suffix to be applied to the value.
     * -- prefix: Optional; The prefix to be applied to the value.
     * 
     * Options for "internal" compilers:
     * -- Marker Density (id/index = "density"): Dynamically calculate the density of markers across each region.
     */

    layerOverlays: {
        'density': {
            id: 'density',
            property: 'Outlet Density',
            title: 'News Outlet Density',
            source: 'NM News Map Research Team; Total Residing Outlets',
            compiler: 'internal',
            colors: ['#ffffff', '#cadff0', '#a6cde4', '#75b4d8', '#4b98c9', '#2877b8', '#0f569d'],
            breaks: [1, 4, 9, 15, '∞'],
        },
        'population': {
            id: 'population',
            property: 'Population Size',
            title: 'Population Size',
            source: 'DP05: ACS Demographic and Housing Estimates; Total Population Estimate',
            compiler: 'external',
            colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
            breaks: [999, 4999, 14999, 29999, 59999, 99999, 199999, 700000],
        },
        'income': {
            id: 'income',
            property: 'Median Household Income',
            title: 'Median Household Income',
            source: 'S1901: Income in the Past 12 Months; Median Income',
            compiler: 'external',
            colors: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'],
            breaks: [29999, 39999, 49999, 59999, 69999, 79999, 89999, 150000],
            prefix: '$',
        },
        'business': {
            id: 'business',
            property: 'Private Business',
            title: 'Private Business (Workers)',
            source: 'CB2300CBP: 2023: ECNSVY Business Patterns County Business Patterns; Number of Employees',
            compiler: 'external',
            colors: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
            breaks: [499, 1999, 4999, 9999, 19999, 49999, 99999, 300000],
        },
        'education': {
            id: 'education',
            property: 'College Education',
            title: 'College Education (%)',
            source: 'S1501: Education Attainment; Population 25 Years and over; Bachelor\'s Degree or Higher',
            compiler: 'external',
            colors: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
            breaks: [9, 19, 29, 39, 49, 59, 69, 79],
            suffix: '%',
        },
        'age': {
            id: 'age',
            property: 'Median Age',
            title: 'Median Age',
            source: 'S0101: Age and Sex; Median Age',
            compiler: 'external',
            colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
            breaks: [24, 29, 34, 39, 44, 49, 54, '∞'],
            suffix: ' years',
        },
        'nonwhite': {
            id: 'nonwhite',
            property: 'Nonwhite Population',
            title: 'Nonwhite Population (%)',
            source: 'B02001: Race; Percentage calculated from "White alone" quantity divided by Total population',
            compiler: 'external',
            colors: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'],
            breaks: [9, 19, 29, 39, 49, 59, 69, 100],
            suffix: '%',
        },
        'broadband': {
            id: 'broadband',
            property: 'Homes with Broadband',
            title: 'Homes with Broadband (%)',
            source: 'S2801: Types of Computers and Internet Subscriptions; Broadband of any type',
            compiler: 'external',
            colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
            breaks: [49, 59, 69, 74, 79, 84, 89, 100],
            suffix: '%',
        }
    }
};