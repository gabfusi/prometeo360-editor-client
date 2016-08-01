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

    /**
     * Api Service
     * Contains all api methods
     */
    return {

        /**
         * Get a movie (lesson)
         * @param movie_id
         * @param callback
         */
        getMovie: function(movie_id, callback) {

          getRequest(endpoint.getMovie + movie_id, callback);

        }


    };

});