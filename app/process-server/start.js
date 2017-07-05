"use strict";

const ipc = require("node-ipc");
const path = require('path');
const debug = require('debug')('prometeo:server');
const DatabaseService = require('./services/DatabaseService.js');
let shuttingDown = false;

// setup ipc 'server'
ipc.config.id = 'server';
ipc.config.retry = 1500;
ipc.config.silent = true;

/**
 * Starts server
 * @param additionalConfig
 */
function startServer(additionalConfig) {

    const dbPath = additionalConfig.dbPath;
    DatabaseService.setGlobalFolder(dbPath);

    // checks if everything is ok
    if(!additionalConfig.vrdebug) {
        const setup = require('./setup');
        setup.check(additionalConfig);
    }

    // setup ipc server 'routes'
    ipc.serve(
        function () {

            require("./handlers/movies")(additionalConfig);

            require("./handlers/videos")(additionalConfig);

            // notify parent
            process.send({
                "type": "started"
            });
        }
    );

    ipc.server.start();

}

// on app exit
process.on('SIGINT', function () {
    shuttingDown = true;
    process.exit();
});

// messages from parent process
process.on('message', (message) => {

    switch (message.type) {
        case "start":
            startServer(message.payload);
            break;
    }

});

// on process error
process.on('error', function (err) {
    console.error('error' + err)
});

// on process exception
process.on('uncaughtException: ', function (err) {
    console.error('uncaughtException: ' + err)
});

module.exports = null;
