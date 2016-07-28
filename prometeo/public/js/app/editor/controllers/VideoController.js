"use strict";

define([
        "jquery"
    ],

    function($) {

        // Video Controller
        var VideoController = function(videoModel) {
            this.elementModel = videoModel;
            this.$movieEl = null;
            this.videoPlayer = null;
            this.playing = false;
            return this;
        };

        /**
         *
         * @param $el
         */
        VideoController.prototype.setMovieElement = function($el) {
            this.$movieEl = $el;
            this.videoPlayer = $el.find('.player')[0];
        };

        /**
         * On timeline seek
         * @param frame
         */
        VideoController.prototype.onSeek = function(frame) {
            this.seek(frame/1000);
        };

        /**
         * go to specific frame and pause
         * @param seconds
         */
        VideoController.prototype.seek = function(seconds) {

            if( seconds < 0 || seconds > this.videoPlayer.duration )
                return;

            this.pause();
            this.videoPlayer.currentTime = seconds;

        };

        VideoController.prototype.play = function() {
            if(this.playing) return;

            this.videoPlayer.play();
            this.playing = true;
        };

        VideoController.prototype.pause = function() {
            if(!this.playing) return;

            this.videoPlayer.pause();
            this.playing = false;
        };

        VideoController.prototype.isPlaying = function() {
            return this.playing;
        };

        return VideoController;

});