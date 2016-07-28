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

    /*
    LessonsService.getLessons(function(err, data) {

        console.dir(data);

        if(err) {
            data = false;
        }

        res.render('editor-list', {
            lessons: data
        });

    });*/

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
