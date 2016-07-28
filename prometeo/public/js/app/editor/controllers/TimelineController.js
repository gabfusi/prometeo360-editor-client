"use strict";

define([
        "require",
        "jquery",
        "dispatcher",
        "lib/utilities",
        "lib/timeline",
        "controller/MovieController"
],

    function(require, $, dispatcher, utilities, Timeline) {


        var _timeline = null;

        var MovieController = null;

        // Timeline Controller
        var TimelineController = {


            /**
             * Initialize timeline listeners
             * @param $timelineElement
             */
            init: function($timelineElement) {
                var self = this;

                MovieController = require('controller/MovieController');

                this.$timelineWrap = $timelineElement;
                this.$currentFrame = $timelineElement.find('.current-frame');
                this.$timeline = $timelineElement.find('#timeline');
                this.currentFrame = 0;

                _timeline = new Timeline(this.$timeline, {
                    duration : 60*60, // 1h
                    secondsWidth: 30,
                    rulersStep: 10,

                    // on element added
                    onAdd: function(elementModel, frame) {
                        elementModel.setFrame(frame);
                        dispatcher.trigger(dispatcher.elementAdded, elementModel, this);
                    },

                    // on element selected
                    onSelect: function(elementModel) {
                        dispatcher.trigger(dispatcher.elementSelected, elementModel, this);
                    },

                    onDeselect: function() {
                        dispatcher.trigger(dispatcher.elementsDeselected);
                    },

                    // on start track move
                    onStartTrackMove: function(){},

                    // on track moved
                    onTrackMove: function(formattedFrame, frame) {
                        self.currentFrame = frame;
                        self.$currentFrame.text(formattedFrame);
                        utilities.debounce(function(){
                            MovieController.updateVisibleElements(frame);
                        }, 200)();
                    },

                    onElementDragged: function(elementModel, frame) {
                        dispatcher.trigger(dispatcher.elementUpdatedFrame, elementModel, frame);
                    },

                    onElementStopDrag: function(elementModel, frame) {
                        MovieController.updateVisibleElements(self.getCurrentFrame());
                    }
                });

                this.resetTrack();

                this.initListeners();
            },

            /**
             * Binds event listeners
             */
            initListeners: function() {
                var self = this;

                // on TimelineElement selected
                dispatcher.on(dispatcher.elementSelected, function (e, elementModel) {
                    _timeline.select(elementModel.getId());
                });

                // on TimelineElements deselected
                dispatcher.on(dispatcher.elementsDeselected, function (e) {
                    _timeline.unselectElements();
                });

                // on TimelineElement updated
                dispatcher.on(dispatcher.elementUpdated, function (e, elementModel) {
                    _timeline.update(elementModel.getId(), elementModel.getType(), elementModel.getFrame(), elementModel.getDuration(), elementModel.getZindex(), elementModel);
                });

                // on TimelineElement deleted
                dispatcher.on(dispatcher.elementRemoved, function (e, elementModel) {
                    _timeline.remove(elementModel.getId());
                });

            },

            /**
             * Adds a new TimelineElement to current Movie
             * @param elementModel
             */
            addElement: function(elementModel) {

                var $el = _timeline.add(
                    elementModel.getId(),
                    elementModel.getType(),
                    elementModel.getFrame(),
                    elementModel.getDuration(),
                    elementModel.getZindex(),
                    elementModel
                );

                _timeline.selectElement($el);
            },

            /**
             * load an element in the timeline
             * @param elementModel
             */
            loadElement: function(elementModel) {

                _timeline.add(
                    elementModel.getId(),
                    elementModel.getType(),
                    elementModel.getFrame(),
                    elementModel.getDuration(),
                    elementModel.getZindex(),
                    elementModel,
                    true
                );

            },

            /**
             * Unloads current elements in timeline
             */
            unload: function() {
                _timeline.reset();
            },

            /**
             * Reset Track
             */
            resetTrack: function() {
                _timeline.setTrackPosition(0, true);
            },

            /**
             * Return current frame
             * @returns {number|*}
             */
            getCurrentFrame: function() {
                return this.currentFrame;
            }

        };

        return TimelineController;

});