var express = require('express');
var router = express.Router();

/* GET lessons list. */
router.get('/', function(req, res, next) {

    res.render('viewer-list', {
        title: 'Prometeo'
    });

});

/* GET lesson editor */
router.get('/:lesson_id', function(req, res, next) {

    var lesson_id = req.params.lesson_id;

    res.render('viewer', {
        lesson_id : lesson_id
    });

});

module.exports = router;
