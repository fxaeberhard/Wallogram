;
jQuery(function($) {
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     */
    var IO = {
        /**
         * 
         */
        gameId: null,
        /**
         * This is called when the page is displayed. It connects the Socket.IO client
         * to the Socket.IO server
         */
        init: function() {
            IO.socket = io.connect();

            IO.socket.on('connected', IO.onConnected);
            IO.socket.on('error', IO.error);
        },
        /**
         * The client is successfully connected!
         */
        onConnected: function() {
            console.log("IO.onConnected(id: " + IO.socket.io.engine.id + ")");
            IO.id = IO.socket.io.engine.id;
        },
        /**
         * An error has occurred.
         * @param data
         */
        error: function(data) {
            console.error(data.message);
        },
        /**
         * 
         * @param {String} type
         * @param {Object} data
         */
        emit: function(type, data) {
            data = data || {};
            data.gameId = IO.gameId;
            data.socketId = IO.id;

            IO.socket.emit(type, data);
        },
        /**
         * 
         * @param {String} type
         * @param {Functiom} callback
         */
        on: function(type, callback) {
            IO.socket.on(type, callback);
        }
    };
    $.IO = IO;
}($));
