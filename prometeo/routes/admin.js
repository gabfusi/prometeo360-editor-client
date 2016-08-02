"use strict";

var express = require('express');
var router = express.Router();
var LessonsService = require('../services/LessonsService.js');

/**
 *  GET lessons list.
 *  /admin/
 *
 **/
router.get('/', function(req, res, next) {
    res.render('admin');
});

/**
 *  GET lessons editor.
 *  /admin/editor/:lesson_id
 *
 **/
router.get('/editor/:lesson_id', function(req, res, next) {
    res.render('admin');
});

module.exports = router;
