/*
 * Wallogram
 * http://wallogram.red-agent.com
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
YUI.add("wallogram-accelerometer", function(Y) {
    var data = {x: 0, y: 0, z: 0},
    previous = {x: 0, y: 0, z: 0},
    myDataValues = [
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 0, z: 0}
    ],
            threshold = 2,
            interval = 40,
            payload = {},
            packets = 0,
            have_gyroscope = false, Accelerometer;
    /**
     * 
     */
    Accelerometer = Y.Base.create("wallogram-accelerometer", Y.Widget, [Y.WidgetPosition, Y.WidgetPositionConstrain], {
        renderUI: function() {
            this.chart = new Y.Chart({
                styles: {
                    axes: {
                        values: {
                            label: {color: "transparent"}
                        },
                        category: {
                            label: {color: "transparent"}
                        }
                    },
                    series: {
                        x: {
                            marker: {
                                display: "none",
                                fill: {
                                    color: "transparent"
                                },
                                border: {
                                    color: "transparent"
                                }
                            }
                        },
                        y: {
                            marker: {
                                display: "none",
                                fill: {
                                    color: "transparent"
                                },
                                border: {
                                    color: "transparent"
                                }
                            }
                        },
                        z: {
                            marker: {
                                display: "none",
                                fill: {
                                    color: "transparent"
                                },
                                border: {
                                    color: "transparent"
                                }
                            }
                        }
                    }
                },
                dataProvider: myDataValues,
                render: "#pad-chart"
            });
        },
        bindUI: function() {
            /* By default we read accelerometers since they are available in all iGadgets. */
            window.addEventListener("devicemotion", Y.bind(this.read_accelerometer, this), false);

            /* Reduce the amount of data to be sent in two ways. 1) Only send every */
            /* interval milliseconds and 2) Only send if user has tilted the phone  */
            /* more than threshold.                                                 */
            var sleeper = setInterval(function() {
                console.log("sleeper check");
                pushChartValue(data);

                if ((threshold < Math.abs(data.x - previous.x)) ||
                        (threshold < Math.abs(data.y - previous.y)) ||
                        (threshold < Math.abs(data.z - previous.z))) {
                    console.log("Sleeper sends event");

                    previous.x = data.x;
                    previous.y = data.y;
                    previous.z = data.z;
                    try {
                        //   socket.send(JSON.stringify(payload));              
                    } catch (error) {
                    }
                    // $("#packets").text(packets++);
                }
            }, interval);
        },
        pushChartValue: function(val) {
            myDataValues.pop();
            myDataValues.push(val);
            this.chart.set('dataProvider', myDataValues);
        },
        bindAccelerometerScreen: function() {

        },
        read_gyroscope: function(event) {
            /* beta:  -180..180 (rotation around x axis) */
            /* gamma:  -90..90  (rotation around y axis) */
            /* alpha:    0..360 (rotation around z axis) (-180..180) */

            data.x = Math.round(event.beta);
            data.y = Math.round(event.gamma);
            data.z = Math.round(event.alpha);

            /* jQuery mobile cannot handle negative minimum value.      */
            /* so I have to use zero based value to display the slider. */
            // console.log();
            // $("#beta").val(data.x * 1 + 180).trigger("keyup");
            //$("#gamma").val(data.y * 1 + 90).trigger("keyup");
            //$("#alpha").val(data.z * 1 + 180).trigger("keyup");

            payload = {type: "orientation", data: data};
        },
        read_accelerometer: function() {
            /* If we have rotation rate device has gyroscopes and start */
            /* reading gyroscopes instead...                            */
            if (event.rotationRate) {
                window.removeEventListener("devicemotion", read_accelerometer, false);
                window.addEventListener("deviceorientation", read_gyroscope, false);
            }

            threshold = 5;
            /* Accelerometers give smaller number thus we multiply */
            /* to have similar rates as with gyroscope.            */
            data.x = Math.round(event.accelerationIncludingGravity.x * 10);
            data.y = Math.round(event.accelerationIncludingGravity.y * 10);
            /*data.z = Math.round(event.accelerationIncludingGravity.z * 10);*/

            /* jQuery mobile cannot handle negative minimum value.      */
            /* so I have to use zero based value to display the slider. */
            // $("#beta").val(data.x * 1 + 180).trigger("keyup");
            // $("#gamma").val(data.y * 1 + 90).trigger("keyup");

            payload = {type: "acceleration", data: data};
        }
    });
    Y.namespace("Wallogram").Accelerometer = Accelerometer;
});
