"use strict";

var DatabaseService = require('./DatabaseService.js');
var Uuid = require('uuid-lib');


var LessonsService = {

    db: new DatabaseService('lessons'),

    /**
     *
     * @param data
     * @param callback
     */
    addLesson: function(data, callback) {
        var new_id = Uuid.raw();
        data.id = new_id;
        data.created = Math.round(Date.now()/1000);
        data.modified = data.created;

        this.db.insert(new_id, data, function(err, body) {
            if(callback) callback(err, new_id);
        });

    },

    /**
     *
     * @param lesson_id
     * @param data
     * @param callback
     */
    updateLesson: function(lesson_id, data, callback) {

        data.modified = Math.round(Date.now()/1000);

        this.db.update(lesson_id, data, function(err, body) {
            if(callback) callback(err, body);
        });

    },

    /**
     *
     * @param callback
     * @returns {*}
     */
    getLessons: function(callback) {
        return this.db.list('lessons', 'get_by_modified_date', { descending: true }, callback);
    },

    /**
     *
     * @param callback
     * @returns {*}
     */
    getPublishedLessons: function(callback) {
        return this.db.list('lessons', 'get_published', { descending: true }, callback);
    },

    /**
     *
     * @param lesson_id
     * @param callback
     * @returns {*}
     */
    getLesson: function(lesson_id, callback) {
        return this.db.get(lesson_id, callback);
    },

    /**
     *
     * @param lesson_id
     * @param callback
     * @returns {*}
     */
    deleteLesson: function(lesson_id, callback) {
        return this.db.delete(lesson_id, callback);
    }

};

module.exports = LessonsService;
