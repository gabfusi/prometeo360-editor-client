"use strict";

define([
    'controller/TimelineElementController',
    'model/TextArea',
    'hbs!js/app/viewer/views/TextArea',
    'hbs'

], function (TimelineElementController, TextArea, TextAreaTpl, hbs) {

    /**
     *
     * @returns {TextAreaController}
     * @constructor
     */
    function TextAreaController(objectModel) {

        TimelineElementController.call(this);

        this.model = new TextArea();
        this.$el = null;
        this.playing = false;


        if(objectModel) {
            this.model.fromObject(objectModel);
        }

        // attach controller reference to model
        this.model.setApi(this);

        return this;
    }

    TextAreaController.prototype = Object.create(TimelineElementController.prototype);
    TextAreaController.prototype.constructor = TextAreaController;

    /**
     * Render element
     * @override
     * @returns {*}
     */
    TextAreaController.prototype.render = function() {

        var elementModelObject = this.model.toObject();
        this.$el = $(TextAreaTpl(elementModelObject));

        return this.$el;
    };


    TextAreaController.prototype.onShow = function() {
        this.$el.show();
    };

    TextAreaController.prototype.onHide = function() {
        this.$el.detach();
        this.hasPausedMovie = false;
    };

    return TextAreaController;

});