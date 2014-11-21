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
            var socket = io.connect();

            socket.on('connected', IO.onConnected);
            socket.on('error', IO.error);
            socket.on('disconnect', IO.onDisconnect);

            IO.socket = socket;
        },
        /**
         * The client is successfully connected!
         */
        onConnected: function() {
            console.log("IO.onConnected(id: " + IO.socket.io.engine.id + ")");
            IO.id = IO.socket.io.engine.id;
            $("body").toggleClass("wallo-socketio-connected", true);
        },
        onDisconnect: function() {
            console.log("IO.onDisconnect()");
            $("body").toggleClass("wallo-socketio-connected", false);
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
