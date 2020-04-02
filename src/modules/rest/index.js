import express from 'express';
import {Paper} from 'paper-wrapper';
import CilaLogger from '../logger/cilaLogger';
import UserModule from './modules/UserModule';

export default class RestAPI {
    constructor(environment) {
        this.app = express();

        this._initializePaper(environment);
    }

    /**
     * Starts the rest api server on the given port
     * @param port The port to listen on
     */
    listen(port) {
        this.port = port;

        this.app.listen(this.port, () => {
            CilaLogger.log('Started REST API on port ' + this.port);
        });
    }

    _initializePaper(environment) {
        // Create a new paper wrapper instance with the given config
        const paper = new Paper({
            environment: environment,
            suppressMessages: true,
            suppressWarnings: false
        });

        // Register the paper modules
        paper.registerModules([
            new UserModule()
        ]);

        const paperRouter = paper.getRoutes();
        this.app.use(paperRouter);
    }
}