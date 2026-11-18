import { CONFIG_INSTANCE } from '/config/instance.js';
import { CONFIG_SYSTEM } from '/config/system.js';
import { App } from './App.js';

document.addEventListener( 'DOMContentLoaded', () => {
    // Enable jQuery $ assignment
    try {
        $ = jQuery.noConflict();
    } catch (e) {}

    // Initialize application
    let app = new App(CONFIG_INSTANCE, CONFIG_SYSTEM
    );

    app.init();
});