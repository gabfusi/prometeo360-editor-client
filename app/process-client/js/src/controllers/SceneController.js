"use strict";

define([
        'jquery',
        'dispatcher',
        'model/Scene',
        "lib/notifications",
        'hbs!../../js/src/views/Scene',
        'hbs'
    ],

    function ($, dispatcher, Scene, notification, SceneTpl) {

        var _movieModel;
        var MovieController = null;

        /**
         * SceneController Controller
         */
        var SceneController = {


            /**
             *
             * @param movieModel
             */
            init: function (movieModel) {
                var self = this;
                _movieModel = movieModel;
                this.$wrap = $('#scene_panel');
                this.$container = this.$wrap.find('>.panel');
                this.$sceneFilename = this.$container.find('#scene_filename');
                MovieController = require('controller/MovieController');

                // on scene loaded

                dispatcher.on(dispatcher.sceneLoaded, function() {
                    self.load(MovieController.getCurrentScene());
                });

                // on edit scene

                this.$container.on('change', '#scene_name', function() {
                    var scene = MovieController.getCurrentScene();
                    scene.setName($.trim($(this).val()));

                    dispatcher.trigger(dispatcher.sceneEdited, scene);
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                dispatcher.on(dispatcher.videoUploaded, function(e, filename, duration) {
                    var scene = MovieController.getCurrentScene();
                    scene.setVideo(filename);
                    scene.setDuration(duration);

                    self.$sceneFilename.val(filename);

                    dispatcher.trigger(dispatcher.sceneVideoChanged, scene);
                    dispatcher.trigger(dispatcher.sceneEdited, scene);
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                $('.movie-wrapper').on('click', function() {
                    if(self.$wrap.hasClass('active')) {
                      self.edit();
                    }
                });

            },

            /**
             *
             * @param sceneModel
             */
            load: function(sceneModel) {
                var html = SceneTpl(sceneModel.toObject());
                console.log('Loading scene', sceneModel);
                this.$container.html(html);
            },

            /**
             *
             */
            create: function() {

                notification.prompt(
                    "Nuova scena",
                    "Dai un nome alla nuova scena",
                    function(scene_name) {

                        var scene = new Scene();
                        var scene_id = 1 + Math.max.apply(Math, _movieModel.getScenes().map(function(o){ return o.getId() })); // autoincrement
                        scene.setId(scene_id);
                        scene.setName(scene_name);
                        _movieModel.addScene(scene);

                        dispatcher.trigger(dispatcher.sceneChange, scene);
                        dispatcher.trigger(dispatcher.sceneAdded, scene);
                        dispatcher.trigger(dispatcher.movieEdited);

                    });

            },

            /**
             *
             * @param scene
             * @returns {boolean}
             */
            delete: function(scene) {

                var scenes = _movieModel.getScenes().length;
                if(scenes === 1) {
                    return false;
                }

                notification.confirm(
                    "Rimuovi scena",
                    "Sei sicuro di voler eliminare la scena corrente?",
                    function() {

                        _movieModel.removeScene(scene.getId());

                        dispatcher.trigger(dispatcher.sceneRemoved, scene);
                        dispatcher.trigger(dispatcher.movieEdited);

                    });
            },

            /**
             *
             */
            edit: function() {
                this.$wrap.toggleClass('active');
            },

            /**
             *
             * @returns {*|Array}
             */
            getScenes: function() {
                return _movieModel.getScenes();
            }
        };

        return SceneController;

    });