"use strict";

const request = require('request');
const async = require('async');
const path = require('path');
const io = require('socket.io-client');
const ss = require('socket.io-stream');
const socket = io.connect('http://localhost:3000');
const fs = require('fs');
let videoPath = '';

socket.on('connect', function () {
    console.log('connected');
});

var RemotePublisherService = {

    init: function (_videoPath) {
        videoPath = _videoPath;
    },

    publishRequest: function (userId, movie, callback) {
        let self = this;

        request({
            method: 'POST',
            uri: 'http://localhost:3001/api/movie/publish',
            body: {
                userId: userId,
                movie: movie
            },
            json: true,
            callback: function (error, response, body) {

                if(error) {
                    return callback(error, body);
                }

                if (body.videos.length) {
                   self.uploadVideos(body.videos, function() {
                       callback(error, body);
                   });
                } else {
                    callback(error, body);
                }

            }
        });

    },

    uploadVideos: function (videos, callback) {
        let self = this;
        let uploaded = [];

        async.eachSeries(videos, function(filename, cbk){

            self.uploadVideo(path.join(videoPath, filename), function() {
                uploaded.push(filename);
                cbk();
            })

        }, function() {

            callback();
            console.log("all files uploaded", uploaded)

        })

    },

    uploadVideo: function (filename, callback) {

        const stream = ss.createStream();

        ss(socket).emit("upload-video", stream, {name: filename});
        fs.createReadStream(filename).pipe(stream);

        stream.on('end', function () {
            console.log('file received', filename);
            callback(filename);
        });

    }


};

module.exports = RemotePublisherService;