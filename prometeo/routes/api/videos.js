var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var Pluploader = require('node-plupload');
var Uuid = require('uuid-lib');
var VideoService = require('../../services/VideoService.js');

var UPLOADS_PATH        = path.join(__dirname, "../../", "uploads");
var VIDEO_PATH          = path.join(UPLOADS_PATH, "video");
var VIDEO_PATH_TMP      = path.join(UPLOADS_PATH, "tmp");
var THUMBS_PATH         = path.join(UPLOADS_PATH, "thumbs");

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


    // These options are also passed through to multiparty Form
    // instances. See https://github.com/andrewrk/node-multiparty#multipartyform
    var pluploader = new Pluploader({
        autoFiles: true,
        // Optional - defaults to os.tmpDir()
        uploadDir: VIDEO_PATH_TMP
    });

    /*
     * Emitted when an entire file has been uploaded.
     *
     * @param file {Object} An object containing the uploaded file's name, type, buffered data & size
     * @param req {Request} The request that carried in the final chunk
     */
    pluploader.on('fileUploaded', function(file, req) {

        var inputFilePath = file.tempPath,
            filename = file.name,
            filenameWithoutExtension = path.parse(filename).name,
            desiredFilePath = path.join(VIDEO_PATH, filename);

        console.log('file uploaded', file);

        // check if filename exists, if exists create a new one.
        try{
            fs.statSync(desiredFilePath);
            filenameWithoutExtension = filenameWithoutExtension + '-' + Uuid.raw().substr(0, 10);
            console.log('file with same name already exists, renaming to', filenameWithoutExtension);
        }catch(err){
            // file does not exists, continue...
        }

        // convert video
        VideoService.convertVideo(inputFilePath, VIDEO_PATH, filenameWithoutExtension, function(err, metadata) {

            if(err) {
                res.status(500).json(metadata);
            } else {

                var outputFilePath = metadata.filename;
                var convertedFilename = path.parse(outputFilePath).base;

                // create thumb
                VideoService.generateThumbnails(outputFilePath, THUMBS_PATH, 4, function(err, thumbs) {

                    if(err) {
                        res.status(500).json(err);
                    } else {

                        // delete temp file
                        fs.unlinkSync(inputFilePath);

                        var video = {
                            filename: convertedFilename,
                            thumbnails: thumbs,
                            duration: metadata.duration,
                            size: metadata.size
                        };

                        // insert into video db
                        VideoService.addVideo(convertedFilename, video, function (err, data) {

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

    /*
     * Emitted when an error occurs
     *
     * @param error {Error} The error
     */
    pluploader.on('error', function(error) {
        throw error;
    });


    pluploader.handleRequest(req, res);

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
