"use strict";

define([
        'jquery',
        'dispatcher',
        'model/Movie',
        "controller/TimelineController",
        "controller/TimelineElementController",
        'jqueryui/resizable',
        'jqueryui/draggable'
    ],

    function($, dispatcher, Movie, TimelineController, TimelineElementController) {

        var _movieModel,
            _defaultWidth = 720,// default video aspect ratio -> 4:3
            _defaultHeight = 480,
            _movieRatio = _defaultWidth/_defaultHeight,
            _movieZoomFactor = .85,
            _width = 0,
            _height = 0,
            _zoom = 1;

        /**
         * MovieController Controller
         * @type {{create: MovieController.create}}
         */
        var MovieController = {

            init: function($movieElement) {

                this.$movieContainer = $('.movie-container');
                this.$movie = $movieElement;
                this.$movieArea = $movieElement.find('.movie-area>.inner');
                this.$movieBg = $movieElement.find('.movie-bg');

                this.initListeners();
                this.onResize(); // init zoom, width, height
            },


            initListeners: function(){
                var self = this;

                // on movie start loading
                dispatcher.on(dispatcher.movieLoadingStart, function() {
                    self.$movieArea.hide();
                    console.debug('movie loading start');
                });

                // on movie loaded
                dispatcher.on(dispatcher.movieRendered, function() {
                    self.$movieArea.fadeIn(300);
                    console.debug('movie rendered');
                });


                // on TimelineElements click
                this.$movieArea.on('click', '.area', function(e){
                    e.stopPropagation();
                    var elementModel = $(this).data('model');
                    dispatcher.trigger(dispatcher.elementSelected, elementModel);
                });

                // on TimelineElements selected
                dispatcher.on(dispatcher.elementSelected, function(e, elementModel) {
                    var $el = self.getElement(elementModel.getId());

                    if($el.length) {
                        $el.addClass('selected').siblings('.selected').removeClass('selected');
                    }
                });

                // on TimelineElements deselected
                dispatcher.on(dispatcher.elementsDeselected, function() {
                    self.$movieArea.find('.area.selected').removeClass('selected');
                });

                // on TimelineElements updated
                dispatcher.on(dispatcher.elementUpdated, function(e, elementModel) {
                    self.updateElement(elementModel);
                });

            },

            /**
             * Create or load movie
             * @param data
             * @returns {*}
             */
            create: function(data) {

                var self = this,
                    elementModel = null;

                _movieModel = null;
                _movieModel = new Movie();

                if(!data) {
                    dispatcher.trigger(dispatcher.movieRendered);
                    TimelineController.resetTrack();
                    return _movieModel;
                }

                // unserialize data

                _movieModel.setId(data.id);
                _movieModel.setName(data.name);
                _movieModel.setPublished(data.published);

                // FIXME andrebbe ottimizzata con una bulk insert, al posto che molteplici inserimenti dei singoli elementi.
                for(var i in data.elements) {

                    elementModel = TimelineElementController.create(data.elements[i].type, data.elements[i]);

                    // add element to movie
                    this.loadElement(elementModel);

                    // add element to timeline
                    TimelineController.loadElement(elementModel);

                }

                // Attendo il render degli elementi (questa cosa non è elegantissima)
                var maxWaitingTime = 2000,
                    waitingTime = 0,
                    waitingInterval = 100,
                    renderWaiter = setInterval(function(){

                        if(self.$movieArea.children().length === data.elements.length || waitingTime >= maxWaitingTime) {
                            TimelineController.resetTrack();
                            self.updateVisibleElements(0);
                            dispatcher.trigger(dispatcher.movieRendered);
                            clearInterval(renderWaiter);
                            renderWaiter = null;
                            return;
                        }

                        waitingTime += waitingInterval;

                }, waitingInterval);


            },

            /**
             * Unloads current movie
             */
            unload: function() {
                _movieModel = null;
                this.$movieArea.empty();
            },

            /**
             * Return a movie element
             * @param id
             * @returns {*|{}}
             */
            getElement: function(id) {
                return this.$movieArea.find('[data-id="' + id + '"]')
            },

            /**
             * Add element to movie
             * @param elementModel
             * @returns {*}
             */
            addElement: function(elementModel) {

                var elementModels = _movieModel.getTimelineElementsAt(elementModel.getFrame());

                if(elementModel.getType() !== 'Video') {
                    var areaIndex = elementModels.length > 0 ? elementModels.length+1 : 2;
                    elementModel.setZindex(areaIndex);
                }

                return this.loadElement(elementModel);

            },

            /**
             * load an element in the current movie
             * @param elementModel
             * @returns {*}
             */
            loadElement: function(elementModel) {

                // generate TimelineElement jQuery object
                var $element = TimelineElementController.render(elementModel);

                // adds new TimelineElement to current Movie model
                _movieModel.addTimelineElement(elementModel);

                // append element view to DOM
                this.$movieArea.append($element);

                // setup element
                this.setupElement($element);

                return $element;

            },

            /**
             *
             * @param elementModel
             */
            updateElement: function(elementModel) {

                var id = elementModel.getId(),
                    $oldElement = this.getElement(id);

                // generate updated TimelineElement jQuery object
                var $element = TimelineElementController.render(elementModel);

                $oldElement.replaceWith($element);

                // setup element
                this.setupElement($element);

            },

            /**
             * Setup element behaviours
             * @param $element
             */
            setupElement: function($element) {
                var self = this,
                    elementType = $element.data('model').getType();

                if(elementType === 'Video' || elementType === 'QuestionArea') {
                    return false;
                }

                var containmentW,
                    containmentH,
                    objW,
                    objH;

                // make element resizable
                $element.resizable({
                    minWidth: -10000,  // these need to be large and negative
                    minHeight: -10000, // so we can shrink our resizable while scaled

                    start: function(evt, ui) {
                        containmentW = self.$movieArea.width();
                        containmentH = self.$movieArea.height();
                    },
                    resize: function(evt, ui) {

                        var elementModel = $(this).data('model'),
                            boundReached = false,
                            changeWidth = ui.size.width - ui.originalSize.width,
                            newWidth = ui.originalSize.width + changeWidth / _zoom,
                            changeHeight = ui.size.height - ui.originalSize.height,
                            newHeight = ui.originalSize.height + changeHeight / _zoom,

                            changeLeft = ui.position.left - ui.originalPosition.left,
                            newLeft = ui.originalPosition.left + changeLeft / _zoom,
                            changeTop = ui.position.top - ui.originalPosition.top,
                            newTop = ui.originalPosition.top + changeTop / _zoom;


                        // right bound check
                        if(newWidth > containmentW - newLeft) {
                            newWidth = containmentW - newLeft;
                            boundReached = true;
                        }
                        // left bound check
                        if(newWidth < 0) {
                            newWidth = 0;
                            boundReached = true;
                        }
                        // bottom bound check
                        if(newHeight > containmentH - newTop) {
                            newHeight = containmentH - newTop;
                            boundReached = true;
                        }
                        // top bound check
                        if(newHeight < 0) {
                            newHeight = 0;
                            boundReached = true;
                        }

                        ui.size.width = newWidth;
                        ui.size.height = newHeight;

                        elementModel.setWidth(ui.size.width);
                        elementModel.setHeight(ui.size.height);

                        dispatcher.trigger(dispatcher.elementResized, elementModel);
                    }
                });


                // make element draggable
                $element.draggable({

                    start: function(evt, ui) {
                        ui.position.left = 0;
                        ui.position.top = 0;

                        containmentW = self.$movieArea.width() * _zoom;
                        containmentH = self.$movieArea.height() * _zoom;
                        objW = $(this).outerWidth() * _zoom;
                        objH = $(this).outerHeight() * _zoom;

                    },
                    drag: function(evt, ui) {

                        var elementModel = $(this).data('model'),
                            boundReached = false,
                            changeLeft = ui.position.left - ui.originalPosition.left, // find change in left
                            newLeft = ui.originalPosition.left + changeLeft / _zoom, // adjust new left by our zoomScale
                            changeTop = ui.position.top - ui.originalPosition.top, // find change in top
                            newTop = ui.originalPosition.top + changeTop / _zoom; // adjust new top by our zoomScale


                        // right bound check
                        if(ui.position.left > containmentW - objW) {
                            newLeft = (containmentW - objW) / _zoom;
                            boundReached = true;
                        }
                        // left bound check
                        if(newLeft < 0) {
                            newLeft = 0;
                            boundReached = true;
                        }
                        // bottom bound check
                        if(ui.position.top > containmentH - objH) {
                            newTop = (containmentH - objH) / _zoom;
                            boundReached = true;
                        }
                        // top bound check
                        if(newTop < 0) {
                            newTop = 0;
                            boundReached = true;
                        }

                        ui.position.left = newLeft;
                        ui.position.top = newTop;


                        elementModel.setX(ui.position.left);
                        elementModel.setY(ui.position.top);

                        dispatcher.trigger(dispatcher.elementDragged, elementModel);

                    }
                });

            },

            /**
             * Remove an element
             * @param elementModel
             */
            removeElement: function(elementModel) {

                var id = elementModel.getId(),
                    $element = this.getElement(id);

                $element.remove();

                dispatcher.trigger(dispatcher.elementRemoved, elementModel);

                _movieModel.removeTimelineElement(elementModel.getId());
            },


            /**
             * Returns elements appearing in the given frame
             */
            getVisibleElements: function(frame) {

                var elementModels = _movieModel.getTimelineElementsAt(frame),
                    $elements = [],
                    i = 0,
                    l;

                if(elementModels.length > 0) {

                    for( i = 0, l = elementModels.length; i < l; i++ ) {
                        $elements[$elements.length] = this.getElement(elementModels[i].getId());
                    }

                }

                return $elements;

            },

            /**
             * Show or hide TimelineElements appearing in the given frame
             * @param frame
             */
            updateVisibleElements: function(frame) {

                if(!_movieModel) return;

                var self = this,
                    $elements = this.getVisibleElements(frame),
                    elementApi,
                    elementModel,
                    i, l;


                requestAnimationFrame(function() {

                    self.$movieArea.find('.area').hide();
                    for( i = 0, l = $elements.length; i < l; i++ ) {
                        $elements[i].show();
                        elementApi = $elements[i].data('api');
                        if(elementApi) {
                            elementModel = $elements[i].data('model');

                            $elements[i].data('api').onSeek(frame - elementModel.getFrame());
                        }
                    }

                });

            },

            /**
             * Get zoom
             * @returns {number}
             */
            getZoom: function() {
                return _zoom;
            },

            getModel: function() {
                return _movieModel;
            },

            getMovieDefaults: function() {
                return {
                    'width' : _defaultWidth,
                    'height': _defaultHeight,
                    'centerX': _defaultWidth/2,
                    'centerY': _defaultHeight/2
                }
            },

            /**
             * On window resize
             */
            onResize: function(){

                var self = this,
                    timelineShown = true,
                    windowW,
                    windowH,
                    futureWidth,
                    futureHeight,
                    ratio;

                if(timelineShown) {
                    windowW = this.$movieContainer.width();
                    windowH = this.$movieContainer.height();
                } else {
                    windowW = window.innerWidth;
                    windowH = window.innerHeight;
                }

                // movie container size fixed to _movieZoomFactor of window width
                _width = windowW * _movieZoomFactor;
                _height = windowH * _movieZoomFactor;

                // calc ratio
                ratio = windowW / windowH;

                if(ratio > _movieRatio) {
                    // if viewport ratio greater than movie ratio, use height
                    _zoom = 1/_defaultHeight * _height;
                } else {
                    // otherwise, use width
                    _zoom = 1/_defaultWidth * _width;
                }

                // update Movie size
                requestAnimationFrame(function() {
                    self.$movie.css({'transform': 'scale(' + _zoom + ')'});
                });

            }

        };

        return MovieController;

    });