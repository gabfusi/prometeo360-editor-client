"use strict";

define([
        'jquery',
        'api',
        'config',
        'dispatcher',
        'controller/MovieController',
        'controller/SessionController',
        'hbs',
        'hbs!js/app/viewer/views/Player',
        'lib/fullscreen-api-polyfill'
    ],
    function ($, Api, config, dispatcher, MovieController, SessionController, hbs, PlayerTpl, fap) {

        var defaultOptions = {
            target: '.prometeo-movie',  // target element selector or node
            id: null                // movie id
        };

        /**
         * PlayerController
         * @param options
         * @returns {*}
         * @constructor
         */
        function Player(options) {

            this.options = $.extend(defaultOptions, options);
            this.$target = this.options.target;
            this.movieId = this.options.id;
            this.currentFrame = 0;
            this.isFullscreen = false;
            this.movieController = null;

            this.$movieArea = null;

            if (!this.movieId) {
                console.error('Prometeo Player: cannot instantiate player, movie id is empty.');
                return;
            }

            return this.init();
        }


        /**
         * PlayerController prototype
         * @type {{init: Player.init, initUIListeners: Player.initUIListeners, initGlobalListeners: Player.initGlobalListeners, load: Player.load, unload: Player.unload, play: Player.play, pause: Player.pause, seek: Player.seek, stop: Player.stop, updateProgressBar: Player.updateProgressBar, updateCurrentTime: Player.updateCurrentTime, updateExp: Player.updateExp, getFrameFromProgressPosition: Player.getFrameFromProgressPosition, blockControls: Player.blockControls, releaseControls: Player.releaseControls, toggleFullscreen: Player.toggleFullscreen, onFullscreenEnter: Player.onFullscreenEnter, onFullscreenExit: Player.onFullscreenExit, onFullscreenResize: Player.onFullscreenResize}}
         */
        Player.prototype = {

            /**
             * Init player
             */
            init: function () {

                // render player ui
                this.$target.append(PlayerTpl({
                    movie_id: this.movieId
                }));

                this.$player = this.$target.find('.prp-player');
                this.$loader = this.$player.find('.prp-movie-loading');
                this.$play = this.$player.find('.prp-btn-play');
                this.$pause = this.$player.find('.prp-btn-pause');
                this.$progressBar = this.$player.find('.prp-progress-bar');
                this.$progress = this.$player.find('.prp-progress');
                this.$fullscreen = this.$player.find('.prp-btn-fullscreen');
                this.$timeCurrent = this.$player.find('.prp-time-current');
                this.$timeDuration = this.$player.find('.prp-time-duration');
                this.$movieArea = this.$player.find('.prp-movie');
                this.$controlsBar = this.$player.find('.prp-controls');
                this.$totalExp = this.$player.find('.prp-exp-counter');
                this.$spotExp = this.$player.find('.prp-exp-notifier');

                // instantiate new movie controller
                this.movieOptions = {
                    frameRate: 30,
                    width: 720,
                    height: 480
                };

                this.movieController = new MovieController(this.$target, this.movieOptions);

                // ui listeners
                this.initUIListeners();

                // global listeners
                this.initGlobalListeners();

                // display user session exp
                this.updateExp(SessionController.getExp());

                // load movie
                this.load();
            },

            /**
             * Binds UI listeners
             */
            initUIListeners: function () {
                var self = this;

                // init control bar

                // play button
                this.$player.on('click', '.prp-btn-play', function () {
                    self.play();
                });

                // pause button
                this.$player.on('click', '.prp-btn-pause', function () {
                    $(this).hide();
                    self.pause();
                });

                // progress bar
                this.$player.on('click', '.prp-progress-bar', function (e) {
                    var frame = self.getFrameFromProgressPosition(e.offsetX);
                    self.seek(frame);
                });

                // fullscreen button
                this.$player.on('click', '.prp-btn-fullscreen', function () {
                    self.toggleFullscreen();
                });

                // on fullscreen change
                this.$player.on('fullscreenchange', function () {

                    if (document.fullscreenEnabled && !self.isFullscreen) {
                        self.isFullscreen = true;
                        self.onFullscreenEnter();
                    } else {
                        self.isFullscreen = false;
                        self.onFullscreenExit();
                    }

                });

            },

            /**
             * Bind global listeners
             */
            initGlobalListeners: function () {
                var self = this;

                // on movie loaded
                dispatcher.on(dispatcher.movieLoaded, function (e, movie) {
                    var duration = self.movieController.getModel().getDuration();
                    self.$timeDuration.text(_formatTime(duration));
                });

                // on movie progress
                dispatcher.on(dispatcher.movieProgress, function (e, currentFrame, totalFrames, frameRate) {
                    self.currentFrame = currentFrame;
                    self.updateProgressBar(currentFrame / totalFrames);
                    self.updateCurrentTime(currentFrame);
                });

                // on movie ended
                dispatcher.on(dispatcher.movieEnded, function (e) {
                    console.log('movie ended!');
                    self.stop();
                });

                // on movie buffering start
                dispatcher.on(dispatcher.movieBufferingStart, function () {
                    self.$loader[0].style.display = 'block';
                });

                // on movie buffering end
                dispatcher.on(dispatcher.movieBufferingEnd, function () {
                    self.$loader[0].style.display = 'none';
                });

                // if some areas request the movie to pause
                dispatcher.on(dispatcher.doMoviePause, function (e, elementModel) {

                    if (elementModel.getType() === 'QuestionArea') {

                        // force stop on every frame
                        var t = setTimeout(function() {
                            self.pause();
                            clearTimeout(t);
                            t = null;
                        }, 1);

                        if(elementModel.isAnswerRequired()) {
                            // this is the case where a question is mandatory
                            self.blockControls();
                        }

                    } else {
                        self.pause();
                    }

                });

                // if some areas request the movie to play
                dispatcher.on(dispatcher.doMoviePlay, function (e) {
                    self.play();
                    self.releaseControls();
                });

                // if some areas request the movie to pause
                dispatcher.on(dispatcher.doMovieSeekAndPlay, function (e, seekDelta) {
                    self.movieController.setPlaying(true);
                    self.seek(self.currentFrame + seekDelta);
                    self.play();
                    self.releaseControls();
                });

                // on user exp increased
                dispatcher.on(dispatcher.increasedUserExp, function (e, expEarned, totalExp) {
                    self.updateExp(totalExp, expEarned);
                });

                // on user exp decreased
                dispatcher.on(dispatcher.decreasedUserExp, function (e, expLost, totalExp) {
                    self.updateExp(totalExp, -expLost);
                });

            },

            /**
             * Load movie
             */
            load: function () {
                var self = this;

                Api.getMovie(this.movieId, function (err, data) {

                    if (err) {
                        console.error('Prometeo Player: movie not found.');
                        return;
                    }

                    self.movieController.load(data);

                    // autoplay
                    self.play();

                });

            },

            /**
             * Unload movie
             */
            unload: function () {
                // not implemented yet
            },

            /**
             * Play movie
             */
            play: function () {
                this.$play.hide();
                this.$pause.show();
                this.movieController.startTicker();
            },

            /**
             * Pause movie
             */
            pause: function () {
                this.$pause.hide();
                this.$play.show();
                this.movieController.stopTicker();
            },

            /**
             * go to frame
             * @param frame
             */
            seek: function (frame) {
                var self = this;

                console.log('is playing? ', this.movieController.isPlaying());

                this.currentFrame = frame;

                if (this.movieController.isPlaying()) {

                    this.movieController.goToFrame(frame, function onMovieReadyToPlay() {
                        self.movieController.startTicker();
                    });

                } else {

                    this.movieController.goToFrame(frame);

                }

            },

            /**
             * Stop movie, back to start
             */
            stop: function () {
                console.log('video stop');
                this.$pause.hide();
                this.$play.show();
                this.updateProgressBar(0);
                this.movieController.goToFrame(0);
            },

            /**
             * Updates progress bar
             * @param percent
             */
            updateProgressBar: function (percent) {
                this.$progress.css('transform', 'scaleX(' + percent + ')');
            },

            /**
             *
             * @param currentFrame
             */
            updateCurrentTime: function (currentFrame) {
                var time = _formatTime(currentFrame);
                if (time !== this.prevTime) {
                    this.$timeCurrent[0].innerHTML = time;
                    this.prevTime = time;
                }
            },

            /**
             * Updates Exp counter with fancy animation
             * @param totalExp
             * @param eventExp
             */
            updateExp: function(totalExp, eventExp) {
                var self = this,
                    spotExpClass = 'prp-earned',
                    t;

                console.debug('updateExp', totalExp, eventExp);

                this.$totalExp.addClass('prp-update')[0].innerHTML = totalExp + ' exp';

                if(typeof eventExp !== 'undefined') {

                    if(eventExp < 0) {
                        spotExpClass = 'prp-lost';
                    } else {
                        eventExp = '+' + eventExp;
                    }

                    this.$spotExp.addClass(spotExpClass + ' prp-shown')[0].innerHTML = eventExp + ' exp';

                    t = setTimeout(function() {
                        self.$totalExp.removeClass('prp-update');
                        self.$spotExp.removeClass(spotExpClass + ' prp-shown');
                        clearTimeout(t);
                        t = null;
                    }, 2000);
                }

            },

            /**
             * Returns frame from position (called on progress bar click)
             * @param positionX
             * @returns {number}
             */
            getFrameFromProgressPosition: function (positionX) {
                // positionX : 720 = x : movieDuration
                // x = positionX*movieDuration / 720;
                var width = this.isFullscreen ? this.$player.width() : this.movieOptions.width;
                return positionX * this.movieController.getModel().getDuration() / width;
            },


            /**
             * Block mouse events on control bar
             */
            blockControls: function () {
                this.$controlsBar.addClass('prp-disabled');
            },

            /**
             * Release control bar
             */
            releaseControls: function () {
                this.$controlsBar.removeClass('prp-disabled');
            },

            /**
             *
             */
            toggleFullscreen: function () {

                if (!document.fullscreenElement) {

                    this.$player[0].requestFullscreen();

                } else {

                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    }

                }

            },

            /**
             * On fullscreen enter
             */
            onFullscreenEnter: function () {
                var self = this;
                this.$player.addClass('prp-fullscreen');
                self.onFullscreenResize();
            },

            /**
             * On fullscreen exit
             */
            onFullscreenExit: function () {
                this.$player.removeClass('prp-fullscreen');
                this.$movieArea.css('transform', 'scale(1)');
            },

            /**
             * On window resize
             */
            onFullscreenResize: function () {

                var self = this,
                    windowW = screen.width,
                    windowH = screen.height - this.$controlsBar.height(),
                    zoom,
                    ratio;

                // calc ratio
                ratio = windowW / windowH;

                if (ratio > this.movieOptions.width / this.movieOptions.height) {
                    // if viewport ratio greater than movie ratio, use height
                    zoom = 1 / this.movieOptions.height * windowH;
                } else {
                    // otherwise, use width
                    zoom = 1 / this.movieOptions.width * windowW;
                }

                console.log(windowW, windowH, ratio, '> ', this.movieOptions.width, this.movieOptions.height);

                // update Movie size
                requestAnimationFrame(function () {
                    self.$movieArea.css({'transform': 'scale(' + zoom + ')'});
                });

            },


            onResize: function() {

                var targetWidth = this.$target.width();

                // if container width doesn't match default movie width
                if( targetWidth !== this.movieOptions.width) {

                    // let's resize this guy!

                    // TODO

                }

            }

        };

        /**
         * Convert milliseconds to HH:MM:SS format
         * @param ms
         * @returns {string}
         * @private
         */
        var _formatTime = function (ms) {
            // 1- Convert to seconds:
            var seconds = ms / 1000;
            // 2- Extract hours:
            var hours = parseInt(seconds / 3600); // 3,600 seconds in 1 hour
            seconds = seconds % 3600; // seconds remaining after extracting hours
            // 3- Extract minutes:
            var minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
            // 4- Keep only seconds not extracted to minutes:
            seconds = Math.round(seconds % 60);

            if (hours) {
                hours += ':';
            } else {
                hours = '';
            }

            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            return hours + minutes + ':' + seconds;
        };


        return Player;

    });