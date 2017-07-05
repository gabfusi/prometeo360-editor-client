"use strict";

const ipc = require("node-ipc");
const path = require("path");
const fs = require("fs");
const Uuid = require('uuid-lib');
const VideoService = require('../services/VideoService.js');

module.exports = function (sharedConfig) {

    const VIDEO_PATH = sharedConfig.videosPath;
    const THUMBS_PATH = sharedConfig.screenshotsPath;

    /**
     * Videos list
     */
    ipc.server.on(
        'videos.list',
        function (data, socket) {

            VideoService.getVideos(function (err, data) {

                if (err) {
                    return ipcSendError(socket, 'videos.list', err.message)
                }

                ipcSend(socket, 'videos.list', data)

            });
        }
    );

    /**
     * Movie delete
     */
    ipc.server.on(
        'videos.upload',
        function (data, socket) {

            const filePath = data.filePath;

            let inputFilePath = filePath,
                inputFilename = path.basename(filePath),
                inputFilenameWithoutExtension = path.parse(inputFilename).name,
                desiredFilePath = path.join(VIDEO_PATH, inputFilename),
                outputFilePath = desiredFilePath,
                outputFilename = inputFilename,
                outputFilenameWithoutExtension = inputFilenameWithoutExtension;

            // check if filename exists, if exists create a new one.
            if (fs.existsSync(desiredFilePath)) {
                outputFilenameWithoutExtension = inputFilenameWithoutExtension + '-' + Uuid.raw().substr(0, 10);
                outputFilename = outputFilenameWithoutExtension + '.mp4';
                outputFilePath = path.join(VIDEO_PATH, outputFilename);
            }

            VideoService.copyVideo(inputFilePath, outputFilePath, function (err, metadata) {

                if (err) {
                    return ipcSendError(socket, 'videos.upload', metadata)
                }


                // create thumb
                VideoService.generateThumbnails(outputFilePath, THUMBS_PATH, 4, function (err, thumbs) {

                    if (err) {
                        return ipcSendError(socket, 'videos.upload', err)
                    }

                    // delete temp file
                    // fs.unlinkSync(inputFilePath);

                    let video = {
                        filename: outputFilename,
                        thumbnails: thumbs,
                        duration: metadata.durationMillis,
                        durationString: metadata.durationString,
                        size: metadata.size
                    };

                    // insert into video db
                    VideoService.addVideo(outputFilename, video, function (err, data) {


                        if (err) {
                            return ipcSendError(socket, 'videos.upload', err)
                        }

                        console.log('video added', data);

                        ipcSend(socket, 'videos.upload', data)

                    });


                });


            });

        }
    );


};

function ipcSend(socket, type, data) {

    ipc.server.emit(
        socket, type, {
            id: ipc.config.id,
            message: data
        }
    );
}

function ipcSendError(socket, type, error) {

    ipc.server.emit(
        socket, type, {
            id: ipc.config.id,
            message: {"error": error}
        }
    );
}