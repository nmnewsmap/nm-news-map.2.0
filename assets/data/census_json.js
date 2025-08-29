// Census layer configurations with color schemes
const censusLayers = {
    'population': {
        id: 'population',
        property: 'Population Size',
        title: 'Population Size',
        colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
        breaks: [1000, 5000, 15000, 30000, 60000, 100000, 200000, 700000],
        format: (val) => val ? val.toLocaleString() : 'No data'
    },
    'income': {
        id: 'income',
        property: 'Median Household Income',
        title: 'Median Household Income',
        colors: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e'],
        breaks: [30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000],
        format: (val) => val ? `$${val.toLocaleString()}` : 'No data'
    },
    'business': {
        id: 'business',
        property: 'Private Business',
        title: 'Private Business (Workers)',
        colors: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#8c2d04'],
        breaks: [500, 2000, 5000, 10000, 20000, 50000, 100000, 350000],
        format: (val) => val ? val.toLocaleString() : 'No data'
    },
    'education': {
        id: 'education',
        property: 'College Education',
        title: 'College Education (%)',
        colors: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'],
        breaks: [5, 10, 15, 20, 25, 30, 35, 40],
        format: (val) => val ? `${val}%` : 'No data'
    },
    'age': {
        id: 'age',
        property: 'Median Age',
        title: 'Median Age',
        colors: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#99000d'],
        breaks: [25, 30, 35, 40, 45, 50, 55, 60],
        format: (val) => val ? `${val} years` : 'No data'
    },
    'nonwhite': {
        id: 'nonwhite',
        property: 'Nonwhite Population',
        title: 'Nonwhite Population (%)',
        colors: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'],
        breaks: [10, 20, 30, 40, 50, 60, 70, 80],
        format: (val) => val ? `${val}%` : 'No data'
    },
    'broadband': {
        id: 'broadband',
        property: 'Homes with Broadband',
        title: 'Homes with Broadband (%)',
        colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'],
        breaks: [50, 60, 70, 75, 80, 85, 90, 95],
        format: (val) => val ? `${val}%` : 'No data'
    }
};