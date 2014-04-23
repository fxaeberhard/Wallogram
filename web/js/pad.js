/*
 * Wallogram
 * http://wallogram.red-agent.com
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
YUI.add("wallogram-pad", function(Y) {

    /**
     * 
     */
    var Pad = Y.Base.create("wallogram-pad", Y.Widget, [Y.WidgetPosition, Y.WidgetPositionAlign], {
        BUTTONS: ['top', 'left', 'right', 'a', 'b'], //                         disabled: 'bottom', 'start', 'select'
        renderUI: function() {
            var node, cb = this.get("contentBox");
            Y.Array.each(this.BUTTONS, function(b) {                            // Add button to the content box
                node = Y.Node.create('<div class="pad-button pad-button-' + b + '"></div>');
                node.position = b;
                cb.append(node);
            });
            //this.get("contentBox").append(Y.JSON.stringify(Y.UA));
            //this.get("contentBox").append(Y.UA.mobile);
            this.fitPad();
        },
        bindUI: function() {
            var cb = this.get("contentBox");

            Y.on("windowresize", Y.bind(this.fitPad, this));

            if (!Y.UA.mobile || Y.UA.mobile === "windows") {
                cb.all(".pad-button").on("gesturemovestart", Y.bind(this.pressButton, this), {
                    preventDefault: true
                });
                cb.all(".pad-button").on("gesturemove", Y.bind(this.onMove, this), {
                    preventDefault: true,
                    standAlone: true
                });
                cb.all(".pad-button").on("gesturemoveend", Y.bind(this.releaseButton, this), {
                    preventDefault: true,
                    standAlone: true
                });
            } else {
                cb.all(".pad-button").on("touchstart", Y.bind(this.pressButton, this));
                cb.all(".pad-button").on("touchmove", Y.bind(this.onMove, this));
                cb.all(".pad-button").on("touchend", Y.bind(this.releaseButton, this));
            }

            //cb.on("touchstart", Y.bind(this.pressButton, this));
            //cb.on("touchmove", Y.bind(this.onMove, this));
            //cb.on("touchend", Y.bind(this.releaseButton, this));


            //Y.Array.each(this.BUTTONS, function(pos) {
            //node = Y.one('.pad-crossdummy-' + pos);
            /*  		node.on('mousedown', pressCross, null, pos);
             node.on('mouseup', releaseCross, null, pos);
             node.on('mouseenter', enterCross, null, pos);
             node.on('mouseleave', leaveCross, null, pos);
             node.on('dragenter', enterCross, null, pos);
             node.on('dragleave', leaveCross, null, pos);
             */
            /*
             node.on('touchstart', pressButton);
             node.on('touchmove', function(){});
             node.on('touchend', releaseButton);
             */

            /*
             node.on('gesturemovestart', pressButton);
             node.on('gesturemove', function(){});
             node.on('gesturemoveend', releaseButton);*/
            //);
        },
        /**
         *  Fit pad to window 
         */
        fitPad: function() {
            var winWidth = Y.DOM.winWidth(),
                    winHeight = Y.DOM.winHeight(),
                    maxWidth = 640,
                    maxHeight = 291,
                    padRatio = maxWidth / maxHeight,
                    width = 0, height = 0, widthByH = 0;

            if (winWidth > maxWidth && winHeight > maxHeight) {
                width = maxWidth;
                height = maxHeight;
            } else {
                widthByH = padRatio * winHeight;
                if (widthByH < winWidth) {
                    width = widthByH;
                    height = winHeight;
                } else {
                    width = winWidth;
                    height = winWidth / padRatio;
                }
            }
            this.setAttrs({
                width: width,
                height: height
            });
            this.centered();
            //this.setAttrs({
            //    width: winWidth,
            //    height: winHeight
            //});
            //this.get("contentBox").setStyles({
            //    width: width,
            //    height: height
            //});
            //padNode.setStyle("marginLeft", -width / 2);
            //padNode.setStyle("marginTop", -height / 2);
        },
        pressButton: function(e) {
            //Y.log("Wallogram.Pad.press()");
            //this.get("contentBox").append("press&nbsp;");
            //return;
            var button = e.target.position;

            if (!button)
                return;

            switch (button) {
                case "top":
                case "left":
                case "right":
                case "a":
                case "b":
                    this.pusher.trigger('client-pad-event', {
                        button: 'cross-down',
                        position: button
                    });
                    break;
            }
            e.target.addClass('pad-button-pressed');

            e.preventDefault();
            e.stopPropagation();
            e.halt();
            e.stopImmediatePropagation();
        },
        onMove: function(e) {
            Y.log("Wallogram.Pad.move: " + e.target.position);
            //this.get("contentBox").append("onMove&nbsp;");
            //return;
            e.preventDefault();
            e.stopPropagation();
            e.halt();
            e.stopImmediatePropagation();
        },
        releaseButton: function(e) {
            var button = e.target.position;

            //this.get("contentBox").append("release&nbsp;");
            //return;
            if (!button)
                return;

            switch (button) {
                case "top":
                case "left":
                case "right":
                case "a":
                case "b":
                    this.pusher.trigger('client-pad-event', {
                        button: 'cross-up',
                        position: button
                    });
                    break;
            }
            e.target.removeClass('pad-button-pressed');

            e.preventDefault();
            e.stopPropagation();
            e.halt();
            e.stopImmediatePropagation();
            //log("release: ");
            //if (e.changedTouches) {
            //	target = e.changedTouches[0];
            //}
            //if (target.position)
            //    log(target.position);
            //else
            //    log("undef");
        }
    }, {
        ATTRS: {
            centered: {
                value: true
            }
        }
    });
    Y.namespace("Wallogram").Pad = Pad;
});
