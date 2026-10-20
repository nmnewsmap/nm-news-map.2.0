const base_dir = 'assets/data';

export const eco_config_instance = {
    debug: false,
    domain: 'nmnewsmap.org',
    map: {
        source: 'mapbox',
        access_token: 'pk.eyJ1Ijoibm1uZXdzbWFwIiwiYSI6ImNtYjVkbmEwZDFlOXIyam9sM21mcDZsbDgifQ.LDcxjUWCHp-XRBbD5IbL3A',
        style: 'mapbox://styles/mapbox/light-v11',
        canvas_id: 'map-canvas',
        zoom: {
            min: 5,
            max: 9,
            default: 5, // State level
        },
        center: [-106.2485, 34.5199],  // New Mexico
        bounds: {
            max: [ // maxBounds (https://docs.mapbox.com/mapbox-gl-js/api/map/#map-class-parameters-options-maxbounds)
                [-110.301, 29.741], // [south, west]
                [-101.205, 37.828] // [north, east]
            ],
            fit: { // fitBounds (https://docs.mapbox.com/mapbox-gl-js/api/map/#map#fitbounds)
                bbox: [
                    [-102.999, 31.415], // [south, west]
                    [-108.601, 36.902] // [north, east]
                ],
                padding: 50,
                duration: 500 
            },
        },
    },
    mapOperations: {
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
 * -- filter: ...
 */

    schema: {
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
    'county_based': {
        id: 'county_based',
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
    'counties_served': {
        id: 'counties_served',
        column: 'COUNTIES_SERVED',
        label: 'Counties Served',
        description: "Approximate geographic reach. Some outlets are more localized",
        format: 'csv',
    },
    'counties_served_label': {
        id: 'counties_served_label',
        column: 'COUNTIES_SERVED_label', //Dynamic column, populated in cleanData()
        label: 'Counties Served',
        description: "Approximate geographic reach. Some outlets are more localized",
    },
    'updated_at': {
        id: 'updated_at',
        column: 'LAST_UPDATE',
        label: 'Updated:',
    },
    }
};