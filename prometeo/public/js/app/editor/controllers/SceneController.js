"use strict";

define([
        'jquery',
        'dispatcher',
        'model/Scene',
        "controller/TimelineController",
        "controller/TimelineElementController",
        'jqueryui/resizable',
        'jqueryui/draggable'
    ],

    function($, dispatcher, Scene, TimelineController, TimelineElementController) {

        var _sceneModel,
            _defaultWidth = 720,// default video aspect ratio -> 4:3
            _defaultHeight = 480,
            _sceneRatio = _defaultWidth/_defaultHeight,
            _sceneZoomFactor = .85,
            _width = 0,
            _height = 0,
            _zoom = 1;

        /**
         * SceneController Controller
         * @type {{create: SceneController.create}}
         */
        var SceneController = {

            init: function($sceneElement) {

                this.$sceneContainer = $('.movie-container');
                this.$scene = $sceneElement;
                this.$sceneArea = $sceneElement.find('.movie-area>.inner');
                this.$sceneBg = $sceneElement.find('.movie-bg');

                this.initListeners();
            },


            initListeners: function(){
                var self = this;

                // on scene start loading
                dispatcher.on(dispatcher.sceneLoadingStart, function() {
                    self.$sceneArea.hide();
                    console.debug('scene loading start');
                });

                // on movie loaded
                dispatcher.on(dispatcher.sceneRendered, function() {
                    self.$movieArea.fadeIn(300);
                    console.debug('scene rendered');
                });


                // on TimelineElements click
                this.$sceneArea.on('click', '.area', function(e){
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
                    self.$sceneArea.find('.area.selected').removeClass('selected');
                });

                // on TimelineElements updated
                dispatcher.on(dispatcher.elementUpdated, function(e, elementModel) {
                    self.updateElement(elementModel);
                });

            },

            /**
             * Create or load scene
             * @param data
             * @returns {*}
             */
            create: function(data) {

                var self = this,
                    elementModel = null;

                _sceneModel = null;
                _sceneModel = new Scene();

                if(!data) {
                    dispatcher.trigger(dispatcher.sceneRendered);
                    TimelineController.resetTrack();
                    return _sceneModel;
                }

                // unserialize data

                _sceneModel.setId(data.id);
                _sceneModel.setName(data.name);

                // FIXME andrebbe ottimizzata con una bulk insert, al posto che molteplici inserimenti dei singoli elementi.
                for(var i in data.elements) {

                    elementModel = TimelineElementController.create(data.elements[i].type, data.elements[i]);

                    // add element to scene
                    this.loadElement(elementModel);

                    // add element to timeline
                    TimelineController.loadElement(elementModel);

                }

                // Attendo il render degli elementi (questa cosa non è elegantissima)
                var maxWaitingTime = 2000,
                    waitingTime = 0,
                    waitingInterval = 100,
                    renderWaiter = setInterval(function(){

                        if(self.$sceneArea.children().length === data.elements.length || waitingTime >= maxWaitingTime) {
                            TimelineController.resetTrack();
                            self.updateVisibleElements(0);
                            dispatcher.trigger(dispatcher.sceneRendered);
                            clearInterval(renderWaiter);
                            renderWaiter = null;
                            return;
                        }

                        waitingTime += waitingInterval;

                }, waitingInterval);


            },

            /**
             * Unloads current scene
             */
            unload: function() {
                _sceneModel = null;
                this.$sceneArea.empty();
            },

            /**
             * Return a scene element
             * @param id
             * @returns {*|{}}
             */
            getElement: function(id) {
                return this.$sceneArea.find('[data-id="' + id + '"]')
            },

            /**
             * Add element to scene
             * @param elementModel
             * @returns {*}
             */
            addElement: function(elementModel) {

                var elementModels = _sceneModel.getTimelineElementsAt(elementModel.getFrame());

                if(elementModel.getType() !== 'Video' && elementModel.getType() !== 'Video360') {
                    var areaIndex = elementModels.length > 0 ? elementModels.length+1 : 2;
                    elementModel.setZindex(areaIndex);
                }

                return this.loadElement(elementModel);

            },

            /**
             * load an element in the current scene
             * @param elementModel
             * @returns {*}
             */
            loadElement: function(elementModel) {

                // generate TimelineElement jQuery object
                var $element = TimelineElementController.render(elementModel);

                // adds new TimelineElement to current Scene model
                _sceneModel.addTimelineElement(elementModel);

                // append element view to DOM
                this.$sceneArea.append($element);

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

                if(elementType === 'Video' || elementType === 'Video360' || elementType === 'QuestionArea') {
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
                        containmentW = self.$sceneArea.width();
                        containmentH = self.$sceneArea.height();
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

                        containmentW = self.$sceneArea.width() * _zoom;
                        containmentH = self.$sceneArea.height() * _zoom;
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

                _sceneModel.removeTimelineElement(elementModel.getId());
            },


            /**
             * Returns elements appearing in the given frame
             */
            getVisibleElements: function(frame) {

                var elementModels = _sceneModel.getTimelineElementsAt(frame),
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

                if(!_sceneModel) return;

                var self = this,
                    $elements = this.getVisibleElements(frame),
                    elementApi,
                    elementModel,
                    i, l;

                console.log($elements);

                requestAnimationFrame(function() {

                    self.$sceneArea.find('.area').hide();
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
                return _sceneModel;
            },

            getSceneDefaults: function() {
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
            onResize: function() {

                var self = this,
                    timelineShown = true,
                    windowW,
                    windowH,
                    futureWidth,
                    futureHeight,
                    ratio;

                if(timelineShown) {
                    windowW = this.$sceneContainer.width();
                    windowH = this.$sceneContainer.height();
                } else {
                    windowW = window.innerWidth;
                    windowH = window.innerHeight;
                }

                // scene container size fixed to _sceneZoomFactor of window width
                _width = windowW * _sceneZoomFactor;
                _height = windowH * _sceneZoomFactor;

                // calc ratio
                ratio = windowW / windowH;

                if(ratio > _sceneRatio) {
                    // if viewport ratio greater than scene ratio, use height
                    _zoom = 1/_defaultHeight * _height;
                } else {
                    // otherwise, use width
                    _zoom = 1/_defaultWidth * _width;
                }

                // update Scene size
                requestAnimationFrame(function() {
                    self.$scene.css({'transform': 'scale(' + _zoom + ')'});
                });

            }

        };

        return SceneController;

    });