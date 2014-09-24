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
            alert(data.message);
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

    /**
     * Utils
     */
    $.urlParam = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
    $.HHMMSS = function(sec_num) {
        var minutes = Math.floor((sec_num) / 60000),
            seconds = Math.floor((sec_num - (minutes * 60000)) / 1000),
            milliseconds = Math.floor((sec_num - (minutes * 60000) - (seconds * 1000)) / 10);

        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (milliseconds < 10) {
            milliseconds = "0" + milliseconds;
        }
        return minutes + ':' + seconds + ':' + milliseconds;
    };
    $.arrayFind = function(a, fn) {
        for (var i = 0; i < a.length; i++) {
            if (fn(i, a[i], a)) {
                return a[i];
            }
        }
    };
    $.size = function(o) {
        return $.map(o, function(n, i) {
            return i;
        }).length;
    };
}($));
