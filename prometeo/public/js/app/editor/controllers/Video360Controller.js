"use strict";

define([
        "jquery"
    ],

    function($) {

        // Video Controller
        var Video360Controller = function(videoModel) {
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
        Video360Controller.prototype.setMovieElement = function($el) {
            this.$movieEl = $el;
            this.videoPlayer = $el.find('.player')[0];
        };

        /**
         * On timeline seek
         * @param frame
         */
        Video360Controller.prototype.onSeek = function(frame) {
            this.seek(frame/1000);
        };

        /**
         * go to specific frame and pause
         * @param seconds
         */
        Video360Controller.prototype.seek = function(seconds) {

            if( seconds < 0 || seconds > this.videoPlayer.duration )
                return;

            this.pause();
            this.videoPlayer.currentTime = seconds;

        };

        Video360Controller.prototype.play = function() {
            if(this.playing) return;

            this.videoPlayer.play();
            this.playing = true;
        };

        Video360Controller.prototype.pause = function() {
            if(!this.playing) return;

            this.videoPlayer.pause();
            this.playing = false;
        };

        Video360Controller.prototype.isPlaying = function() {
            return this.playing;
        };

        return Video360Controller;

});