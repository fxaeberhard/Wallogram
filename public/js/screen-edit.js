/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
jQuery(function($) {
    'use strict';

    YUI_config.groups.inputex.base = "libs/inputEx/src/";
    YUI_config.groups.inputex.filter = "raw";

    var currentEntity,
        TOOLBAR = {
            QR: {
                thumbClass: "fa fa-qrcode fa-4x",
                form: [{
                        name: "bgcolor",
                        label: "Background"
                    }, {
                        name: "bgcolor",
                        label: "Foreground"
                    }],
                value: {
                    type: "QR",
                    components: "QR",
                    w: 80,
                    h: 80
                }
            },
            Image: {
                thumbClass: "fa fa-file-image-o fa-4x",
                form: [{
                        name: "target",
                        label: "url"
                    }],
                value: {
                    type: "Image",
                    components: "WalloImage, Platform",
                    url: "assets/mario-platform.png",
                    w: 90,
                    h: 100
                }
            },
            Color: {
                thumbClass: "fa fa-file-video-o fa-4x",
                form: [{
                        name: "color",
                        label: "Color"
                    }],
                value: {
                    type: "Color",
                    components: "ColoredPlatform",
                    color: "red"
                }
            },
            Text: {
                thumbClass: "fa fa-font fa-4x",
                form: [{
                        label: "Text",
                        name: "text",
                        type: "text"
                            // type: "tinymce"
                    }],
                value: {
                    type: "Text",
                    components: "WalloText",
                    text: "<font style='color:white'>red</font>09",
                    x: 770,
                    y: 340
                }
            }
        },
    Edit = {
        /**
         *
         */
        init: function() {
            $("#tab-play").prepend('<div class="wallo-edit-overlay"><div class="wallo-edit-dd"><div class="wallo-edit-destroy fa fa-trash"></div><div class="wallo-edit-editentity fa fa-pencil"></div></div></div>');

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

            $('.wallo-edit-editentity').on('click', Edit.showEditForm);         // Entity overlay buttons
            $(".wallo-edit-destroy").on("click", Edit.destroyEntity);

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

            $('.wallo-load-platlevels').on('click', 'a', Edit.loadLevel);

            $('.wallo-edit-buttons').on('click', '.button-save', Edit.save);
            
            $(".button-close").on("click", function () {
                $.App.toggleDebug();
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
                        editor.setValue(JSON.stringify($.App.cfg, null, '\t'));
                        editor.gotoLine(0, 0);
                        break;

                    case "#tab-play":
                        $.App.resetCrafty();
                        break;
                }
            });

            _.each(TOOLBAR, function(i) {
                $(".wallo-edit-toolbar").append("<div class='wallo-thumb " + i.thumbClass + "' data-type='" + i.value.type + "'></div>");
            });

            $(".wallo-edit-toolbar div").draggable({
                opacity: 0.7,
                helper: "clone"
            });
            $(".wallo-play").droppable({
                drop: function(e, ui) {
                    console.log(e, ui);
                    var dropType = $(e.originalEvent.target).attr("data-type"),
                        cfg = _.clone(TOOLBAR[dropType].value);

                    cfg.x = e.clientX;
                    cfg.y = e.clientY;

                    $.App.cfg.entities.push(cfg);
                    var entity = Crafty.e(cfg.components).attr(cfg);
                    entity.cfgObject = cfg;
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
            //Edit.save();
        },
        showEditForm: function() {
            var dialog = $('<div></div>').dialog({
                title: "Edit",
                modal: true,
                buttons: [{
                        text: "Yes",
                        click: function() {//action code here
                        }
                    }, {
                        text: "Cancel",
                        click: function() {
                            $(this).dialog("close");
                        }
                    }]
            });
            var cfg = {
                type: "group",
                fields: TOOLBAR[currentEntity.cfgObject.type].form,
                parentEl: dialog.get(0)
            };
            YUI().use("inputex", function(Y) {
                Y.inputEx.use(cfg, function(Y) {
                    Y.inputEx(cfg);
                });
            });
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
            $.ajax({
                type: 'PUT',
                data: JSON.stringify($.App.cfg),
                url: '/levels/updateLevel',
                dataType: 'JSON',
                contentType: 'application/json'
            }).done(function(response) {
                // Check for successful (blank) response
                if (response.msg === '') {
                    console.log('level saved');
                }
                else {

                    // If something goes wrong, alert the error message that our service returned
                    alert('Error: ' + response.msg);

                }
            });
        }
    };
    $.Edit = Edit;                                                              // Set up global reference
}($));
