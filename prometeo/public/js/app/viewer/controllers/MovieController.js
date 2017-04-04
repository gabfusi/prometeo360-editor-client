"use strict";

define([
        'jquery',
        'config',
        'dispatcher',
        'model/Movie',
        'controller/VideoController',
        'controller/TextAreaController',
        'controller/JumpAreaController',
        'controller/LinkAreaController',
        'controller/QuestionAreaController',
        'lib/correctiveInterval'
    ],

    function ($, config, dispatcher, Movie,
              VideoController, TextAreaController, JumpAreaController, LinkAreaController, QuestionAreaController, ci) {

        var defaultOptions = {
            frameRate: 30,              // execute movie update check every X milliseconds
            width: 720,                 // default video aspect ratio -> 4:3
            height: 480
        };

        /**
         *
         * @param $player
         * @param options
         * @returns {MovieController}
         * @constructor
         */
        function MovieController($player, options) {

            this.options = $.extend(defaultOptions, options);
            this.$player = $player;
            this.$container = $player.find('.prp-movie');

            // movie model
            this.movieModel = null;
            // movie auxiliary index
            this.movieTimeline = null;
            // movie interval
            this.movieInterval = null;
            // is video playing?
            this.playing = false;
            // was movie playing before internal pause event?
            this.wasPlaying = false;
            // movie duration
            this.movieDuration = 0;
            // current frame
            this.currentFrame = 0;
            // currently shown elements
            this.currentElements = {};
            // if some elements required a movie pause
            this.willMovieStop = false;
            // is movie scaled down?
            this.movieScaled = false;

            this.zoom = 1;

            this.bindListeners();

            return this;
        }

        /**
         * MovieController prototype
         * @type {{bindListeners: MovieController.bindListeners, load: MovieController.load, generateTimeline: MovieController.generateTimeline, goToFrame: MovieController.goToFrame, startTicker: MovieController.startTicker, stopTicker: MovieController.stopTicker, onTick: MovieController.onTick, performAction: MovieController.performAction, renderElements: MovieController.renderElements, playCurrentElements: MovieController.playCurrentElements, pauseCurrentElements: MovieController.pauseCurrentElements, renderElementsAt: MovieController.renderElementsAt, isPlaying: MovieController.isPlaying, setPlaying: MovieController.setPlaying, isVideoShown: MovieController.isVideoShown, getModel: MovieController.getModel, _roundToFrameRate: MovieController._roundToFrameRate}}
         */
        MovieController.prototype = {


            bindListeners: function() {
                var self = this;

                dispatcher.on(dispatcher.videoBufferingStart, function() {
                    self.wasPlaying = self.isPlaying();
                    dispatcher.trigger(dispatcher.movieBufferingStart);
                    self.stopTicker();
                });

                dispatcher.on(dispatcher.videoBufferingEnd, function() {
                    dispatcher.trigger(dispatcher.movieBufferingEnd);
                });

                dispatcher.on(dispatcher.movieScaled, function(e, isScaled) {
                    self.movieScaled = isScaled;
                });

            },

            /**
             * Loads a Movie
             * @param data
             */
            load: function (data) {

                var self = this,
                    api = null;

                this.movieDuration = this._roundToFrameRate(data.duration);

                // create new movie
                this.movieModel = null;
                this.movieModel = new Movie();

                // populate new movie with data
                var i = 0,
                    l = data.elements.length;

                this.movieModel.setId(data.id);
                this.movieModel.setName(data.name);
                this.movieModel.setPublished(data.published);
                this.movieModel.setDuration(this.movieDuration);

                for (; i < l; i++) {

                    switch (data.elements[i].type) {

                        case 'Video' :
                            api = new VideoController(data.elements[i], this.movieScaled);
                            break;

                        case 'TextArea' :
                            api = new TextAreaController(data.elements[i]);
                            break;

                        case 'LinkArea' :
                            api = new LinkAreaController(data.elements[i]);
                            break;

                        case 'JumpArea' :
                            api = new JumpAreaController(data.elements[i]);
                            break;

                        case 'QuestionArea' :
                            api = new QuestionAreaController(data.elements[i]);
                            break;

                    }

                    // prerender element
                    api.render();

                    // add to movie model
                    this.movieModel.addTimelineElement(api.getModel());
                }

                this.generateTimeline();
            },

            /**
             * Generates an auxiliary object for a faster elements search
             */
            generateTimeline: function () {

                var movieElements = this.movieModel.getElements(),
                    orderedElements,
                    i = 0,
                    l = movieElements.length,
                    el,
                    elStartFrame,
                    elEndFrame;

                // create auxiliary index
                this.movieTimeline = {};

                // sort elements from first to last, using frame order
                orderedElements = movieElements.sort(function (a, b) {
                    return a.getFrame() - b.getFrame();
                });

                // populate the auxiliary object (the timeline)
                // where each object key correspond in one or more actions (hide or show element, pause the movie)
                for (; i < l; i++) {

                    el = orderedElements[i];
                    elStartFrame = el.getFrame();
                    elEndFrame = el.getEndFrame();

                    // round down frames to the nearest multiple of _frameRate
                    elStartFrame = this._roundToFrameRate(elStartFrame);
                    elEndFrame = this._roundToFrameRate(elEndFrame);


                    if (typeof this.movieTimeline[elStartFrame] === 'undefined') {
                        this.movieTimeline[elStartFrame] = [];
                    }

                    if (typeof this.movieTimeline[elEndFrame] === 'undefined') {
                        this.movieTimeline[elEndFrame] = [];
                    }

                    // store an element reference when element appears
                    this.movieTimeline[elStartFrame].push({
                        action: 'show',
                        pause: el.isPauseMovie(),
                        api: el.getApi()
                    });

                    // store an element reference when element is going to disappear
                    this.movieTimeline[elEndFrame].push({
                        action: 'hide',
                        api: el.getApi()
                    });

                }

                dispatcher.trigger(dispatcher.sceneLoaded);

            },


            /**
             * Go to desired frame and pause
             * @param frame
             * @param callback
             */
            goToFrame: function (frame, callback) {

                if (typeof frame === 'number') {
                    this.currentFrame = this._roundToFrameRate(frame);
                }

                // stop movie ticker
                this.stopTicker();

                // render desired frame
                this.renderElementsAt(this.currentFrame); // triggers seek operation

                // if a video is present, it will be seeked, infact:
                // video seek operation is async, this could cause misalignment between Ticker and video
                // so the startTick method MUST be called when video is ready to be played (seeked event)
                if (this.isVideoShown(this.currentElements)) {

                    dispatcher.trigger(dispatcher.movieBufferingStart);

                    dispatcher.one(dispatcher.movieBufferingEnd, function () {
                        if (callback) callback();
                    });

                } else {
                    if (callback) callback();
                }

                // trigger movieProgress
                dispatcher.trigger(dispatcher.movieProgress, this.currentFrame, this.movieDuration);

            },

            /**
             * Start movie ticker (play movie)
             */
            startTicker: function () {
                var self = this;

                if(this.movieInterval !== null) // video already started
                    return;

                // stop movie ticker
                this.stopTicker();

                // set playing
                this.setPlaying(true);

                // start movie interval
                this.movieInterval = ci.setCorrectingInterval(function () {
                    self.currentFrame += self.options.frameRate;
                    self.onTick();
                }, self.options.frameRate);

                // trigger first tick
                this.onTick();

                // let's trigger play on current elements
                this.playCurrentElements();
            },

            /**
             * Stop movie ticker (pause movie)
             */
            stopTicker: function () {

                if (this.movieInterval !== null) {
                    ci.clearCorrectingInterval(this.movieInterval);
                    this.pauseCurrentElements();
                    this.movieInterval = null;
                    this.setPlaying(false);
                }

            },

            /**
             * On each tick (each movie frame, according to _frameRate)
             */
            onTick: function (customElements) {

                dispatcher.trigger(dispatcher.movieProgress, this.currentFrame, this.movieDuration);

                if (typeof this.movieTimeline[this.currentFrame] === 'undefined' && !customElements) {
                    return;
                }

                console.debug('Frame', this.currentFrame, 'contains some actions...');

                var self = this,
                // if customElements is defined, render customElements
                // else render ticker elements defined on movieTimeline
                    actions = customElements || this.movieTimeline[this.currentFrame];

                this.willMovieStop = false;

                // parse actions
                for (var i = 0, l = actions.length; i < l; i++) {
                    this.performAction(actions[i]);
                }

                // if an area required a movie pause
                if(this.willMovieStop) {
                    dispatcher.trigger(dispatcher.doMoviePause, this.willMovieStop);
                }

                if (this.currentFrame >= this.movieModel.getDuration()) {
                    this.stopTicker();
                    dispatcher.trigger(dispatcher.movieEnded);
                }

            },

            /**
             * Parse and execute a timeline action
             * @param actionElement
             */
            performAction: function (actionElement) {

                var elementModel = actionElement.api.getModel(),
                    elementId = elementModel.getId();

                // check if an element will pause the movie and if it isn't the one that paused it before
                if (actionElement.pause && !actionElement.api.hasPausedMovie) {

                    this.willMovieStop = elementModel;
                    actionElement.api.hasPausedMovie = true;

                    // if is a question area, force movie to pause, no matter which is the current frame
                    if (elementModel.getType() === 'QuestionArea') {
                        this.setPlaying(false, true);
                    }

                }

                // render element
                if (actionElement.action === 'show') {

                    console.log('Showing element', actionElement.api.getModel());

                    // attach element to dom
                    this.$container.append(actionElement.api.getDomElement());

                    // on element shown
                    actionElement.api.onShow();

                    if (this.isPlaying()) {
                        actionElement.api.onPlay();
                    }

                    // updates current movie element
                    if (typeof this.currentElements[elementId] === 'undefined') {
                        this.currentElements[elementId] = actionElement;
                    }

                } else

                // hide element
                if (actionElement.action === 'hide') {

                    console.log('Hiding element', actionElement.api.getModel());

                    // hide elements
                    actionElement.api.onHide();

                    // updates current movie element
                    if (typeof this.currentElements[elementId] !== 'undefined') {
                        delete this.currentElements[elementId];
                    }
                }

            },

            /**
             * Append elements to DOM
             * @param $elements
             */
            renderElements: function ($elements) {
                if (!$elements.length) return;
                this.$container.append($elements);
            },

            /**
             * Play current elements
             */
            playCurrentElements: function () {

                var actionElement;

                for (var i in this.currentElements) {
                    actionElement = this.currentElements[i];
                    actionElement.api.onPlay();
                }

            },

            /**
             * Pause current elements
             */
            pauseCurrentElements: function () {

                var actionElement;

                for (var i in this.currentElements) {
                    actionElement = this.currentElements[i];
                    actionElement.api.onPause();
                }

            },


            /**
             * Render elements appearing in the given frame
             */
            renderElementsAt: function (frame) {

                console.debug('renderElementsAt');

                var elementModels = this.movieModel.getTimelineElementsAt(frame),
                    currentFrameElements = [],
                    i, l;

                // hide current elements
                for (i in this.currentElements) {
                    this.currentElements[i].api.onHide();
                }
                this.currentElements = null;
                this.currentElements = [];


                // show elements
                for (i = 0, l = elementModels.length; i < l; i++) {

                    // call seek operation
                    elementModels[i].getApi().onSeek(frame);

                    currentFrameElements[currentFrameElements.length] = {
                        action: 'show',
                        pause: elementModels[i].isPauseMovie(),
                        api: elementModels[i].getApi()
                    };
                }

                // render elements
                this.onTick(currentFrameElements);
            },

            /**
             * is video playing?
             * @returns {boolean}
             */
            isPlaying: function () {
                return this.playing;
            },

            /**
             * set playing status
             * @param bool
             */
            setPlaying: function(bool) {
                this.playing = bool;
            },

            /**
             * Checks if the given set of elements contains at least one video
             * @param elements
             * @returns {boolean}
             */
            isVideoShown: function (elements) {

                var i;

                for (i in elements) {
                    if (elements[i].api.getModel().getType() === 'Video') {
                        return true;
                    }
                }

                return false;
            },

            /**
             * return movie model
             * @returns {null|*}
             */
            getModel: function () {
                return this.movieModel;
            },

            /**
             * Round milliesc to base frame rate
             * @param millisec
             * @returns {number}
             * @private
             */
            _roundToFrameRate: function (millisec) {
                return Math.floor(millisec / this.options.frameRate) * this.options.frameRate;
            }

        };

        return MovieController;

    });