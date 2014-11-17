/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
/**
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
jQuery(function($) {

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

    $.bindC = function(f, c) {
        var xargs = arguments.length > 2 ?
            arguments.slice(arguments, 2) : null;
        return function() {
            var fn = $.type(f) === "string" ? c[f] : f,
                args = (xargs) ?
                xargs.concat(arguments) : arguments;
            return fn.apply(c || fn, args);
        };
    };

    $.toggleFullscreen = function(value) {
        var isFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) || document.mozFullScreen || document.webkitIsFullScreen,
            cfs = document.exitFullscreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msExitFullscreen,
            el = document.documentElement,
            rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
        if (value === false || isFullScreen) {
            cfs.call(document);                                 //Exits full-screen mode and returns to the document view.
        } else {
            rfs.call(el, Element.ALLOW_KEYBOARD_INPUT);
        }
    };

}($));
