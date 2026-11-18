import { Map } from './Map.js';

export class App {

    constructor(configInstance, configSystem) {
        this.configInstance = configInstance;
        this.configSystem = configSystem;
    }// constructor

    /**
     * init
     * Initialize an application
     */
    init() {

        // Initialize a new Map
        new Map(this.configInstance, this.configSystem).init();

    }// init

}// App