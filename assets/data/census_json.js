// Census layer configurations with color schemes
// Data Source: U.S. Census Bureau, 2023 ACS (5-Year Estimates)
const censusLayers = {
    'density': {
        id: 'density',
        property: 'Outlet Density',
        title: 'News Outlet Density',
        source: 'NM News Map Research Team; Total Residing Outlets',
        colors: ['#ffffff', '#cadff0', '#a6cde4', '#75b4d8', '#4b98c9', '#2877b8', '#0f569d'],
        breaks: [1, 4, 9, 15, '∞'],
    },
    'population': {
        id: 'population',
        property: 'Population Size',
        title: 'Population Size',
        source: 'DP05: ACS Demographic and Housing Estimates; Total Population Estimate',
        colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
        breaks: [999, 4999, 14999, 29999, 59999, 99999, 199999, 700000],
    },
    'income': {
        id: 'income',
        property: 'Median Household Income',
        title: 'Median Household Income',
        source: 'S1901: Income in the Past 12 Months; Median Income',
        colors: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'],
        breaks: [29999, 39999, 49999, 59999, 69999, 79999, 89999, 150000],
        prefix: '$',
    },
    'business': {
        id: 'business',
        property: 'Private Business',
        title: 'Private Business (Workers)',
        source: 'CB2300CBP: 2023: ECNSVY Business Patterns County Business Patterns; Number of Employees',
        colors: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
        breaks: [499, 1999, 4999, 9999, 19999, 49999, 99999, 300000],
    },
    'education': {
        id: 'education',
        property: 'College Education',
        title: 'College Education (%)',
        source: 'S1501: Education Attainment; Population 25 Years and over; Bachelor\'s Degree or Higher',
        colors: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
        breaks: [9, 19, 29, 39, 49, 59, 69, 79],
        suffix: '%',
    },
    'age': {
        id: 'age',
        property: 'Median Age',
        title: 'Median Age',
        source: 'S0101: Age and Sex; Median Age',
        colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
        breaks: [24, 29, 34, 39, 44, 49, 54, '∞'],
        suffix: ' years',
    },
    'nonwhite': {
        id: 'nonwhite',
        property: 'Nonwhite Population',
        title: 'Nonwhite Population (%)',
        source: 'B02001: Race; Percentage calculated from "White alone" quantity divided by Total population',
        colors: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'],
        breaks: [9, 19, 29, 39, 49, 59, 69, 100],
        suffix: '%',
    },
    'broadband': {
        id: 'broadband',
        property: 'Homes with Broadband',
        title: 'Homes with Broadband (%)',
        source: 'S2801: Types of Computers and Internet Subscriptions; Broadband of any type',
        colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
        breaks: [49, 59, 69, 74, 79, 84, 89, 100],
        suffix: '%',
    }
};

function layerFormat(layer, value, simple) {
    // Format numeric string
    var value = value.toLocaleString();

    // Return number only
    if (simple) {
        return value;
    }

    // Apply prefix if requested
    if (censusLayers[layer].hasOwnProperty('prefix')) {
        return censusLayers[layer].prefix + value;
    }

    // Apply suffix if requested
    if (censusLayers[layer].hasOwnProperty('suffix')) {
        return value + censusLayers[layer].suffix;
    }

    return value;
}//layerFormat