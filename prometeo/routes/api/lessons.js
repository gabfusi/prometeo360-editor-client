"use strict";

var express = require('express');
var router = express.Router();
var LessonsService = require('../../services/LessonsService.js');

/* GET lessons listing. */
router.get('/', function(req, res, next) {

    LessonsService.getLessons(function(err, data) {

        console.log(err, data);

        if(!err) {
            res.json(data);
        } else {
            res.status(500).json(err);
        }

    });

});

/* GET lesson. */
router.get('/:lesson_id', function(req, res, next) {

    var lesson_id = req.params.lesson_id;

    // enable cors for this resource (can be requested by player embed)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    LessonsService.getLesson(lesson_id, function(err, data) {

        if(!err) {
            res.json(data);
        } else {
            res.status(500).json(err);
        }

    });

});

/* PUT new lesson. */
router.put('/', function(req, res, next) {

    var movie = req.body;

    try {
        validateMovie(movie);
    } catch (e) {
        res.status(500).json(e.message);
        return;
    }

    // salvo il filmato

    LessonsService.addLesson(movie, function(err, movie_id) {

        if(!err) {
            res.json(movie_id);
        } else {
            res.status(500).json(err);
        }

    });

});


/* POST updates a lesson. */
router.post('/:lesson_id', function(req, res, next) {

    var movie_id = req.params.lesson_id,
        movie = req.body;

    try {
        validateMovie(movie);
    } catch (e) {
        res.status(500).json(e.message);
        return;
    }

    if(movie_id !== movie.id) {
        res.status(500).json("Impossibile salvare il filmato, possibile sovrascrittura di filmati.");
        return;
    }


    // salvo il filmato

    LessonsService.updateLesson(movie_id, movie, function(err, saved_movie) {

        if(!err) {
            console.dir(saved_movie);
            res.json(saved_movie);
        } else {
            console.dir(err);
            res.status(500).json(err);
        }

    });

});

/* DELETE lesson. */
router.delete('/:lesson_id', function(req, res, next) {

    var lesson_id = req.params.lesson_id;

    LessonsService.deleteLesson(lesson_id, function(err, data) {

        if(!err) {
            res.json(data);
        } else {
            res.status(500).json(err);
        }

    });

});

/**
 * Validates movie format
 * @param movie
 */
function validateMovie(movie) {

    if(!movie) {
        throw new Error("Impossibile salvare il filmato.");
    }

    // controllo che il filmato sia ben formattato (è un controllo minimale, andrebbe esteso)
    if(typeof movie.name === 'undefined' || typeof movie.scenes === 'undefined' || typeof movie.id === 'undefined') {
        throw new Error("Formato non riconosciuto.");
    }

    if(!movie.name.length) {
        throw new Error("Specifica un nome per questo filmato.");
    }

}

module.exports = router;
