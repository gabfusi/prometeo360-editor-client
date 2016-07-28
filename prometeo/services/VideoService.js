"use strict";

var DatabaseService = require('./DatabaseService.js');
var ffmpeg = require('fluent-ffmpeg');
var path = require('path');


var VideoService = {

    db: new DatabaseService('video'),

    /**
     * Returns the videos list ordered by last creation date (from latest to older)
     * @param callback
     * @returns {*}
     */
    getVideos: function(callback) {
        return this.db.list('videos', 'get_by_date', { descending: true }, callback);
    },

    getVideo: function(video_id, callback) {
        return this.db.get(video_id, callback);
    },

    addVideo: function(video_filename, metadata, callback) {

        if( typeof metadata.created === 'undefined' ) {
            metadata.created = Math.round(new Date().getTime()/1000); // save creation date as unix timestamp
        }

        this.db.insert(video_filename, metadata, function(err, body) {
            if(callback) callback(err, metadata);
        });

    },

    convertVideo: function(input, output_path, filename, callback) {

        var mp4Filename = path.join(output_path, filename) + '.mp4';

        console.log('Converting video "', input, '" to -> ', mp4Filename);

        ffmpeg()
            // on process end
            .on('end', function() {
                console.log('Finished processing video');

                // get video metadata
                ffmpeg.ffprobe(mp4Filename, function(err, metadata) {
                    //console.dir(metadata);

                    if(callback) {
                        callback(false, {
                            filename: mp4Filename,
                            duration: millisecondsToString(metadata.format.duration * 1000),
                            size: metadata.format.size
                        });
                    }

                });

            })
            // on process error
            .on('error', function(err, stdout, stderr) {
                console.log('Cannot process video: ' + err.message);

                if(callback) {
                    callback(true, err.message);
                }

            })
            .input(input)
            .withVideoCodec('libx264')      // use libx264
            .withVideoBitrate(1024)         // enforce a costant video bitrate
            .audioBitrate('128k')           // enforce a constant audio bitrate
            .audioChannels(2)               // stereo!
            .size('720x?')                  // resize to width
            .withAspect('3:2')              // enforce a ratio
            .withFps(29.7)                  // enforce 29.7 fps
            .autopad('black')               // autopad video (adds black space to fit viewport)
            .toFormat('mp4')                // convert to mp4 (cross browser)
            .output(mp4Filename)            // output to
            .run()
        ;

    },

    generateThumbnails : function(video_input, thumb_folder, number, callback) {

        if(!number) {
            number = 4;
        }

        ffmpeg()
            .input(video_input)
            .screenshots({
                count: number,              // eg. 4 -> Will take screens at 20%, 40%, 60% and 80% of the video
                filename: '%f-%i.png',      // eg. mio-video-1.png
                folder: thumb_folder,
                size: '720x?'
            })

            // on process end
            .on('end', function() {
                console.log('Finished processing thumbnails');

                // get screenshots paths
                var thumbs = [],
                    videoFilename = path.parse(video_input).base;

                for( var i = 1; i <= number; i++ ) {
                    thumbs[thumbs.length] = videoFilename + '-' + i + '.png';
                }

                if(callback) {
                    callback(false, thumbs);
                }

            })

            // on process error
            .on('error', function(err, stdout, stderr) {
                console.log('Cannot generate video thumbnails: ' + err.message);

                if(callback) {
                    callback(true, err.message);
                }

            });

    }

};

/**
 * Convert milliseconds to hh:mm:ss.mmm
 * @param duration
 * @returns {string}
 */
var millisecondsToString = function(duration) {

    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
};

module.exports = VideoService;
