"use strict";

define(["jquery"], function($) {

    /**
     * Event Dispatcher
     * Wraps jQuery custom events
     */
    return {

        // internal events
        sceneLoadingStart: 'sceneLoadingStart',
        sceneLoadingError: 'sceneLoadingError',
        sceneLoaded: 'sceneLoaded',
        sceneRendered: 'sceneRendered',
        sceneChange: 'sceneChange',
        sceneAdded: 'sceneAdded',
        sceneEdited: 'sceneEdited',
        sceneRemoved: 'sceneRemoved',
        sceneVideoChanged: 'sceneVideoChanged',

        movieLoaded: 'movieLoaded',
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
        elementUpdatedInfo: 'elementUpdatedInfo',
        elementAddedKeyframe: 'elementAddedKeyframe',
        elementRemovedKeyframe: 'elementRemovedKeyframe',

        elementSelected: 'elementSelected',
        elementsDeselected: 'elementsDeselected',

        videoUploaded: 'videoUploaded',

        // ipc events
        apiMovieListResponse: 'apiMovieListResponse',
        apiMovieGetResponse: 'apiMovieGetResponse',
        apiMovieAddResponse: 'apiMovieAddResponse',
        apiMovieUpdateResponse: 'apiMovieUpdateResponse',
        apiMovieDeleteResponse: 'apiMovieDeleteResponse',
        apiMoviePublishResponse: 'apiMoviePublishResponse',
        apiMovieUnpublishResponse: 'apiMovieUnpublishResponse',
        apiVideoListResponse: 'apiVideoListResponse',
        apiVideoUploadResponse: 'apiVideoUploadResponse',
      apiVideoUploadedRemoteResponse: 'apiVideoUploadedRemoteResponse',

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