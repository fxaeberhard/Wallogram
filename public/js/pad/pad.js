/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
YUI.add("wallogram-pad", function(Y) {

    /**
     * 
     */
    var Pad = Y.Base.create("wallogram-pad", Y.Widget, [Y.WidgetPosition, Y.WidgetPositionAlign], {
        BUTTONS: ["UP_ARROW", "LEFT_ARROW", "RIGHT_ARROW", "A", "B"], //        // disabled: 'bottom', 'start', 'select'
        renderUI: function() {
            var node, cb = this.get("contentBox");

            Y.Array.each(this.BUTTONS, function(b) {                            // Add button to the content box
                node = Y.Node.create('<div class="pad-button pad-button-' + b.toLowerCase().replace("_", "-") + '"></div>');
                node.position = b;
                cb.append(node);
            });
			
			node = Y.Node.create('<div class="info-box">score: <span>0</span></div>')
			cb.append(node);
			
            this.fitPad();

            //cb.append(Y.JSON.stringify(Y.UA));
            //cb.append(Y.UA.mobile);
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
            Y.log("Wallogram.Pad.press()");
            var button = e.target.position;

            if (!button)
                return;

            this.emit("down", button);
            e.target.addClass('pad-button-pressed');

            e.halt(true);
        },
        onMove: function(e) {
            //Y.log("Wallogram.Pad.move: " + e.target.position);
            //this.get("contentBox").append("onMove&nbsp;");
            e.halt(true);
        },
        releaseButton: function(e) {
            Y.log("Wallogram.Pad.release()");
            var button = e.target.position;

            if (!button)
                return;

            this.emit("up", button);
            e.target.removeClass('pad-button-pressed');

            e.halt(true);
            //e.preventDefault();
            //e.stopPropagation();
            //e.stopImmediatePropagation();
            //
            //log("release: ");
            //if (e.changedTouches) {
            //	target = e.changedTouches[0];
            //}
            //if (target.position)
            //    log(target.position);
            //else
            //    log("undef");
        },
        emit: function(type, button) {
            switch (button) {
                case "UP_ARROW":
                case "LEFT_ARROW":
                case "RIGHT_ARROW":
                case "A":
                case "B":
                    $.IO.emit('padEvent', {
                        type: type,
                        position: button
                    });
                    break;
            }
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
$(document).ready(function() {
    $.IO.on('addScoreToController', function(score) {
	    console.log("yuppp", score)
        $('.info-box span').html(score)
    })
});
