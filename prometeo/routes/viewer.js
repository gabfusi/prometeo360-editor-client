var express = require('express');
var router = express.Router();

/**
 *  GET lesson player.
 *  /player/:lesson_id
 *
 **/
router.get('/player/:lesson_id', function(req, res, next) {
    res.render('player', {
        movie_id: req.params.lesson_id
    });
});

module.exports = router;
