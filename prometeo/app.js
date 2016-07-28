// express
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs'); // https://github.com/donpark/hbs
// var socket_io = require("socket.io");

// init express
var app = express();

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


module.exports = app;
