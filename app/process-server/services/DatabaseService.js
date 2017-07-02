"use strict";

const low = require('lowdb');

const DatabaseService = function (_database_id) {

    const globalFolder = DatabaseService.globalFolder ?
    DatabaseService.globalFolder + '/' : '';

    this.db = low(globalFolder + 'lowdb/' + _database_id + '.json');
    this.db.defaults({[_database_id]: []}).write();

    /**
     * Add a document to db
     * @param id
     * @param data
     * @param callback
     */
    this.insert = function (id, data, callback) {

        if (!id) {
            id = this._generateId();
        }

        data.id = id;
        this.db.get(_database_id).push(data).write();

        if (callback) {
            callback(false, data.id);
        }

    };

    /**
     * Update a document on db
     * @param document_id
     * @param data
     * @param callback
     */
    this.update = function (document_id, data, callback) {

        var doc = this.db.get(_database_id).find({id: document_id}).assign(data).write();

        if (callback) callback(false, doc);

    };

    /**
     * Get a document from db
     * @param document_id
     * @param callback
     */
    this.get = function (document_id, callback) {

        var doc = this.db.get(_database_id).find({id: document_id}).value();

        if (callback) {
            callback(false, doc);
        }

    };

    /**
     * Delete a document from db
     * @param document_id
     * @param callback
     */
    this.delete = function (document_id, callback) {

        var doc = this.db.get(_database_id).remove({id: document_id}).write();

        if (callback) {
            callback(false, doc);
        }

    };

    /**
     * Return a view result
     * @param designname
     * @param viewname
     * @param params
     * @param callback
     */
    this.list = function (designname, viewname, params, callback) {

        var docs = this.db.get(_database_id).sortBy('created').value();
        if (callback) callback(false, docs || []);

    };

    /**
     * Generate uuid
     * @returns {string}
     * @private
     */
    this._generateId = function () {
        return this.database_id + '_' + Uuid.raw();
    };


    /**
     * Returns only rows
     * @param data
     * @returns {Number|HTMLCollection|string}
     */
    this.formatResponse = function (data) {
        return data.rows;
    };

    return this;

};

DatabaseService.setGlobalFolder = function (dir) {
    DatabaseService.globalFolder = dir;
};

module.exports = DatabaseService;
