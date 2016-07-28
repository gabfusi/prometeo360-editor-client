"use strict";

define([
    'controller/TimelineElementController',
    'model/LinkArea',
    'hbs!js/app/viewer/views/LinkArea',
    'hbs'

], function (TimelineElementController, LinkArea, LinkAreaTpl, hbs) {

    /**
     *
     * @returns {LinkAreaController}
     * @constructor
     */
    function LinkAreaController(objectModel) {

        TimelineElementController.call(this);

        this.model = new LinkArea();
        this.$el = null;
        this.playing = false;


        if(objectModel) {
            this.model.fromObject(objectModel);
        }

        // attach controller reference to model
        this.model.setApi(this);

        return this;
    }

    LinkAreaController.prototype = Object.create(TimelineElementController.prototype);
    LinkAreaController.prototype.constructor = LinkAreaController;

    /**
     * Render element
     * @override
     * @returns {*}
     */
    LinkAreaController.prototype.render = function() {

        var elementModelObject = this.model.toObject();
        this.$el = $(LinkAreaTpl(elementModelObject));

        return this.$el;
    };


    LinkAreaController.prototype.onShow = function() {
        this.$el.show();
    };

    LinkAreaController.prototype.onHide = function() {
        this.$el.detach();
        this.hasPausedMovie = false;
    };

    LinkAreaController.prototype.onPlay = function() {

    };

    LinkAreaController.prototype.onPause = function() {

    };

    LinkAreaController.prototype.seek = function() {

    };


    return LinkAreaController;

});