"use strict";

define(["jquery"], function ($) {

    /**
     * Event Dispatcher
     * Wraps jQuery custom events
     */
    return {

        // movie events
        movieLoaded: 'movieLoaded',
        movieProgress: 'movieProgress',
        movieEnded: 'movieEnded',
        movieBufferingStart: 'movieBufferingStart',
        movieBufferingEnd: 'movieBufferingEnd',
        increasedUserExp: 'increasedUserExp',
        decreasedUserExp: 'decreasedUserExp',
        movieScaled: 'movieScaled',

        // movie events that triggers actions
        doMoviePlay: 'moviePlay',
        doMoviePause: 'moviePause',
        doMovieSeekAndPlay: 'doMovieSeekAndPlay',
        doIncreaseUserExp: 'doIncreaseUserExp',
        doDecreaseUserExp: 'doDecreaseUserExp', // not used


        // video events
        videoSeekStart: 'videoSeekStart',
        videoSeekEnd: 'videoSeekEnd',
        videoBufferingStart: 'videoBufferingStart',
        videoBufferingEnd: 'videoBufferingEnd',
        videoPlayingStart: 'videoPlayingStart',
        videoPlayRejected: 'videoPlayRejected', // on chrome android video play fail (requires user gesture to play a video)

        /**
         * Attach an event handler function for one or more events to the selected elements.
         * @param event
         * @param callback
         */
        on: function (event, callback) {
            $(document).on(event + '.prmt', callback);
        },

        /**
         * Attach a handler to an event for the elements. The handler is executed at most once per element per event type.
         * @param event
         * @param callback
         */
        one: function (event, callback) {
            $(document).one(event + '.prmt', callback);
        },

        /**
         * Remove an event handler.
         * @param arguments
         */
        trigger: function () {
            var args = Array.prototype.slice.call(arguments),
                eventName = args.splice(0, 1);
            $(document).trigger(eventName + '.prmt', args);
        }

    };

});