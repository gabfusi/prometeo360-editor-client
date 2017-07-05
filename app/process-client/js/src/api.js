"use strict";

define([
    "jquery",
    "config",
    "dispatcher"
], function ($, config, dispatcher) {

    var endpoint = config.api;
    var ipc = nodeRequire("node-ipc");

    ipc.config.id = 'client';
    ipc.config.retry = 1000;
    ipc.config.silent = true;

    ipc.connectTo(
        'server',
        function () {

            ipc.of.server.on(
                'connect',
                function () {
                    ipc.log('## connected to world ##', ipc.config.delay);
                }
            );

            ipc.of.server.on(
                'disconnect',
                function () {
                    ipc.log('disconnected from world');
                }
            );

            ipc.of.server.on(
                'movies.list',
                function (data) {
                    console.info("retrieved movies.list")
                    dispatcher.trigger(dispatcher.apiMovieListResponse, data.message);
                }
            );

            ipc.of.server.on(
                'movies.get',
                function (data) {
                    console.info("retrieved movies.get")
                    dispatcher.trigger(dispatcher.apiMovieGetResponse, data.message);
                }
            );

            ipc.of.server.on(
                'movies.add',
                function (data) {
                    console.info("retrieved movies.add")
                    dispatcher.trigger(dispatcher.apiMovieAddResponse, data.message);
                }
            );

            ipc.of.server.on(
                'movies.update',
                function (data) {
                    console.info("retrieved movies.update")
                    dispatcher.trigger(dispatcher.apiMovieUpdateResponse, data.message);
                }
            );

            ipc.of.server.on(
                'movies.delete',
                function (data) {
                    console.info("retrieved movies.delete")
                    dispatcher.trigger(dispatcher.apiMovieDeleteResponse, data.message);
                }
            );

            ipc.of.server.on(
                'movies.publish',
                function (data) {
                    console.info("retrieved movies.publish")
                    dispatcher.trigger(dispatcher.apiMoviePublishResponse, data.message);
                }
            );

            ipc.of.server.on(
                'movies.unpublish',
                function (data) {
                    console.info("retrieved movies.unpublish")
                    dispatcher.trigger(dispatcher.apiMovieUnpublishResponse, data.message);
                }
            );

            ipc.of.server.on(
                'videos.list',
                function (data) {
                    console.info("retrieved videos.list")
                    dispatcher.trigger(dispatcher.apiVideoListResponse, data.message);
                }
            );

            ipc.of.server.on(
                'videos.upload',
                function (data) {
                    console.info("retrieved videos.upload")
                    dispatcher.trigger(dispatcher.apiVideoUploadResponse, data.message);
                }
            );
        }
    );

    /**
     *
     * @param endpoint
     * @param params
     */
    function sendMessage(endpoint, params) {

        ipc.of.server.emit(endpoint, $.extend({}, {
            id: ipc.config.id,
            message: null
        }, params));

    }

    /**
     * Api Service
     * Contains all api methods
     */
    return {

        /**
         * Gets all videos uploaded
         * @param callback
         */
        getVideos: function (callback) {

            sendMessage(endpoint.getVideos, callback);

        },

        /**
         *
         * @param filePath
         */
        uploadVideo: function (filePath) {

            sendMessage(endpoint.uploadVideo, {filePath: filePath});

        },

        /**
         * Return all movies
         */
        getMovies: function () {

            sendMessage(endpoint.getMovies);

        },

        /**
         * Get a movie (movie)
         * @param movie_id
         */
        getMovie: function (movie_id) {

            sendMessage(endpoint.getMovie, {movie_id: movie_id});

        },

        /**
         * Add a new movie and returns its id
         * @param data
         */
        addMovie: function (data) {

            sendMessage(endpoint.addMovie, data)

        },

        /**
         * updates a movie
         * @param movie_id
         * @param data
         */
        updateMovie: function (movie_id, data) {

            sendMessage(endpoint.updateMovie, data)

        },

        /**
         * deletes a movie
         * @param movie_id
         */
        deleteMovie: function (movie_id) {

            sendMessage(endpoint.deleteMovie, {movie_id: movie_id})

        },

        /**
         *
         * @param movie_id
         */
        publishMovie: function (movie_id) {

            sendMessage(endpoint.publishMovie, {movie_id: movie_id})

        },

        /**
         *
         * @param movie_id
         */
        unpublishMovie: function (movie_id) {

            sendMessage(endpoint.unpublishMovie, {movie_id: movie_id})

        }


    };

});