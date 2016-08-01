"use strict";

define(["jquery"], function($) {

    /**
     * Event Dispatcher
     * Wraps jQuery custom events
     */
    return {

        movieLoadingStart: 'movieLoadingStart',
        movieLoadingError: 'movieLoadingError',
        movieLoaded: 'movieLoaded',
        movieRendered: 'movieRendered',
        movieUnloaded: 'movieUnloaded',
        movieEdited: 'movieEdited',         // on movie edited
        movieInfoEdited: 'movieInfoEdited', // on movie edit info
        movieStartSave: 'movieStartSave',
        movieSaved: 'movieSaved',
        movieFirstSave: 'movieFirstSave',

        elementAdded: 'elementAdded',
        elementRemoved: 'elementRemoved',
        elementUpdated: 'elementUpdated',
        elementResized: 'elementResized',
        elementDragged: 'elementDragged',
        elementUpdatedFrame: 'elementUpdatedFrame',

        elementSelected: 'elementSelected',
        elementsDeselected: 'elementsDeselected',

        videoUploaded: 'videoUploaded',

        status: {
            saving: 'saving',
            saved: 'saved'
        },


        /**
         *
         * @param event
         * @param callback
         */
        on: function(event, callback) {
            $(document).on(event + '.prmt', callback);
        },

        /**
         * @param arguments
         */
        trigger: function() {
            var args = Array.prototype.slice.call(arguments),
                eventName = args.splice(0, 1);
            //console.debug('Dispatcher: triggered ', arguments);
            $(document).trigger(eventName + '.prmt', args);
        }

    };

});