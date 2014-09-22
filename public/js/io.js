;
jQuery(function($) {
    'use strict';

    /**
     * All the code relevant to Socket.IO is collected in the IO namespace.
     *
     * @type {{init: Function, bindEvents: Function, onConnected: Function, onNewGameCreated: Function, playerJoinedRoom: Function, beginNewGame: Function, onNewWordData: Function, hostCheckAnswer: Function, gameOver: Function, error: Function}}
     */
    var IO = {
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
        emit: function(type, data) {
            data && (data.gameId = IO.gameId);
            IO.socket.emit(type, data);
        },
        on: function(type, callback) {
            IO.socket.on(type, callback);
        },
        /**
         * An error has occurred.
         * @param data
         */
        error: function(data) {
            alert(data.message);
        }

    };
    $.IO = IO;
}($));
