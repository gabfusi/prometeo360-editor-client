"use strict";

// express
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const hbs = require('hbs'); // https://github.com/donpark/hbs
const debug = require('debug')('prometeo:server');
const http = require('http');
const cors = require('cors');

let shuttingDown = false;

// init express
const app = express();
let server = null;

/**
 * Starts server
 * @param additionalConfig
 */
function startServer(additionalConfig) {

    const videosPath = additionalConfig.videosPath;

    // checks if everything is ok
    const setup = require('./setup');
    setup.check(videosPath);

    // set server port
    const port = normalizePort(process.env.PORT || '3030');
    app.set('port', port);
    app.use(cors());

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hbs');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    // expose process-client as root
    app.use(express.static(path.join(__dirname, '..', 'process-client')));

    // vrview rewrite
    console.log(path.join(__dirname, 'node_modules', 'vrview'));
    app.use('/vrview', express.static(path.join(__dirname, 'node_modules', 'vrview')));
    // local video path
    app.use('/assets', express.static(path.join(videosPath, "Prometeo360")));

    // routes
    const admin = require('./routes/admin');
    const viewer = require('./routes/viewer');
    app.use('/', viewer);
    app.use('/admin', admin);

    // api
    const api_lessons = require('./routes/api/lessons');
    const api_videos = require('./routes/api/videos')(videosPath);
    app.use('/api/lesson', api_lessons);
    app.use('/api/video', api_videos);


    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    // shutdown handler
    app.use(function (req, res, next) {
        if (shuttingDown) {
            return;
        }
        next();
    });

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
        const port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }

    // create the server
    server = http.createServer(app);
    server.on('error', onError);
    server.on('listening', onListening);
    server.timeout = 1200000; // 20min

    // start the server
    server.listen(port, function () {

        // notify parent
        process.send({
            "type": "started"
        });

    });
}

// on app exit
process.on('SIGINT', function () {
    shuttingDown = true;
    server.close(function () {
        process.exit();
    });
});

// messages from parent process
process.on('message', (message) => {

    switch (message.type) {
        case "start":
            startServer(message.payload);
            break;
    }

});

process.on('error', function (err) {
    console.error('error' + err)
});

process.on('uncaughtException: ', function (err) {
    console.error('uncaughtException: ' + err)
});

module.exports = null;
