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
    YUI_config.groups.inputex.modules['inputex-rte'].requires = ['inputex-field', 'inputex-textarea'];
    YUI_config.groups.inputex.modules['inputex-color'].requires = ['inputex-field'];

    var currentEntity,
        TOOLBAR = {
            Color: {
                category: "platforms",
                label: "Colored platform",
                form: [{
                        name: "color",
                        label: "Color",
                        type: "color"
                    }],
                value: {
                    type: "Color",
                    components: "ColoredPlatform",
                    color: "red",
                    w: 100,
                    h: 100
                }
            },
            Invisible: {
                category: "platforms",
                label: "Invisible platform",
                form: [],
                value: {
                    type: "Invisible",
                    components: "Invisible",
                    w: 100,
                    h: 100
                }
            },
            Image: {
                category: "image",
                thumbClass: "fa fa-file-image-o fa-4x",
                form: [{
                        name: "image",
                        label: "Image"
                    }],
                value: {
                    type: "Image",
                    components: "WalloImage, Platform",
                    image: "assets/mario-platform.png",
                    w: 90,
                    h: 100
                }
            },
            Video: {
                category: "video",
                thumbClass: "fa fa-file-video-o fa-4x",
                form: [{
                        name: "url",
                        label: "Url",
                        type: "url"
                    }],
                value: {
                    type: "Video",
                    components: "Video",
                    url: "http://www.youtube.com/watch?v=xhrBDcQq2DM",
                    w: 320,
                    h: 280
                }
            },
            Text: {
                category: "other",
                thumbClass: "fa fa-font fa-4x",
                form: [{
                        name: "text",
                        type: "html",
                        className: "inputEx-Field form-text"
                    }],
                value: {
                    type: "Text",
                    components: "WalloText",
                    text: "Ipsem lorum",
                    w: 200,
                    h: 80
                }
            },
            QR: {
                category: "other",
                thumbClass: "fa fa-qrcode fa-4x",
                form: [{
                        name: "background",
                        label: "Background",
                        type: "color"
                    }, {
                        name: "foreground",
                        label: "Foreground",
                        type: "color"
                    }],
                value: {
                    type: "QR",
                    components: "QR",
                    w: 80,
                    h: 80,
                    foreground: "#000000",
                    background: "#ffffff"
                }
            }
        },
    Edit = {
        /**
         *
         */
        init: function() {                                                             // Toggle fps button

            /**
             * Entity edition overlay
             */
            $("#tab-play").prepend('<div class="wallo-edit-overlay"><div class="wallo-edit-dd"><div class="wallo-edit-menu"><div class="wallo-edit-destroy fa fa-trash"></div><div class="wallo-edit-editentity fa fa-pencil"></div></div></div></div>');

            var isDragging = false, over = false,
                overlay = $(".wallo-edit-dd"),
                cfg = {
                    containment: ".wallo-crafty",
                    //delay: 100,
                    //distance: 20,
                    handles: "ne, se, sw, nw",
                    start: function() {
                        isDragging = true;
                    },
                    resize: function() {
                        Edit.savePositions();
                    },
                    drag: function() {
                        Edit.savePositions();
                    },
                    stop: function() {
                        //console.log("stop");
                        Edit.savePositions();
                        isDragging = false;
                        if (!over) {
                            Edit.hideEdition();
                        }
                    }
                };
            overlay.draggable(cfg);                                             // Set up drag and drop on overlay
            overlay.resizable(cfg);
            overlay.on("mouseenter", function() {
                //console.log("mouseenter");
                over = true;
            });
            overlay.on("mouseleave", function() {
                //console.log("mouseleave");
                over = false;
                if (!isDragging) {
                    Edit.hideEdition();
                }
            });

            $('.wallo-edit-editentity').click(Edit.showEditForm);               // Entity overlay buttons
            $(".wallo-edit-destroy").click(Edit.destroyEntity);

            $(document).on("newGameCreated", function() {
                var padUrl = $.App.getPadUrl();
                $(".wallo-tab-footer").prepend("Pad: <a href='" + padUrl + "' target='_blank'>" + padUrl + "</a><br /> <br />");
            });

            /* 
             * Fps counter 
             */
            var stats = new Stats();                                            // Initialize fps counter
            //stats.setMode(0);                                                 // 0: fps, 1: ms
            $(stats.domElement).hide();
            $(".wallo-tab-footer").append(stats.domElement);
            stats.begin();
            Crafty.bind("RenderScene", function() {
                stats.end();
                stats.begin();
            });

            /* 
             * Right menu 
             */
            $(".wallo-edit-logo").click(function() {
                window.location = "/screen";
            });
            $(".button-togglefps").click(function() {
                $("#stats").toggle();
            });
            $('.wallo-edit-buttons .button-save').click(Edit.save);             // Save Button
            $(".wallo-edit-toggle").on("click", function() {
                $.App.toggleDebug();
            });
            $(".wallo-edit-buttons .button-more").click(function() {            // More button
                var menu = $(this).next().show().position({
                    my: "left top",
                    at: "left bottom",
                    of: this
                });
                $(document).one("click", function() {
                    menu.hide();
                });
                return false;
            }).next()
                .hide()
                .css("position", "absolute")
                .css("width", "220px")
                .menu();
            $('.wallo-edit-buttons .button-adddebugplayer').click($.App.addDebugPlayer);
            $('.wallo-edit-buttons .button-toggledebugcanvas').click($.App.toggleDebugCanvas);

            var editor, scriptEditor, doUpdate = true;
            $(".wallo-tab-link").on("click", function() {                       // Add tab selection support
                $(".wallo-tab-linkselected").removeClass("wallo-tab-linkselected");
                $(this).addClass("wallo-tab-linkselected");

                $(".wallo-tab-selected").removeClass("wallo-tab-selected");
                $(this.dataset.target).addClass("wallo-tab-selected");

                switch (this.dataset.target) {
                    case "#tab-source":                                         // Ace tabs
                        if (!editor) {
                            editor = ace.edit("editor");
                            editor.getSession().setMode("ace/mode/json");
                            //editor.setTheme("ace/theme/chrome");
                            editor.getSession().on('change', function(e) {
                                //if (editor.curOp && editor.curOp.command.name) {// Check the change is a user input and not a programtical change
                                if (doUpdate) {
                                    try {
                                        $.App.setCfg(JSON.parse(editor.getValue()));
                                    } catch (e) {
                                        console.error("Unable to parse source", e);
                                    }
                                }
                            });
                        }
                        editor.focus();                                         //To focus the ace editor
                        doUpdate = false;
                        editor.setValue(JSON.stringify($.App.cfg, null, '\t'));
                        doUpdate = true;
                        editor.gotoLine(0, 0);
                        break;

                    case "#tab-script":
                        if (!scriptEditor) {
                            scriptEditor = ace.edit("scripteditor");
                            scriptEditor.getSession().setMode("ace/mode/javascript");
                            //editor.setTheme("ace/theme/chrome");
                            scriptEditor.getSession().on('change', function(e) {
                                //if (scriptEditor.curOp && scriptEditor.curOp.command.name) {// Check the change is a user input and not a programtical change
                                if (doUpdate) {
                                }
                            });
                        }
                        scriptEditor.focus();                                   //To focus the ace editor
                        doUpdate = false;
                        scriptEditor.setValue("");
                        doUpdate = true;
                        scriptEditor.gotoLine(0, 0);
                        break;

                    case "#tab-play":
                        $.App.resetCrafty();
                        break;
                }
            });

            var tablinks, tabContent, tabs = {
                platforms: "",
                ennemy: "",
                image: "",
                video: "",
                other: ""
            };
            _.each(TOOLBAR, function(i) {                                       // Render toolbar elements
                if (!tabs[i.category]) {
                    tabs[i.category] = "";
                }
                tabs[i.category] += "<div class='wallo-thumb wallo-thumb-" + i.value.type + "' data-type='" + i.value.type + "' title='" + (i.label || i.value.type) + "'><div class='wallo-icon " + i.thumbClass + "'></div></div>";
            });
            tablinks = _.map(tabs, function(o, k) {
                return '<li><a href="#tabs-toolbar-' + k + '" class="toolbar-' + k + '"></a></li>';
            });
            tabContent = _.map(tabs, function(o, k) {
                return "<div id='tabs-toolbar-" + k + "'>" + o + "</div>";
            });
            $(".wallo-edit-toolbar").append("<ul>" + tablinks.join("") + "</ul>" + tabContent.join(""))
                .tabs();

            $(".wallo-edit-toolbar .wallo-thumb").draggable({// and make the icons  drag and droppable
                opacity: 0.7,
                helper: "clone"
            });
            $(".wallo-play").droppable({
                drop: function(e) {
                    console.log(e, e.originalEvent.target.className);
                    if (e.originalEvent.target.className.indexOf("edit-dd") !== -1)
                        return;

                    try {
                        var dropType = $(e.originalEvent.target).closest(".wallo-thumb").attr("data-type"),
                            cfg = _.clone(TOOLBAR[dropType].value);

                        cfg.x = e.clientX - $("#tab-play").position().left - cfg.w / 2;
                        cfg.y = e.clientY - cfg.h / 2;

                        $.App.cfg.entities.push(cfg);
                        var entity = Crafty.e(cfg.components).attr(cfg);
                        entity.cfg = cfg;
                    } catch (e) {
                        console.log("Unable to drop new object", e);
                    }
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
            $.extend(currentEntity.cfg, cfg);
            //Edit.save();
        },
        showEditForm: function() {
            var form,
                dialog = $('<div></div>').dialog({
                //title: "Edit",
                modal: true,
                width: 700,
                position: {
                    my: "center top",
                    at: "center top+75"
                },
                buttons: [{
                        text: "Save",
                        click: function() {
                            $.App.updateEntityCfg(currentEntity, form.getValue());
                            $(this).dialog("close");
                        }
                    }, {
                        text: "Cancel",
                        click: function() {
                            $(this).dialog("close");
                        }
                    }]
            }), cfg = {
                type: "group",
                fields: TOOLBAR[currentEntity.cfg.type].form,
                parentEl: dialog.get(0),
                value: currentEntity.cfg
            };

            $('.wallo-edit-overlay').hide();

            YUI().use("inputex", "inputex-color", function(Y) {
                Y.inputEx.use(cfg, function(Y) {
                    form = Y.inputEx(cfg);
                });
            });
        },
        destroyEntity: function() {
            $.arrayFind($.App.cfg.entities, function(i, e) {
                if (e === currentEntity.cfg) {
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
                } else {
                    alert('Error: ' + response.msg);                            // If something goes wrong, alert the error message that our service returned
                }
            });
        }
    };
    $.Edit = Edit;                                                              // Set up global reference
}($));
