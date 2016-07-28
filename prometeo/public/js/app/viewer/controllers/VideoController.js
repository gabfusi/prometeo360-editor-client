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
    function VideoController(objectModel) {

        TimelineElementController.call(this);

        this.model = new Video();
        this.$el = null;
        this.video = null;
        this.playing = false;


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

        var elementModelObject = this.model.toObject();

        if(this.model.getFilename().length) {
            // add video & thumbnails urls
            elementModelObject.video = config.api.getVideo + elementModelObject.filename;
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

        // video playing
        $(this.video).on('playing', function() {
            console.debug('playing', self.model.getId());
            self.isBuffering = false;
            dispatcher.trigger(dispatcher.videoPlayingStart, this);
        });

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
        this.$el[0].style.display = 'block';
        this.attachListeners();
    };

    /**
     * hide video
     */
    VideoController.prototype.onHide = function() {
        console.debug('Video: hide/pause! ', this.model.getId());
        this.video.pause();
        this.video.currentTime = 0; // seek to start
        this.$el[0].style.display = 'none';
        this.detachListeners();
    };

    /**
     * Play video
     */
    VideoController.prototype.onPlay = function() {
        console.debug('Video: play! ', this.model.getId());
        var self = this;

        var t = setTimeout(function() { // some slow browsers can't play hidden HTMLVideoElement
            self.video.play();
            clearTimeout(t);
            t = null;
        },1)

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


    return VideoController;

});