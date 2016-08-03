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
            width: 720,
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
            this.movieScaled = false;

            // set container width
            this.$target.width(this.options.width);

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
                this.$playCover = this.$player.find('.prp-play-cover');
                this.$resumeCover = this.$player.find('.prp-resume-cover');
                this.$notFoundCover = this.$player.find('.prp-not-found-cover');

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

                // play cover
                this.$player.on('click', '.prp-play-cover', function() {
                    self.play();
                    self.$playCover[0].style.display = 'none';
                });

                // resume cover
                this.$player.on('click', '.prp-resume-cover', function() {
                    if(self.videoElementRejectedToPlay) {
                        self.videoElementRejectedToPlay.video.play();
                    }
                    self.$resumeCover[0].style.display = 'none';
                    self.$loader[0].style.display = 'block';
                });

                // on parent element resize
                $(window).on('resize', this._debounce(this.onResize, 20, false, this));


                self.onResize();
            },

            /**
             * Bind global listeners
             */
            initGlobalListeners: function () {
                var self = this,
                    wasPlayingBeforeBuffering = true;

                // on movie loaded
                dispatcher.on(dispatcher.movieLoaded, function (e, movie) {
                    var duration = self.movieController.getModel().getDuration();
                    self.$playCover.find('.prp-movie-title').text(self.movieController.getModel().getName());
                    self.$timeDuration.text(_formatTime(duration));
                    self.$loader[0].style.display = 'none';
                    self.$playCover[0].style.display = 'block';
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
                    console.debug('video buffering start');
                    self.$loader[0].style.display = 'block';
                });

                // on movie buffering end
                dispatcher.on(dispatcher.movieBufferingEnd, function () {
                    console.debug('video buffering end');
                    self.$loader[0].style.display = 'none';
                    if(self.movieController.wasPlaying) {
                        console.debug('movie was playing... so let\'s play!');
                        self.play();
                        self.movieController.wasPlaying = false;
                    }
                });

                // if some areas request the movie to pause
                dispatcher.on(dispatcher.doMoviePause, function (e, elementModel) {

                    if (elementModel.getType() === 'QuestionArea') {

                        // force stop on every frame
                        var t = setTimeout(function () {
                            self.pause();
                            clearTimeout(t);
                            t = null;
                        }, 1);

                        if (elementModel.isAnswerRequired()) {
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
                dispatcher.on(dispatcher.doMovieSeekAndPlay, function (e, frame, isRelative) {
                    var t = setTimeout(function () {
                        self.movieController.setPlaying(true);
                        self.seek(isRelative ? self.currentFrame + frame : frame);
                        self.releaseControls();
                        clearTimeout(t);
                        t = null;
                    }, 10);
                });

                // on user exp increased
                dispatcher.on(dispatcher.increasedUserExp, function (e, expEarned, totalExp) {
                    self.updateExp(totalExp, expEarned);
                });

                // on user exp decreased
                dispatcher.on(dispatcher.decreasedUserExp, function (e, expLost, totalExp) {
                    self.updateExp(totalExp, -expLost);
                });

                // on video play rejected
                dispatcher.on(dispatcher.videoPlayRejected, function(e, videoElement) {

                    self.$resumeCover[0].style.display = 'block';
                    self.videoElementRejectedToPlay = videoElement;
                    self.pause();

                    dispatcher.one(dispatcher.videoPlayingStart, function(videoElement2) {
                        self.$loader[0].style.display = 'none';
                        self.play();
                        videoElement2.isDetecting = false;
                        var t = setTimeout(function() {
                            self.videoElementRejectedToPlay.playRejected = false;
                            clearTimeout(t);
                        },30);

                    });

                });


            },

            /**
             * Load movie
             */
            load: function () {
                var self = this;

                Api.getMovie(this.movieId, function (err, data) {

                    // movie not found
                    if (err) {
                        console.error('Prometeo Player: movie not found.');
                        self.$notFoundCover[0].style.display = 'block';
                        return;
                    }

                    // movie not published
                    if(typeof data.published !== 'undefined' && !data.published) {
                        self.$notFoundCover[0].style.display = 'block';
                        return;
                    }

                    // movie found ad published
                    self.movieController.load(data);
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

                this.currentFrame = frame;

                if (this.movieController.isPlaying()) {

                    this.movieController.goToFrame(frame, function onMovieReadyToPlay() {
                        self.play();
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
            updateExp: function (totalExp, eventExp) {
                var self = this,
                    spotExpClass = 'prp-earned',
                    t;

                console.debug('updateExp', totalExp, eventExp);

                this.$totalExp.addClass('prp-update')[0].innerHTML = totalExp + ' exp';

                if (typeof eventExp !== 'undefined') {

                    if (eventExp < 0) {
                        spotExpClass = 'prp-lost';
                    } else {
                        eventExp = '+' + eventExp;
                    }

                    this.$spotExp.addClass(spotExpClass + ' prp-shown')[0].innerHTML = eventExp + ' exp';

                    t = setTimeout(function () {
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
                var width = this.$player.width();
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

                if (this.$player.hasClass('prp-player-resized')) {
                    this.$player.removeClass('prp-player-resized');
                    this.$player.removeAttr('style');
                }

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

                var windowW = screen.width,
                    windowH = screen.height - this.$controlsBar.height();

                console.log('fullscreen resize to ', windowW, windowH);

                this._resizeTo(windowW, windowH);

            },

            /**
             * On parent element resize
             * This makes the player responsive by css scaling it.
             */
            onResize: function () {

                if(this.isFullscreen)
                    return;

                console.debug('resize triggered')

                var self = this,
                    targetWidth = this.$target.width(),
                    targetHeight,
                    controlBarHeight = this.$controlsBar.height(),
                    wasMovieScaled = this.movieScaled,
                    zoom;

                // if container width doesn't match default movie width
                if (targetWidth < this.movieOptions.width) {
                    this.movieScaled = targetWidth < this.movieOptions.width - 100;

                    targetHeight = this.$target.height() + controlBarHeight;

                    if (!this.$player.hasClass('prp-player-resized')) {
                        this.$player.addClass('prp-player-resized')
                    }

                    zoom = this._resizeTo(targetWidth, targetHeight);

                    requestAnimationFrame(function () {
                        self.$player.height((zoom * self.movieOptions.height) + controlBarHeight);
                        self.$player.width(zoom * self.movieOptions.width);
                    });

                } else {
                    this.movieScaled = false;

                    if (this.$player.hasClass('prp-player-resized')) {
                        this.$player.removeClass('prp-player-resized');
                        this.$player.removeAttr('style');
                        this._resizeTo(this.movieOptions.width, this.movieOptions.height + controlBarHeight)
                    }

                }

                if(wasMovieScaled !== this.movieScaled) {
                    console.debug('movie scaled!', wasMovieScaled, this.movieScaled);
                    dispatcher.trigger(dispatcher.movieScaled, this.movieScaled);
                }

            },

            _resizeTo: function (width, height) {

                var self = this,
                    zoom,
                    ratio;

                // calc ratio
                ratio = width / height;

                if (ratio > this.movieOptions.width / this.movieOptions.height) {
                    // if viewport ratio greater than movie ratio, use height
                    zoom = 1 / this.movieOptions.height * height;
                } else {
                    // otherwise, use width
                    zoom = 1 / this.movieOptions.width * width;
                }

                // update Movie size
                requestAnimationFrame(function () {
                    self.$movieArea.css({'transform': 'scale(' + zoom + ')'});
                });

                return zoom;

            },

            /**
             * Debouncer
             * @param func
             * @param wait
             * @param immediate
             * @param context
             * @returns {Function}
             * @private
             */
            _debounce: function (func, wait, immediate, context) {
                var timeout;
                return function () {
                    var _context = context || this,
                        args = arguments;

                    var later = function () {
                        timeout = null;
                        if (!immediate) func.apply(context, args);
                    };

                    var callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait || 100);
                    if (callNow) func.apply(_context, args);
                };
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