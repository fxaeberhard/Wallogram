/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
jQuery(function ($) {
    'use strict';

    var Edit = {
        /**
         *
         */
        init: function () {
            $("body").prepend('<div class="wallo-edit-overlay"><div class="wallo-edit-dd"></div></div>');

            YUI().use("dd-drag", "dd-constrain", "resize", "event-mouseenter", function (Y) {
                var node = Y.one(".wallo-edit-dd"),
                    drag = new Y.DD.Drag({node: node}),
                    resize = new Y.Resize({node: node}),
                    isDragging = false,
                    toggleIsDragging = function () {
                        isDragging = !isDragging;
                    };

                drag.plug(Y.Plugin.DDConstrained, {constrain2node: '.wallo-crafty'});
                drag.on(["drag:start", "drag:end"], toggleIsDragging);
                drag.on(["drag:drag", "drag:end"], Edit.savePositions);

                resize.plug(Y.Plugin.ResizeConstrained, {constrain: '.wallo-crafty'});
                resize.on(["resize:start", "resize:end"], toggleIsDragging);
                resize.on(["resize:resize", "resize:end"], Edit.savePositions);

                node.after("mouseleave", function () {
                    if (!isDragging) {
                        Edit.hideEdition();
                    }
                });
            });

            $(document).bind("newGameCreated", function () {
                var padUrl = $.App.getPadUrl();
                $(".wallo-edit-content").append("Pad: <a href='" + padUrl + "' target='_blank'>" + padUrl + "</a>");
            });

            var stats = new Stats();                                            // Initialize fps counter
            stats.setMode(0);                                                   // 0: fps, 1: ms
            $(".wallo-edit-content").append(stats.domElement);
            stats.begin();
            Crafty.bind("RenderScene", function () {
                stats.end();
                stats.begin();
            });
        },
        showEdition: function (entity) {
            $('.wallo-edit-overlay').show();
            $('.wallo-edit-dd').css("left", entity.x)
                .css("top", entity.y)
                .width(entity.w)
                .height(entity.h);

            $('.wallo-edit-dd')[0].currentEntity = entity;
        },
        hideEdition: function () {
            $('.wallo-edit-overlay').hide();
        },
        savePositions: function () {
            var node = $('.wallo-edit-dd'),
                cfg = {
                    x: node.offset().left,
                    y: node.offset().top,
                    w: node.width(),
                    h: node.height()
                };
            node[0].currentEntity.attr(cfg);
            $.extend(node[0].currentEntity.cfgObject, cfg);
        }
    };
    $.Edit = Edit;                                                              // Set up global reference
}($));
