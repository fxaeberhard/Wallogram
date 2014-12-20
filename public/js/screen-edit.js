/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
jQuery(function($) {
    'use strict';

    YUI_config.groups.inputex.base = "libs/inputex/src/";
    YUI_config.groups.inputex.modules['inputex-rte'].requires = ['inputex-field', 'inputex-textarea'];
    YUI_config.groups.inputex.modules['inputex-color'].requires = ['inputex-field'];

    var currentEntity,
        TOOLBAR = {
            Color: {
                tab: "platforms",
                label: "Colored platform",
                form: [{
                        name: "color",
                        label: "Color",
                        type: "color"
                    }],
                value: {
                    components: "ColoredPlatform",
                    color: "red",
                    w: 100,
                    h: 100
                }
            },
            Invisible: {
                tab: "platforms",
                label: "Invisible platform",
                form: [],
                value: {
                    components: "Invisible",
                    w: 100,
                    h: 100
                }
            },
            Image: {
                tab: "image",
                thumbClass: "fa fa-file-image-o fa-4x",
                form: [{
                        name: "image",
                        label: "Image"
                    }],
                value: {
                    components: "WalloImage",
                    image: "assets/mario-platform.png",
                    w: 90,
                    h: 100
                }
            },
            Video: {
                tab: "video",
                thumbClass: "fa fa-file-video-o fa-4x",
                form: [{
                        name: "url",
                        label: "Url",
                        type: "url"
                    }],
                value: {
                    components: "Video",
                    url: "http://www.youtube.com/watch?v=xhrBDcQq2DM",
                    w: 320,
                    h: 280
                }
            },
            Text: {
                tab: "other",
                thumbClass: "fa fa-font fa-4x",
                form: [{
                        name: "text",
                        type: "html",
                        className: "inputEx-Field form-text"
                    }],
                value: {
                    components: "WalloText",
                    text: "Ipsem lorum",
                    w: 200,
                    h: 80
                }
            },
            QR: {
                tab: "other",
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
                    components: "QR",
                    w: 80,
                    h: 80,
                    foreground: "#000000",
                    background: "#ffffff"
                }
            },
            Lab_Porte: {
                tab: "platforms",
                thumbUrl: "assets/lab/porte.png",
                value: {
                    components: "Lab_Porte",
                    w: 120,
                    h: 170
                }
            },
            Gyrophare: {
                tab: "furniture",
                thumbUrl: "assets/lab/sprite_gyrophare_thumb.png",
                value: {
                    components: "Gyrophare",
                    w: 80,
                    h: 80
                }
            },
            Chimie: {
                tab: "platforms",
                thumbUrl: "assets/lab/sprite_chimie_thumb.png",
                value: {
                    components: "Chimie",
                    w: 160,
                    h: 160
                }
            },
            Jauge: {
                tab: "platforms",
                thumbUrl: "assets/lab/sprite_jauge_thumb.png",
                value: {
                    components: "Jauge",
                    w: 182,
                    h: 153
                }
            },
//            Serrure: {
//                tab: "platforms",
//                thumbUrl: "assets/lab/sprite_serrure_thumb.png",
//                value: {
//                    components: "Serrure",
//                    w: 95,
//                    h: 70
//                }
//            },
            Ventilo: {
                tab: "furniture",
                thumbUrl: "assets/lab/sprite_ventilo_thumb.png",
                value: {
                    components: "Ventilo",
                    w: 202,
                    h: 204
                }
            },
            Serveur: {
                tab: "platforms",
                thumbUrl: "assets/lab/sprite_serveur_thumb.png",
                value: {
                    components: "Serveur",
                    w: 115,
                    h: 180
                }
            },
            Lab_Falling: {
                tab: "platforms",
                thumbUrl: "assets/lab/sprite_plateforme_tombe_thumb.png",
                value: {
                    components: "Lab_Falling",
                    w: 128,
                    h: 100
                }
            },
//            Lab_MovingPlatform: {
//                tab: "platforms",
//                thumbUrl: "assets/lab/sprite_plateforme1.png",
//                value: {
//                    components: "Lab_MovingPlatform",
//                    w: 128,
//                    h: 100
//                }
//            },
            Lab_Plateform1: {
                tab: "platforms",
                thumbUrl: "assets/lab/sprite_plateforme1.png",
                value: {
                    components: "2D, Canvas, lab_plateforme1, MouseHover",
                    w: 128,
                    h: 128
                }
            }
//            Lab_Plateform2: {
//                tab: "platforms",
//                thumbUrl: "assets/lab/sprite_plateforme2.png",
//                value: {
//                    components: "2D, Canvas, lab_plateforme2",
//                    w: 153,
//                    h: 73
//                }
//            }
        },
    Edit = {
        /**
         *
         */
        init: function() {                                                      // Toggle fps button

            /**
             * Entity edition overlay
             */
            $(".wallo-crafty").prepend('<div class="wallo-edit-overlay"><div class="wallo-edit-dd"><div class="wallo-edit-menu"><div class="wallo-edit-destroy fa fa-trash"></div><div class="wallo-edit-editentity fa fa-pencil"></div></div></div></div>');

            var isDragging = false, over = false,
                overlay = $(".wallo-edit-dd"),
                cfg = {
                    containment: ".wallo-crafty",
                    //delay: 100,
                    //distance: 20,
                    handles: "ne, se, sw, nw",
                    start: function() {
                        Edit.isDragging = true;
                    },
                    resize: function() {
                        Edit.savePositions();
                    },
                    drag: function() {
                        Edit.savePositions();
                    },
                    stop: function() {
                        console.log("EditOverlay.stopDrag(over: " + over + ")");
                        Edit.savePositions();
                        Edit.isDragging = false;
                        if (!over) {
                            Edit.hideEdition();
                        }
                    }
                };
            overlay.draggable(cfg);                                             // Set up drag and drop on overlay
            overlay.resizable(cfg);
            overlay.on("mouseenter", function() {
                console.log("mouseenter");
                over = true;
            });
            overlay.on("mouseleave", function() {
                console.log("mouseleave(isDragging: " + Edit.isDragging + ")");
                over = false;
                if (!Edit.isDragging) {
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
                window.location = "/lobby";
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
                furniture: "",
                ennemy: "",
                image: "",
                video: "",
                other: ""
            };
            _.each(TOOLBAR, function(i, type) {                                 // Render toolbar elements
                if (!tabs[i.tab]) {
                    tabs[i.tab] = "";
                }
                var thumb, className = "";
                if (i.thumbUrl) {
                    thumb = "<img src='" + i.thumbUrl + "' />";
                    className = "wallo-thumb-img";
                } else {
                    thumb = "<div class='wallo-icon " + i.thumbClass + "'></div>";
                }
                tabs[i.tab] += "<div class='wallo-thumb wallo-thumb-" + type + " " + className + "' data-type='" + type + "' title='" + (i.label || type) + "'>"
                    + thumb + "</div>";
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
                        cfg.type = dropType;

                        $.App.cfg.entities.push(cfg);
                        var entity = Crafty.e(cfg.components).attr(cfg);
                        entity.cfg = cfg;
                    } catch (e) {
                        console.log("Unable to drop new object", e);
                    }
                }
            });
        },
        showEditOverlay: function(entity) {
            if (!Edit.isDragging) {
                $('.wallo-edit-overlay').show();
                $('.wallo-edit-dd').css("left", entity.x)
                    .css("top", entity.y)
                    .width(entity.w)
                    .height(entity.h);
                currentEntity = entity;
            }
        },
        hideEdition: function() {
            console.log("Edit.hideEdition(isDragging:" + Edit.isDragging + ")");
            if (!Edit.isDragging) {
                $('.wallo-edit-overlay').hide();
            }
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
            console.log("Edit.destroyEntity()");
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
