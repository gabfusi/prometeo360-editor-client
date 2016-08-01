"use strict";

define([
    'config',
    'dispatcher',
    'controller/TimelineElementController',
    'model/Video',
    'hbs!js/app/viewer/views/Video',
    'hbs'

], function (config, dispatcher, TimelineElementController, Video, VideoTpl, hbs) {

    /**
     *
     * @returns {VideoController}
     * @constructor
     */
    function VideoController(objectModel, movieScaledDown) {

        var self = this;

        TimelineElementController.call(this);

        this.model = new Video();
        this.$el = null;
        this.video = null;
        this.playing = false;
        this.movieScaled = movieScaledDown;


        if(objectModel) {
            this.model.fromObject(objectModel);
        }

        // attach controller reference to model
        this.model.setApi(this);

        return this;
    }

    VideoController.prototype = Object.create(TimelineElementController.prototype);
    VideoController.prototype.constructor = VideoController;

    /**
     * Render element
     * @override
     * @returns {*}
     */
    VideoController.prototype.render = function() {

        var elementModelObject = this.model.toObject(),
            videoFilename;

        if(this.model.getFilename().length) {

            videoFilename = this.model.getFilename();

            console.debug('rendering video, scaled:', this.movieScaled);

            if(this.movieScaled) {
                videoFilename = videoFilename.replace('.mp4', '-low.mp4');
            }

            // add video & thumbnails urls
            elementModelObject.video = config.api.getVideo + videoFilename;
            elementModelObject.thumbnail = config.api.getVideoScreenShot + elementModelObject.filename +  '-1.png';
        }

        this.$el = $(VideoTpl(elementModelObject));
        this.video = this.$el.find('.prp-video-element')[0];
        this.video.height = 480;
        this.video.width = 720;
        this.isBuffering = true;

        this.$el.hide();
        return this.$el;
    };

    /**
     * Attach listeners to video element
     */
    VideoController.prototype.attachListeners = function() {
        var self = this;

        // on video seeked
        $(this.video).on('seeked', function() {
            console.debug('seeked', self.model.getId());
            dispatcher.trigger(dispatcher.videoSeekEnd, this);
        });

        // on video buffering
        $(this.video).on('waiting', function() {
            console.debug('waiting', self.model.getId());
            self.isBuffering = true;
            dispatcher.trigger(dispatcher.videoBufferingStart, this);
        });

        // if video is ready
        $(this.video).on('canplaythrough', function() {
            if(self.video.readyState === 4) {
                console.debug('video buffered!');
                dispatcher.trigger(dispatcher.videoBufferingEnd, this);
                self.isBuffering = false;
            }
        });

        // video playing ---> this isn't consistent across browsers (specially chrome for android)
        /**
        $(this.video).on('playing', function() {
            console.debug('playing', self.model.getId());
            self.isBuffering = false;
            dispatcher.trigger(dispatcher.videoPlayingStart, this);
        });*/

    };

    /**
     * Detach listeners from video elements
     */
    VideoController.prototype.detachListeners = function() {
        $(this.video).off();
    };


    /**
     * Show video
     */
    VideoController.prototype.onShow = function() {
        console.debug('Video: show!', this.model.getId());
        this.attachListeners();
        $(this.video).attr('preload', 'auto');
        this.$el[0].style.display = 'block';
    };

    /**
     * hide video
     */
    VideoController.prototype.onHide = function() {
        console.debug('Video: hide/pause! ', this.model.getId());
        this.video.pause();
        this.video.currentTime = 0; // seek to start
        $(this.video).attr('preload', 'none');
        this.$el[0].style.display = 'none';
        this.$el.detach();
        this.detachListeners();
    };

    /**
     * Play video
     */
    VideoController.prototype.onPlay = function() {
        console.debug('Video: play! ', this.model.getId());
        var self = this;

        this.detectPlaying();

        var promise = self.video.play();

        if(promise) {

            // workaround for chrome android error: Failed to execute 'play' on 'HTMLMediaElement': API can only be initiated by a user gesture.
            promise.catch(function(err){
                dispatcher.trigger(dispatcher.videoPlayRejected, self);
                console.debug('promise fail',err)
            })
        }

        /*
        var t = setTimeout(function() { // some slow browsers can't play hidden HTMLVideoElement

            var promise = self.video.play();

            if(promise) {

                // workaround for chrome android error: Failed to execute 'play' on 'HTMLMediaElement': API can only be initiated by a user gesture.
                promise.catch(function(err){
                    dispatcher.trigger(dispatcher.videoPlayRejected);
                    console.debug('promise fail',err)
                })
            }


            clearTimeout(t);
            t = null;
        },1);
        */

    };

    /**
     * Pause video
     */
    VideoController.prototype.onPause = function() {
        console.log('Video: pause! ');
        this.video.pause();

    };

    /**
     * go to video frame
     * @param frame
     */
    VideoController.prototype.onSeek = function(frame) {
        var videoSeekFrame = frame - this.model.getFrame();
        console.log('Video: seeking to ', frame, videoSeekFrame);
        this.video.currentTime = videoSeekFrame/1000;
    };


    /**
     * I found that HTMLMediaElement 'playing' event is not consistent across browsers...
     * This little function polyfills this issue.
     */
    VideoController.prototype.detectPlaying = function() {
        var self = this,
            prevTime = this.video.currentTime,
            t;

        t = setInterval(function checkIfVideoIsPlaying() {

            if(self.video.currentTime !== prevTime) {
                console.debug('video is really playing!', self.video.currentTime);

                self.isBuffering = false;
                dispatcher.trigger(dispatcher.videoPlayingStart, self);

                clearInterval(t);
                t = null;
            }

            console.log('video is not playing yet...',  prevTime, self.video.currentTime);

            prevTime = self.video.currentTime;

        }, 5);


    };




    return VideoController;

});