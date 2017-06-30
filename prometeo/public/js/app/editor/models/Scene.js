define([], function() {
    "use strict";

    /**
     *
     * @constructor
     */
    function Scene() {

        /**
         *
         * Model Attributes
         * @private
         */
        var _id = null,
            _name = '',
            _duration = 0,
            _video = null,
            _timelineElements = [];

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
         * @returns {string}
         */
        this.getVideo = function () {
            return _video;
        };

        /**
         *
         * @param video
         */
        this.setVideo = function (video) {
            _video = video;
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
        this.addTimelineElement = function (element) {
            return _timelineElements.push(element);
        };

        /**
         *
         * @param element_id
         */
        this.removeTimelineElement = function (element_id) {
            var element_index = _getTimelineElementIndex(element_id);

            if(element_index >= 0) {
                _timelineElements.splice(element_index, 1);
            }
        };


        /**
         * Returns TimelineElements matching given frame
         * @param frame
         * @returns {Array}
         */
        this.getTimelineElementsAt = function (frame) {

            var i = 0,
                l = _timelineElements.length,
                elements = [];

            for( ; i < l; i++) {

                if(_timelineElements[i].getFrame() <= frame && frame <= _timelineElements[i].getEndFrame()) {
                    elements[elements.length] = _timelineElements[i];
                }

            }

            return elements;
        };

        /**
         * Get an element by id
         * @param element_id
         * @returns {*}
         */
        this.getElement = function (element_id) {
            var index = _getTimelineElementIndex(element_id);
            return _timelineElements[index];
        };

        /**
         * Returns all timeline elements
         * @returns {Array}
         */
        this.getElements = function() {
            return _timelineElements;
        };

        /**
         *
         * @param element_id
         * @returns {*}
         * @private
         */
        var _getTimelineElementIndex = function (element_id) {

            for(var i = 0; i < _timelineElements.length; i++) {
                if(_timelineElements[i].getId() === element_id) {
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
            for(var i = 0; i < _timelineElements.length; i++) {
                currentElFrame = _timelineElements[i].getEndFrame();
                if(currentElFrame > maxFrame) {
                    maxFrame = currentElFrame;
                }
            }

            return maxFrame;
        };

        /**
         * Return Movie model object
         *
         * @returns {{id: *, name: string, elements: Array}}
         */
        this.toObject = function(){

            return {
                "id" : this.getId(),
                "name" : this.getName(),
                "duration" : this.getDuration(),
                "video" : this.getVideo(),
                "elements" : _timelineElements
            }
        };

        /**
         * Populate model from model object
         * @param objectModel
         */
        this.fromObject = function(objectModel) {
            var self = this;

            this.setId(objectModel.id);
            this.setName(objectModel.name);
            this.setDuration(objectModel.duration);
            this.setVideo(objectModel.video);

            // timeline elements are added by MovieController.create()

            return this;
        };

        /**
         * Return Movie model serialized object
         * This function is used to save Movie model via xhr
         *
         * @returns {{id: *, name: string, elements: Array}}
         */
        this.serialize = function(){

            var obj = {
                "id" : this.getId(),
                "name" : this.getName(),
                "video" : this.getVideo(),
                "duration" : this.getDuration(),
                "elements" : _timelineElements.map(function(el){ return el.toObject(); })
            };

            return obj;
        };


    }

    /**
     * Export module
     */
    return Scene;
});