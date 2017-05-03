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

        var remote = window.nodeRequire('electron').remote;
        var Menu = remote.Menu;
        var MenuItem = remote.MenuItem;

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
                        dispatcher.trigger(dispatcher.elementUpdatedInfo, elementModel);
                    },

                    onElementRightClick: function(elementModel) {
                        var menuAdd = new Menu();
                        var menuItemAdd = new MenuItem({
                            label: 'Inserisci keyframe',
                            click: function() {
                                var relativeFrame = self.getCurrentFrame() - elementModel.getFrame();
                                self.addElementKeyframe(elementModel, relativeFrame);
                            }
                        });
                        menuAdd.append(menuItemAdd);
                        menuAdd.popup(remote.getCurrentWindow());
                    },

                    onKeyframeAdded: function(elementModel, frame) {
                        dispatcher.trigger(dispatcher.elementAddedKeyframe, elementModel, frame);
                    },

                    onKeyframeSelected: function(elementModel, frame) {
                        var menuRemove = new Menu();
                        var menuItemRemove = new MenuItem({
                            label: 'Rimuovi keyframe',
                            click: function() {
                                self.removeElementKeyframe(elementModel, frame);
                                console.log('TODO Rimuovi keyframe at', frame, ' on element', elementModel)
                            }
                        });
                        menuRemove.append(menuItemRemove);
                        menuRemove.popup(remote.getCurrentWindow());
                    },

                    onKeyframeRemoved: function(elementModel, frame) {
                        dispatcher.trigger(dispatcher.elementRemovedKeyframe, elementModel, frame);
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

            addElementKeyframe: function (elementModel, frame) {

                var $el = _timeline.addKeyframe(elementModel.getId(), frame);

                _timeline.selectElement($el);

            },

            removeElementKeyframe: function (elementModel, frame) {

                var $el = _timeline.removeKeyframe(elementModel.getId(), frame);

            },

            isDragging: function() {
                return _timeline.isDragging;
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

            updateTrack: function(seconds) {
                var data = _timeline.updateTrackPosition(seconds, true);
                this.currentFrame = data.frame;
                this.$currentFrame.text(data.formattedFrame);
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