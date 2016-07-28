"use strict";

define([], function () {


    var TimelineElementController = function() {

        this.model = null;
        this.$el   = null;
        this.hasPausedMovie = false;

    };

    TimelineElementController.prototype = {

        setModel: function (model) {
            this.model = model;
        },

        getModel: function () {
            return this.model;
        },

        setDomElement: function ($el) {
            this.$el = $el;
        },

        getDomElement: function () {
            return this.$el;
        },

        render:     function() {},
        onShow:     function() {},
        onHide:     function() {},
        onPlay:     function() {},
        onPause:    function() {},
        onSeek:     function() {}

    };


    return TimelineElementController;

});