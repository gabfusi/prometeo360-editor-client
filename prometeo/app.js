// express
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs'); // https://github.com/donpark/hbs
// var socket_io = require("socket.io");
var debug = require('debug')('prometeo:server');
var http = require('http');
var cors = require('cors');
const electron = require('electron');
const electronApp = electron.app;

// init express
var shuttingDown = false;
var app = express();
var port = normalizePort(process.env.PORT || '3030');
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
server.timeout = 1200000; // 20min

app.use(cors())

// socket io
// app.io = socket_io();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// vrview rewrite
console.log(path.join(__dirname, 'node_modules', 'vrview'));
app.use('/vrview', express.static(path.join(__dirname, 'node_modules', 'vrview')));
app.use('/assets', express.static(path.join(electronApp.getPath('videos'), "Prometeo360")));

// routes
var admin = require('./routes/admin');
var viewer = require('./routes/viewer');

// api
var api_lessons = require('./routes/api/lessons');
var api_videos = require('./routes/api/videos');
// var api_videos = require('./routes/api/videos')(app.io);


app.use('/', viewer);
app.use('/admin', admin);
app.use('/api/lesson', api_lessons);
app.use('/api/video', api_videos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// shutdown handler
app.use(function(req, res, next) {
    if(shuttingDown) {
        return;
    }
    next();
});


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

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

    var bind = typeof port === 'string'
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
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

process.on('SIGINT', function() {
    shuttingDown = true;
    server.close(function(){
        process.exit();
    });
});

module.exports = app;
