"use strict";

define(["jquery", "config"], function($, config) {

    var endpoint = config.api;


    var getRequest = function(endpoint, callback) {

        $.getJSON(endpoint)

            .done(function(data) {
                if(callback) callback(false, data);
            })

            .fail(function(err) {
                if(callback) callback(err);
            })

    };

    var request = function(type, endpoint, data, callback) {

        $.ajax({
            url: endpoint,
            method: type,
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json'
        })

            .done(function(data) {
                if(callback) callback(false, data);
            })

            .fail(function(err) {
                if(callback) callback(err.responseJSON);
            })

    };

    var postRequest = function(endpoint, data, callback) {
        return request('post', endpoint, data, callback);
    };

    var putRequest = function(endpoint, data, callback) {
        return request('put', endpoint, data, callback);
    };

    var deleteRequest = function(endpoint, data, callback) {
        return request('delete', endpoint, data, callback);
    };

    /**
     * Api Service
     * Contains all api methods
     */
    return {

        /**
         * Gets all videos uploaded
         * @param callback
         */
        getVideos : function(callback) {

            getRequest(endpoint.getVideos, callback);

        },

        getMovies : function(callback) {

            getRequest(endpoint.getMovies, callback);

        },

        /**
         * Get a movie (lesson)
         * @param movie_id
         * @param callback
         */
        getMovie: function(movie_id, callback) {

          getRequest(endpoint.getMovie + movie_id, callback);

        },

        /**
         * Add a new movie and returns its id
         * @param data
         * @param callback
         */
        addMovie : function(data, callback) {

            putRequest(endpoint.addMovie, data, callback)

        },

        /**
         * updates a movie
         * @param movie_id
         * @param data
         * @param callback
         */
        updateMovie : function(movie_id, data, callback) {

            postRequest(endpoint.updateMovie + movie_id, data, callback)

        },

        /**
         * deletes a movie
         * @param movie_id
         * @param callback
         */
        deleteMovie : function(movie_id, callback) {

            deleteRequest(endpoint.deleteMovie + movie_id, {}, callback)

        }


    };

});