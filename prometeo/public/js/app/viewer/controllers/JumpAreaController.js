"use strict";

define([
    'controller/TimelineElementController',
    'model/JumpArea',
    'hbs!js/app/viewer/views/JumpArea',
    'hbs'

], function (TimelineElementController, JumpArea, JumpAreaTpl, hbs) {

    /**
     *
     * @returns {JumpAreaController}
     * @constructor
     */
    function JumpAreaController(objectModel) {

        TimelineElementController.call(this);

        this.model = new JumpArea();
        this.$el = null;
        this.playing = false;


        if(objectModel) {
            this.model.fromObject(objectModel);
        }

        // attach controller reference to model
        this.model.setApi(this);

        return this;
    }

    JumpAreaController.prototype = Object.create(TimelineElementController.prototype);
    JumpAreaController.prototype.constructor = JumpAreaController;

    /**
     * Render element
     * @override
     * @returns {*}
     */
    JumpAreaController.prototype.render = function() {

        var elementModelObject = this.model.toObject();
        this.$el = $(JumpAreaTpl(elementModelObject));

        return this.$el;
    };


    JumpAreaController.prototype.onShow = function() {
        this.$el.show();
    };

    JumpAreaController.prototype.onHide = function() {
        this.$el.detach();
        this.hasPausedMovie = false;
    };

    JumpAreaController.prototype.onPlay = function() {

    };

    JumpAreaController.prototype.onPause = function() {

    };

    JumpAreaController.prototype.seek = function() {

    };


    return JumpAreaController;

});