"use strict";

define([
        'jquery',
        'dispatcher',
        'model/Scene',
        "lib/notifications"
    ],

    function ($, dispatcher, Scene, notification) {

        var _movieModel;

        /**
         * SceneController Controller
         */
        var SceneController = {


            init: function (movieModel) {
                _movieModel = movieModel;
            },

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

            edit: function(scene) {
                console.warn('TODO edit (rename)', scene);

                notification.prompt(
                    "Rinomina scena",
                    "Modifica il nome della scena corrente",
                    function(scene_name) {

                        scene.setName(scene_name);

                        dispatcher.trigger(dispatcher.sceneEdited, scene);
                        dispatcher.trigger(dispatcher.movieEdited);

                    });
            },

            getScenes: function() {
                return _movieModel.getScenes();
            }



        };

        return SceneController;

    });