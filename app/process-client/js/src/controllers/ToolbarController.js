"use strict";

define([
        "jquery",
        "lib/notifications",
        "controller/MovieController"
],

    function($, notification, MovieController) {

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