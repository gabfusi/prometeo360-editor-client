var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
//var Pluploader = require('node-plupload');
var Uuid = require('uuid-lib');
var VideoService = require('../../services/VideoService.js');

const electron = require('electron');
const app = electron.app;

//var UPLOADS_PATH        = path.join(__dirname, "../../", "uploads");
var UPLOADS_PATH        = path.join(app.getPath('videos'), "Prometeo360");
var VIDEO_PATH          = path.join(UPLOADS_PATH, "video");
//var VIDEO_PATH_TMP      = path.join(UPLOADS_PATH, "tmp");
var THUMBS_PATH         = path.join(UPLOADS_PATH, "thumbs");

// SETUP (TODO MOVE in install script)

const mkdirSyncIfNotExists = function (dirPath) {
    try {
        fs.mkdirSync(dirPath)
        return true;
    } catch (err) {
        //if (err.code !== 'EEXIST') throw err
        return false;
    }
};

// check if prometeo dir exists
mkdirSyncIfNotExists(UPLOADS_PATH);
// check if video dir exists
mkdirSyncIfNotExists(VIDEO_PATH);
// check if video dir exists
mkdirSyncIfNotExists(THUMBS_PATH);

/**
 *  GET videos list
 */
router.get('/', function(req, res, next) {

    VideoService.getVideos(function(err, data) {

        if(!err) {
            res.json(data);
        } else {
            res.status(500).json(err);
        }

    })

});

/**
 *  GET a video
 */
router.get('/:filename', function(req, res, next) {
    var filename = req.params.filename;

    // enable cors for this resource (can be requested by player embed)
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    res.sendFile(path.join(VIDEO_PATH, filename));
});

/**
 *  GET a video screenshot
 */
router.get('/screenshot/:filename', function(req, res, next) {
    var filename = req.params.filename;

    res.sendFile(path.join(THUMBS_PATH, filename));
});

/**
 * Upload a video
 */
router.post('/', function(req, res, next){

    var file = req.body;

    if(!file) {
        return res.status(500).json("");
    }

    var inputFilePath = file.tempPath,
        inputFilename = path.basename(file.tempPath),
        inputFilenameWithoutExtension = path.parse(inputFilename).name,
        desiredFilePath = path.join(VIDEO_PATH, inputFilename),
        outputFilePath = desiredFilePath,
        outputFilename = inputFilename,
        outputFilenameWithoutExtension = inputFilenameWithoutExtension;

    // check if filename exists, if exists create a new one.
    if(fs.existsSync(desiredFilePath)) {
        outputFilenameWithoutExtension = inputFilenameWithoutExtension + '-' + Uuid.raw().substr(0, 10);
        outputFilename = outputFilenameWithoutExtension + '.mp4';
        outputFilePath = path.join(VIDEO_PATH, outputFilename);
    }

    VideoService.copyVideo(inputFilePath, outputFilePath, function(err, metadata) {

        if(err) {
            res.status(500).json(metadata);
        } else {


            // create thumb
            VideoService.generateThumbnails(outputFilePath, THUMBS_PATH, 4, function(err, thumbs) {

                if(err) {
                    res.status(500).json(err);
                } else {

                    // delete temp file
                    fs.unlinkSync(inputFilePath);

                    var video = {
                        filename: outputFilename,
                        thumbnails: thumbs,
                        duration: metadata.duration,
                        size: metadata.size
                    };

                    // insert into video db
                    VideoService.addVideo(outputFilename, video, function (err, data) {

                        if(!err) {
                            // return video entity
                            console.log('video added', data);
                            res.json(data);
                        } else {
                            res.status(500).json(err);
                        }

                    });
                }

            });

        }

    });

});

module.exports = router;

/*
module.exports = function(io) {
    // socket io init
    io.on('connection', function (socket) {
        console.log('socket io connected');
    });

    return router;
};*/
