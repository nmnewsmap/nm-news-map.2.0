import { Map_ECO } from './map.js';

export class App_ECO {

    constructor(config, config_system) {
        this.config = config;
        this.config_system = config_system;
    }// constructor

    /**
     * init
     * Initialize application
     */
    init() {
        // Initialize the map
        let map = new Map_ECO(this.config, this.config_system);
        map.init();
    }// init

}// App_ECO