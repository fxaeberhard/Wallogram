/*
 * Wallogram
 * http://wallogram.red-agent.com
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
YUI.add("wallogram-pusher", function(Y) {
    /**
     * 
     */
    var Pusher = Y.Base.create("wallogram-pusher", Y.Base, [], {
        /**
         *  Pusher Setup 
         */
        initializer: function() {
            if (!window.Pusher) {
                Y.log("Unable to find Pusher libraries", "error", "Y.Wallogram.Pusher");
                return;
            }

            window.Pusher.channel_auth_endpoint = this.get("authEndpoint");
            window.Pusher.log = Y.log;                                          // Enable pusher logging - don't include this in production
            document.WEB_SOCKET_DEBUG = true;                                   // Flash fallback logging - don't include this in production

            this.pusher = new window.Pusher(this.get("key"));
            this.channel = this.pusher.subscribe(this.get("channelPrefix") + this.get("screenId"));

            // Send connected event as soon as the connection is established
            this.channel.bind('pusher:subscription_succeeded', Y.bind(function(status) {
                Y.log("Connected to pusher channel: " + status, "info", "Y.Wallogram.Pusher");
                this.trigger('client-connection');
            }, this));

            // Log any error
            this.pusher.connection.bind('error', function(err) {
                if (err.data.code === 4004) {
                    Y.log("Pusher daily limit", "error", "Y.Wallogram.Pusher");
                } else {
                    Y.log("Pusher error", "error", "Y.Wallogram.Pusher");
                }
            });

            // Forward any non-pusher specific event to the facade
            this.pusher.bind_all(Y.bind(function(event, data) {
                Y.log("Pusher event: " + event, "info", "Y.Wallogram.Pusher");
                if (event.indexOf("pusher:") !== 0) {                           //ignore pusher specific event
                    this.publish(event, {
                        emitFacade: false
                    });
                    this.fire(event, data);
                }
            }, this));

            //this.channel.bind('pusher:subscription_error', function(status) {
            //    alert('Error subscribing to pusher channel.');
            //});
        },
        trigger: function(evt, data) {
            data = data || {};
            data.uid = this.get("sessionId");
            data.sid = this.get("screenId");
            this.channel.trigger(evt, data);
        }
    }, {
        ATTRS: {
            sessionId: {},
            screenId: {},
            key: {},
            channelPrefix: {
                value: 'private-'
            },
            authEndpoint: {
                value: 'pusher_auth.php'
            }
        }
    });
    Y.namespace("Wallogram").Pusher = Pusher;
});