define([], function() {
    "use strict";

    /**
     *
     * @constructor
     */
    function Movie() {

        /**
         *
         * Model Attributes
         * @private
         */
        var _id = null,
            _name = '',
            _published = false,
            _duration = 0,
            _scenes = [];

        /**
         *
         * @returns {*}
         */
        this.getId = function () {
            return _id;
        };

        /**
         *
         * @param id
         */
        this.setId = function (id) {
            _id = id;
        };

        /**
         *
         * @returns {string}
         */
        this.getName = function () {
            return _name;
        };

        /**
         *
         * @param name
         */
        this.setName = function (name) {
            _name = name;
        };

        /**
         *
         * @returns {boolean}
         */
        this.isPublished = function () {
            return _published;
        };

        /**
         *
         * @param bool
         */
        this.setPublished = function (bool) {
            _published = bool;
        };

        /**
         *
         * @returns {number}
         */
        this.getDuration = function() {
            return _duration;
        };

        /**
         *
         * @param duration
         */
        this.setDuration = function(duration) {
            _duration = duration;
        };

        /**
         *
         * @param element
         * @returns {Number}
         */
        this.addScene = function (element) {
            return _scenes.push(element);
        };

        /**
         *
         * @param scene_id
         */
        this.removeScene = function (scene_id) {
            var element_index = _getSceneIndex(scene_id);

            if(element_index >= 0) {
                _scenes.splice(element_index, 1);
            }
        };


        /**
         * Get the first scene
         * @returns {*}
         */
        this.getFirstScene = function () {
            return _scenes[0] || null;
        };

        /**
         * Get a scene by id
         * @param scene_id
         * @returns {*}
         */
        this.getScene = function (scene_id) {
            var index = _getSceneIndex(scene_id);
            return _scenes[index];
        };

        /**
         * Returns all timeline scenes
         * @returns {Array}
         */
        this.getScenes = function() {
            return _scenes;
        };

        /**
         *
         * @param scene_id
         * @returns {*}
         * @private
         */
        var _getSceneIndex = function (scene_id) {

            for(var i = 0; i < _scenes.length; i++) {
                if(_scenes[i].getId() == scene_id) {
                    return i;
                }
            }

            return false;
        };

        /**
         * Calculates movie duration
         * @returns {number}
         * @private
         */
        var _calculateDuration = function() {

            var maxFrame = 0,
                currentElFrame;

            // get last element appearing in the movie
            for(var i = 0; i < _scenes.length; i++) {
                currentElFrame = _scenes[i].getDuration();
                if(currentElFrame > maxFrame) {
                    maxFrame = currentElFrame;
                }
            }

            return maxFrame;
        };

        /**
         * Return Movie model object
         *
         * @returns {{id: *, name: string, scenes: Array}}
         */
        this.toObject = function(){

            return {
                "id" : this.getId(),
                "name" : this.getName(),
                "published" : this.isPublished(),
                "duration" : _calculateDuration(),
                "scenes" : _scenes.map(function(el){ return el.toObject(); })
            }
        };

        /**
         * Return Movie model serialized object
         * This function is used to save Movie model via xhr
         *
         * @returns {{id: *, name: string, scenes: Array}}
         */
        this.serialize = function(){

            var obj = {
                "id" : this.getId(),
                "name" : this.getName(),
                "published" : this.isPublished(),
                "duration" : _calculateDuration(),
                "scenes" : _scenes.map(function(el){ return el.serialize(); })
            };

            return obj;
        };


    }

    /**
     * Export module
     */
    return Movie;
});