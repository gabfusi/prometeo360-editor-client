"use strict";

define([
        'jquery',
        'dispatcher',
        'model/Movie',
        'model/Scene',
        "controller/VRViewController",
        "controller/TimelineController",
        "controller/InteractiveAreaController",
        'jqueryui/resizable',
        'jqueryui/draggable'
    ],

    function($, dispatcher, Movie, Scene, VRViewController, TimelineController, InteractiveAreaController) {

        var _movieModel,
            _currentSceneModel,
            _defaultWidth = 960,// default video aspect ratio -> 2:1
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
                this.vrController = VRViewController;
                VRViewController.init(this);
                InteractiveAreaController.init();

                this.initListeners();
                this.onResize(); // init zoom, width, height
            },


            initListeners: function(){
                var self = this;

                // on movie start loading
                dispatcher.on(dispatcher.sceneLoadingStart, function() {
                    self.$movieArea.hide();
                    console.debug('movie loading start');
                });

                // on movie loaded
                dispatcher.on(dispatcher.sceneRendered, function() {
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
                    console.log(elementModel.getId());
                });

                // on TimelineElements deselected
                dispatcher.on(dispatcher.elementsDeselected, function() {
                    self.$movieArea.find('.area.selected').removeClass('selected');
                });

                // on TimelineElements updated
                dispatcher.on(dispatcher.elementUpdated, function(e, elementModel) {
                    // self.updateElement(elementModel);
                });

                // on Scene change intent
                dispatcher.on(dispatcher.sceneChange, function(e, scene) {
                    self.changeScene(scene);
                });

                dispatcher.on(dispatcher.sceneVideoChanged, function(e, scene) {
                    self.changeScene(scene);
                });

            },

            /**
             * Create or load movie
             * @param data
             * @returns {*}
             */
            create: function(data) {
                var sceneModel,
                    elementModel;

                _movieModel = null;
                _movieModel = new Movie();

                if(!data) {
                    var emptyScene = new Scene();
                    emptyScene.setId(1);
                    emptyScene.setName('Scena ' + emptyScene.getId());
                    _movieModel.addScene(emptyScene);

                    this.loadScene(_movieModel.getFirstScene());
                    dispatcher.trigger(dispatcher.sceneRendered);
                    TimelineController.resetTrack();
                    return _movieModel;
                }

                // unserialize data

                _movieModel.setId(data.id);
                _movieModel.setName(data.name);
                _movieModel.setPublished(data.published);

                for(var i = 0; i < data.scenes.length; i++) {

                    // create scene model
                    sceneModel = (new Scene()).fromObject(data.scenes[i]);

                    // create and add scene items models to scene
                    if(data.scenes[i].elements && data.scenes[i].elements.length) {
                        for(var j = 0, l = data.scenes[i].elements.length; j < l; j++) {
                            elementModel = InteractiveAreaController.create(data.scenes[i].elements[j]);
                            sceneModel.addTimelineElement(elementModel);
                        }
                    }

                    // add a scene to movie
                    _movieModel.addScene(sceneModel);
                }

                this.loadScene(_movieModel.getFirstScene());
            },

            /**
             * Unloads current movie
             */
            unload: function() {
                _movieModel = null;
                this.$movieArea.empty();
            },

            /**
             * Render a scene and set it as current
             */
            loadScene: function(scene) {
                var self = this;
                var elementModel;
                var elements;

                if(!scene) {
                    return false;
                }

                _currentSceneModel = scene;
                elements = scene.getElements();

                VRViewController.loadScene(scene);

                if(!elements.length) {
                    dispatcher.trigger(dispatcher.sceneLoaded);
                    dispatcher.trigger(dispatcher.sceneRendered);
                    return false;
                }

                for(var i in elements) {
                    elementModel = elements[i];

                    // add element to timeline
                    TimelineController.loadElement(elementModel);
                }

                dispatcher.trigger(dispatcher.sceneLoaded);

                TimelineController.resetTrack();
                self.updateVisibleElements(0);
                dispatcher.trigger(dispatcher.sceneRendered);

            },

            changeScene: function(scene) {

                this.$movieArea.empty();
                TimelineController.unload();
                TimelineController.resetTrack();

                this.loadScene(scene);
                dispatcher.trigger(dispatcher.sceneRendered);

            },

            /**
             * Add element to movie
             * @param elementModel
             * @returns {*}
             */
            addElement: function(elementModel) {

                // adds new TimelineElement to current Movie model
                _currentSceneModel.addTimelineElement(elementModel);
            },

            /**
             * Remove an element
             * @param elementModel
             */
            removeElement: function(elementModel) {

                _currentSceneModel.removeTimelineElement(elementModel.getId());
                VRViewController.removeShape(elementModel.getId());

                dispatcher.trigger(dispatcher.elementRemoved, elementModel);
            },

            /**
             *
             * @returns {*|Array}
             */
            getElements: function() {
                return _currentSceneModel.getElements();
            },


            /**
             * Returns elements appearing in the given frame
             */
            getVisibleElements: function(frame) {

                return _currentSceneModel.getTimelineElementsAt(frame);
            },

            /**
             * Show or hide TimelineElements appearing in the given frame
             * @param frame
             */
            updateVisibleElements: function(frame) {

                if(!_movieModel || !_currentSceneModel) return;

                this.vrController.seek(frame);

                return;

                var self = this,
                    $elements = this.getVisibleElements(frame),
                    elementApi,
                    elementModel,
                    i, l;

                //console.log($elements);

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

            getCurrentScene: function() {
              return _currentSceneModel;
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