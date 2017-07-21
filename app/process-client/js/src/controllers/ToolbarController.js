"use strict";

define([
        "jquery",
        "dispatcher",
        "lib/notifications",
        "controller/MovieController"
],

    function($, dispatcher, notification, MovieController) {

    // Toolbar Controller
    var ToolbarController = {

        /**
         * Initialize toolbar listeners
         * @param $toolbarElement
         */
        init: function($toolbarElement) {
            var self = this;

            this.$toolbar = $toolbarElement;

            this.$toolbar.on('click', 'li', function(e) {
                var elementType = $(this).data('type');

                if(elementType === 'InteractiveArea') {

                    if($(this).hasClass('active')) {
                        $(this).removeClass('active');
                        MovieController.vrController.deactivateShapeTool();
                    } else {
                        $(this).addClass('active');
                        MovieController.vrController.activateShapeTool();
                    }
                }

            });

            dispatcher.on(dispatcher.shapeDrawn, function() {
                self.$toolbar.find('li').removeClass('active');
                MovieController.vrController.deactivateShapeTool();
            });


        },

        /**
        * Show toolbar panel
        */
        showPanel: function(){
            this.$toolbar.addClass('shown');
        },

        /**
         * Hide toolbar panel
         */
        hidePanel: function(){
            this.$toolbar.removeClass('shown');
        },

        /**
         * Toggle toolbar panel visibility
         */
        togglePanel: function(){
            this.$toolbar.toggleClass('shown');
        }

    };

    return ToolbarController;

});