"use strict";

define([
        'jquery',
        "config",
        "dispatcher",
        'model/InteractiveArea'
    ],

    function ($, config, dispatcher, InteractiveArea) {


        var InteractiveAreaController = {

            /**
             * Adds listeners for keyframes creation/deletion
             */
            init: function () {
                var self = this;

                dispatcher.on(dispatcher.elementAddedKeyframe, function (e, elementModel, frame) {
                    self.addKeyframe(elementModel, frame);
                });

                dispatcher.on(dispatcher.elementRemovedKeyframe, function (e, elementModel, frame) {
                    self.removeKeyframe(elementModel, frame);
                });

            },

            /**
             * Creates an interactive area model from an object
             * @param objectModel
             * @returns {*}
             */
            create: function (objectModel) {

                var model = new InteractiveArea();

                if (objectModel) {
                    model.fromObject(objectModel);
                }

                return model;
            },

            /**
             * Creates an interactive area from a shape (shape comes from VRView)
             * @param shape
             * @param currentFrame
             * @returns {*}
             */
            createFromShape: function (shape, currentFrame) {

                var model = new InteractiveArea();
                model.setId(shape.id);
                model.setFrame(currentFrame);
                model.setDuration(2 * 1000);
                model.setBackground('#ffffff');
                model.setBackgroundOpacity(0.6);
                model.addKeyframe(0, shape.vertices); // keyframe is relative to element

                return model;
            },

            /**
             * Add a keyframe to an interactive area model
             * @param model
             * @param relativeFrame
             * @returns {boolean}
             */
            addKeyframe: function (model, relativeFrame) {

                var keyframes = model.getKeyframes(),
                    frame = model.getFrame() + relativeFrame,
                    shape;

                if (typeof keyframes[relativeFrame] !== 'undefined') {
                    return false; // existing keyframe
                }


                shape = this.getShapeAt(model, frame);

                model.addKeyframe(relativeFrame, shape.vertices.slice());

                dispatcher.trigger(dispatcher.elementUpdated, model);

            },

            /**
             * Removes a keyframe from an interactive area model
             * @param model
             * @param frame
             * @returns {boolean}
             */
            removeKeyframe: function (model, frame) {

                var keyframes = model.getKeyframes();

                if (typeof keyframes[frame] === 'undefined') {
                    console.warn('keyframe not found!', frame, keyframes[frame])
                    return false; // existing keyframe
                }

                model.removeKeyframe(frame);

                dispatcher.trigger(dispatcher.elementUpdated, model);

            },

            /**
             * Update shape vertices at a specified frame
             * If the specified frame is not a keyframe,
             * updates the shape at the frame's previous keyframe
             * @param model
             * @param frame
             * @param vertices
             */
            updateAt: function (model, frame, vertices) {

                var shape = this.getShapeAt(model, frame);

                console.log('Updating shape at ', shape.frame, ' cos was choosen frame', frame);

                if (shape.vertices) {
                    shape.vertices.length = 0;
                    shape.vertices = vertices;
                } else {
                    console.warn('Cannot get shape at frame ' + frame);
                }

                return shape.frame;

            },

            /**
             * Returns the shape that correspond to a specific frame
             * if frame passed isn't a keyframe returns the shape at the frame's previous keyframe
             * @param model
             * @param frame
             * @returns {boolean}
             */
            getShapeAt: function (model, frame) {

                // get last keyframe
                var keyframes = model.getKeyframes();
                var relativeFrame = frame - model.getFrame();
                var keyframesArray = Object.keys(keyframes)
                    .map(function (o) {
                        return parseFloat(o)
                    })
                    .sort(function (a, b) {
                        return a - b;
                    });

                if (relativeFrame > model.getDuration()) {
                    return false;
                }

                if (typeof keyframes[relativeFrame] !== 'undefined') {
                    return keyframes[relativeFrame];
                }

                if (keyframesArray.length < 2) {
                    return keyframes[keyframesArray[0]];
                }

                for (var i = 0; i < keyframesArray.length - 1; i++) {
                    if (keyframesArray[i] < relativeFrame && relativeFrame < keyframesArray[i + 1]) {
                        return keyframes[keyframesArray[i]];
                    }
                }

                if (relativeFrame > keyframesArray[keyframesArray.length - 1]) {
                    console.log(relativeFrame, keyframesArray)
                    return keyframes[keyframesArray[keyframesArray.length - 1]]; // last keyframe
                }

                return false;

            }

        };

        return InteractiveAreaController;

    });