"use strict";

var DatabaseService = require('./DatabaseService.js');
var Uuid = require('uuid-lib');


var MoviesService = {

    db: new DatabaseService('movies'),

    /**
     *
     * @param data
     * @param callback
     */
    addMovie: function (data, callback) {
        var new_id = Uuid.raw();
        data.id = new_id;
        data.created = Math.round(Date.now() / 1000);
        data.modified = data.created;

        this.db.insert(new_id, data, function (err, body) {
            if (callback) callback(err, new_id);
        });

    },

    /**
     *
     * @param movie_id
     * @param data
     * @param callback
     */
    updateMovie: function (movie_id, data, callback) {

        data.modified = Math.round(Date.now() / 1000);

        this.db.update(movie_id, data, function (err, body) {
            if (callback) callback(err, body);
        });

    },

    /**
     *
     * @param callback
     * @returns {*}
     */
    getMovies: function (callback) {
        return this.db.list('movies', 'get_by_modified_date', {descending: true}, callback);
    },

    /**
     *
     * @param callback
     * @returns {*}
     */
    getPublishedMovies: function (callback) {
        return this.db.list('movies', 'get_published', {descending: true}, callback);
    },

    /**
     *
     * @param movie_id
     * @param callback
     * @returns {*}
     */
    getMovie: function (movie_id, callback) {
        return this.db.get(movie_id, callback);
    },

    /**
     *
     * @param movie_id
     * @param callback
     * @returns {*}
     */
    deleteMovie: function (movie_id, callback) {
        return this.db.delete(movie_id, callback);
    },

    /**
     *
     * @param movie
     */
    validateMovie: function (movie) {

        if (!movie) {
            throw new Error("Impossibile salvare il filmato.");
        }

        // controllo che il filmato sia ben formattato (è un controllo minimale, andrebbe esteso)
        if (typeof movie.name === 'undefined' || typeof movie.scenes === 'undefined' || typeof movie.id === 'undefined') {
            throw new Error("Formato non riconosciuto.");
        }

        if (!movie.name.length) {
            throw new Error("Specifica un nome per questo filmato.");
        }


    }

};

module.exports = MoviesService;
