/**
 * isMobile
 * Determine if user's browser or device is on mobile-screen size
 */
export const isMobile = () => {
    // Check sensor
    return ($('#sensor-mobile').css('display') == 'none');
}; // isMobile