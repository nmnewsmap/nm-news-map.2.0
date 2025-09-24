// Census layer configurations with color schemes
// Data Source: U.S. Census Bureau, 2023 ACS (5-Year Estimates)
const censusLayers = {
    'population': {
        id: 'population',
        property: 'Population Size',
        title: 'Population Size',
        source: 'DP05: ACS Demographic and Housing Estimates; Total Population Estimate',
        colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
        breaks: [1000, 5000, 15000, 30000, 60000, 100000, 200000, 700000],
        format: (val) => val ? val.toLocaleString() : '0'
    },
    'income': {
        id: 'income',
        property: 'Median Household Income',
        title: 'Median Household Income',
        source: 'S1901: Income in the Past 12 Months; Median Income',
        colors: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'],
        breaks: [30000, 40000, 50000, 60000, 70000, 80000, 90000, 150000],
        format: (val) => val ? `$${val.toLocaleString()}` : '$0'
    },
    'business': {
        id: 'business',
        property: 'Private Business',
        title: 'Private Business (Workers)',
        source: 'CB2300CBP: 2023: ECNSVY Business Patterns County Business Patterns; Number of Employees',
        colors: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
        breaks: [500, 2000, 5000, 10000, 20000, 50000, 100000, 300000],
        format: (val) => val ? val.toLocaleString() : '0'
    },
    'education': {
        id: 'education',
        property: 'College Education',
        title: 'College Education (%)',
        source: 'S1501: Education Attainment; Population 25 Years and over; Bachelor\'s Degree or Higher',
        colors: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
        breaks: [10, 20, 30, 40, 50, 60, 70, 80],
        format: (val) => val ? `${val}%` : '0%'
    },
    'age': {
        id: 'age',
        property: 'Median Age',
        title: 'Median Age',
        source: 'S0101: Age and Sex; Median Age',
        colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
        breaks: [25, 30, 35, 40, 45, 50, 55, 70],
        format: (val) => val ? `${val} years` : '0'
    },
    'nonwhite': {
        id: 'nonwhite',
        property: 'Nonwhite Population',
        title: 'Nonwhite Population (%)',
        source: 'B02001: Race; Percentage calculated from "White alone" quantity divided by Total population',
        colors: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'],
        breaks: [10, 20, 30, 40, 50, 60, 70, 100],
        format: (val) => val ? `${val}%` : '0%'
    },
    'broadband': {
        id: 'broadband',
        property: 'Homes with Broadband',
        title: 'Homes with Broadband (%)',
        source: 'S2801: Types of Computers and Internet Subscriptions; Broadband of any type',
        colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
        breaks: [50, 60, 70, 75, 80, 85, 90, 100],
        format: (val) => val ? `${val}%` : '0%'
    }
};