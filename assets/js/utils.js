/**
 * isMobile
 * Determine if user's browser or device is on mobile-screen size
 */
export const isMobile = () => {
    // Check mobile device sensor visibility
    return ($('#sensor-mobile').css('display') == 'none');
};// isMobile

/**
 * isValidGeoJSON
 * Determine if the given JSON is valid and populated GeoJSON
 */
export const isValidGeoJSON = (json) => {
    try {
        // Check for expected GeoJSON properties
        return (json && json.type == 'FeatureCollection' && json.features.length > 0);
    } catch (error) {
        return false;
    }
};// isValidGeoJSON