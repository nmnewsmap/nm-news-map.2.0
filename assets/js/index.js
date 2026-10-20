import { eco_config_instance } from '/config/instance.js';
import { eco_config_system } from '/config/system.js';
import { App_ECO } from './App.js';

document.addEventListener( 'DOMContentLoaded', () => {
    // Enable jQuery $ assignment
    try {
        $ = jQuery.noConflict();
    } catch (e) {}

    // Initialize application
    let app = new App_ECO(
        eco_config_instance,
        eco_config_system
    );

    app.init();
});