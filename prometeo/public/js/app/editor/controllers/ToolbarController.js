"use strict";

define([
        "jquery",
        "lib/notifications",
        "controller/MovieController",
        "controller/TimelineElementController",
        "controller/TimelineController"
],

    function($, notification, MovieController, TimelineElementController, TimelineController) {

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
                self.addElement($(this).data('type'));
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
        },


        /**
         * Adds a new TimelineElement to current Movie
         * @param elementType
         */
        addElement: function(elementType) {
            var elementModel,
                $element,
                movieDefaults = MovieController.getMovieDefaults();

            // check if element can be created
            if(!this.canAddElement(elementType)) {
                return;
            }

            // creates a new TimelineElement model
            elementModel = TimelineElementController.create(elementType);

            switch(elementType) {

                case 'Video':
                    elementModel.setDuration('00:00:02.000');
                    break;

                case 'Video360':
                    elementModel.setDuration('00:00:02.000');
                    break;

                default:

                    var defaultWidth = 200,
                        defaultHeight = 200,
                        defaultBg = '#ccc',
                        defaultColor = '#000',
                        defaultText = 'Clicca per modificare il testo';

                    // minimal element style
                    elementModel.setDuration('00:00:02.000');
                    elementModel.setX(movieDefaults.centerX - defaultWidth/2);
                    elementModel.setY(movieDefaults.centerY - defaultHeight/2);
                    elementModel.setWidth(defaultWidth);
                    elementModel.setHeight(defaultHeight);
                    elementModel.setBackground(defaultBg);
                    if(typeof elementModel.setTextColor !== 'undefined') {
                        elementModel.setTextColor(defaultColor);
                    }
                    if(typeof elementModel.setText !== 'undefined') {
                        elementModel.setText(defaultText);
                    }

            }

            elementModel.setFrame(null);

            // add element to movie
            MovieController.addElement(elementModel);

            // add element to timeline
            TimelineController.addElement(elementModel);

        },

        /**
         * Check if an element can be added in the current frame
         * @param elementType
         * @returns {boolean}
         */
        canAddElement: function(elementType) {
            var canAdd = true;
            var $elements = MovieController.getVisibleElements(TimelineController.getCurrentFrame());
            var i;

            if(elementType === 'Video' || elementType === 'Video360') {
                // I can't overlap 2 videos

                for(i = 0; i < $elements.length; i++) {
                    if($elements[i].data('model').getType() === 'Video') {
                        notification.error('Non puoi inserire due Video nella stessa posizione.');
                        return false;
                    }
                }
            }

            if(elementType === 'QuestionArea') {

                for(i = 0; i < $elements.length; i++) {
                    if($elements[i].data('model').getType() === 'QuestionArea') {
                        notification.error('Non puoi inserire due Domande nella stessa posizione.');
                        return false;
                    }
                }

            }

            return canAdd;

        }

    };

    return ToolbarController;

});