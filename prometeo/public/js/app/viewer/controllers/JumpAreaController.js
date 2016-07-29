"use strict";

define([
    'dispatcher',
    'controller/TimelineElementController',
    'model/JumpArea',
    'hbs!js/app/viewer/views/JumpArea',
    'hbs'

], function (dispatcher, TimelineElementController, JumpArea, JumpAreaTpl, hbs) {

    /**
     *
     * @returns {JumpAreaController}
     * @constructor
     */
    function JumpAreaController(objectModel) {

        TimelineElementController.call(this);

        this.model = new JumpArea();
        this.$el = null;


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

    /**
     * Attach listeners
     */
    JumpAreaController.prototype.attachListeners = function () {
        var self = this;

       // on skip
        this.$el.on('click', 'a', function (e) {
            e.preventDefault();

            var destinationFrame = self.model.getJumpToFrame();
            dispatcher.trigger(dispatcher.doMovieSeekAndPlay, destinationFrame);

        });

    };

    /**
     * Detach listeners
     */
    JumpAreaController.prototype.detachListeners = function () {
        $(this.$el).off('submit', 'form');
    };

    /**
     * On element show
     */
    JumpAreaController.prototype.onShow = function () {
        this.$el[0].style.display = 'block';
        this.detachListeners();
        this.attachListeners();
    };

    /**
     * On element hide
     */
    JumpAreaController.prototype.onHide = function () {
        this.$el.detach();
        this.detachListeners();
        this.hasPausedMovie = false;
    };


    return JumpAreaController;

});