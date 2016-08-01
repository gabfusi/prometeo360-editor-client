"use strict";

var express = require('express');
var router = express.Router();
var LessonsService = require('../services/LessonsService.js');

/**
 *  GET lessons list.
 *  /admin//list
 *
 **/
router.get('/list', function(req, res, next) {
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

/**
 *  GET lesson player.
 *  /admin/player/:lesson_id
 *
 **/
router.get('/player/:lesson_id', function(req, res, next) {
    res.render('player', {
        movie_id: req.params.lesson_id
    });
});

module.exports = router;
