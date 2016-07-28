"use strict";

define(["socketio", "config"], function(io, config) {

    var socket = io.connect(config.socketUrl);

    /**
     * Socket io wrapper
     * Wraps socket.io library
     */
    return {

        getSocket: function() {
            return socket;
        },

        /**
         *
         * @param eventName
         * @param callback
         */
        on: function(eventName, callback) {
            socket.on(eventName, callback);
        },

        /**
         *
         * @param eventName
         * @param data
         */
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }

    };

});