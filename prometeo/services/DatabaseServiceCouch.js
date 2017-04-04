"use strict";

const low = require('lowdb');

var connectionInfo = {
        user: 'admin',
        password: '1q2w3e4r',
        url : "localhost:5984"
    },
    Uuid = require('uuid-lib'),
    nano = require('nano')('http://' + connectionInfo.user + ':' + connectionInfo.password + '@' + connectionInfo.url);


var DatabaseService = function(_database_id) {
    this.database_id = _database_id;
    this.db = low('../' + database_id + '.json');
    //nano.db.create(_database_id);
    //this.db = nano.db.use(_database_id);

    /**
     * Add a document to db
     * @param id
     * @param data
     * @param callback
     */
    this.insert = function(id, data, callback) {

        if(!id) {
            id = this._generateId();
        }

        this.db.insert(data, id, function(err, body){
            if(callback) callback(err, body, id)
        });

    };

    /**
     * Update a document on db
     * @param document_id
     * @param data
     * @param callback
     */
    this.update = function(document_id, data, callback) {
        var self = this;

        // get document and update its rev

        this.get(document_id, function(err, fetched) {

            if(err) {
                if(callback) callback(err);
                return;
            }

            data._id = document_id;
            data._rev = fetched._rev;

            self.db.insert(data, function(err, saved) {
                // document updated
                if(callback) callback(err, saved)
            });

        });

    };

    /**
     * Get a document from db
     * @param document_id
     * @param callback
     */
    this.get = function (document_id, callback) {
        var self = this;

        this.db.get(document_id, { revs_info: false }, function(err, data) {

            if(!err) {
                if(callback) callback(false, data);
            } else {
                if(callback) callback(err);
            }

        });

    };

    /**
     * Delete a document from db
     * @param document_id
     * @param callback
     */
    this.delete = function(document_id, callback) {
        var self = this;

        this.get(document_id, function(err, data) {

            if(err) {
               if(callback) return callback(false);
            }

            // elimino il documento segnandolo come _deleted = true
            data._deleted = true;

            self.update(document_id, data, function() {

                if(!err) {
                    if(callback) callback(false, data);
                } else {
                    if(callback) callback(err);
                }

            })

        });

    };

    /**
     * Return a view result
     * @param designname
     * @param viewname
     * @param params
     * @param callback
     */
    this.list = function (designname, viewname, params, callback) {
        var self = this;

        params = params || {};

        this.db.view(designname, viewname, params, function(err, body) {

            if(!err) {
                if(callback) callback(false, self.formatResponse(body));
            } else {
                if(callback) callback(err);
            }

        });

    };

    /**
     * Generate uuid
     * @returns {string}
     * @private
     */
    this._generateId = function() {
        return this.database_id + '_' + Uuid.raw();
    };


    /**
     * Returns only rows
     * @param data
     * @returns {Number|HTMLCollection|string}
     */
    this.formatResponse = function(data) {
        return data.rows;
    };

    return this;

};

module.exports = DatabaseService;
