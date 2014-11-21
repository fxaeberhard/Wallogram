/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
jQuery(function($) {
    'use strict';

    var currentEntity, Edit = {
        /**
         *
         */
        init: function() {
            $("#tab-play").prepend('<div class="wallo-edit-overlay"><div class="wallo-edit-dd"><div class="wallo-edit-destroy"></div></div></div>');

            YUI().use("dd-drag", "dd-constrain", "resize", "event-mouseenter", function(Y) {// Add move & resize support
                var node = Y.one(".wallo-edit-dd"),
                    drag = new Y.DD.Drag({node: node}),
                    resize = new Y.Resize({node: node}),
                    isDragging = false,
                    toggleIsDragging = function() {
                        isDragging = !isDragging;
                    };

                drag.plug(Y.Plugin.DDConstrained, {constrain2node: '.wallo-crafty'});
                drag.on(["drag:start", "drag:end"], toggleIsDragging);
                drag.on(["drag:drag", "drag:end"], Edit.savePositions);

                resize.plug(Y.Plugin.ResizeConstrained, {constrain: '.wallo-crafty'});
                resize.on(["resize:start", "resize:end"], toggleIsDragging);
                resize.on(["resize:resize", "resize:end"], Edit.savePositions);

                node.after("mouseleave", function() {
                    if (!isDragging) {
                        Edit.hideEdition();
                    }
                });
            });

            $(".wallo-edit-destroy").bind("click", function() {
                Edit.destroyEntity();
            });

            $(document).bind("newGameCreated", function() {
                var padUrl = $.App.getPadUrl();
                $(".wallo-edit-content").prepend("Pad: <a href='" + padUrl + "' target='_blank'>" + padUrl + "</a><br /> <br />");
            });

            var stats = new Stats();                                            // Initialize fps counter
            stats.setMode(0);                                                   // 0: fps, 1: ms
            $(".wallo-edit-content").append(stats.domElement);
            stats.begin();
            Crafty.bind("RenderScene", function() {
                stats.end();
                stats.begin();
            });

            var editor;
            $(".wallo-tab-link").bind("click", function() {                     // Add tab selection support
                $(".wallo-tab-linkselected").removeClass("wallo-tab-linkselected");
                $(this).addClass("wallo-tab-linkselected");

                $(".wallo-tab-selected").removeClass("wallo-tab-selected");
                $(this.dataset.target).addClass("wallo-tab-selected");

                switch (this.dataset.target) {
                    case "#tab-source":
                        if (!editor) {
                            editor = ace.edit("editor");
                            editor.getSession().setMode("ace/mode/json");
                            //editor.setTheme("ace/theme/chrome");
                            editor.getSession().on('change', function(e) {
                                if (editor.curOp && editor.curOp.command.name) {// Check the change is a user input and not a programtical change
                                    try {
                                        $.App.setCfg(JSON.parse(editor.getValue()));
                                    } catch (e) {
                                        console.error("Unable to parse source", e);
                                    }
                                }
                            });
                        }
                        editor.focus();                                         //To focus the ace editor

                        setTimeout(function() {
                        }, 1000);
                        editor.setValue(JSON.stringify($.App.cfg, null, '\t'));
                        editor.gotoLine(0, 0);
                        break;

                    case "#tab-play":
                        $.App.resetCrafty();
                        break;
                }
            });
        },
        showEdition: function(entity) {
            $('.wallo-edit-overlay').show();
            $('.wallo-edit-dd').css("left", entity.x)
                .css("top", entity.y)
                .width(entity.w)
                .height(entity.h);
            currentEntity = entity;
        },
        hideEdition: function() {
            $('.wallo-edit-overlay').hide();
        },
        savePositions: function() {
            var node = $('.wallo-edit-dd'),
                cfg = {
                    x: node.position().left,
                    y: node.position().top,
                    w: node.width(),
                    h: node.height()
                };
            currentEntity.attr(cfg);
            $.extend(currentEntity.cfgObject, cfg);
            Edit.save();
        },
        destroyEntity: function() {
            $.arrayFind($.App.cfg.entities, function(i, e) {
                if (e === currentEntity.cfgObject) {
                    $.App.cfg.entities.splice(i, 1);
                    return true;
                }
            });
            currentEntity.destroy();
            currentEntity = null;
            Edit.hideEdition();
            Edit.save();
        },
        save: function() {
            // TODO
        }
    };
    $.Edit = Edit;                                                              // Set up global reference
}($));
