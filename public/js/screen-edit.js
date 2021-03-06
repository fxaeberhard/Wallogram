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

    var currentEntity, Edit;
    Edit = {
        TOOLBAR: {
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
                        name: "url",
                        label: "Url"
                    }],
                value: {
                    components: "WalloImage",
                    url: "assets/pictue-placeholder.png",
                    w: 90,
                    h: 100
                }
            },
            Picture_Controller: {
                tab: "image",
                thumbUrl: "assets/controller-black-400.png",
                value: {
                    components: "WalloImage",
                    url: "assets/controller.png",
                    w: 100,
                    h: 57
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
			Lab_spawner: {
                tab: "platforms",
                thumbUrl: "assets/lab/cage.png",
                value: {
                    components: "Lab_Spawner",
                    w: 204,
                    h: 198,
                    boxedIn: true
                }
            },
            Lab_Teleport: {
	            tab: "platforms",
	            thumbUrl: "assets/lab/teleport.png",
	            form: [{
                        name: "label",
                        label: "Name of portal"
                    },
                    {
                        name: "target",
                        label: "Name of taget portal"
                    }],
	            value: {
		            components: "Lab_Teleport",
		            w: 50,
		            h: 50,
	            }
            },
            Lab_Falling: {
                tab: "platforms",
                thumbUrl: "assets/lab/sprite_plateforme_tombe_thumb.png",
                form: [{
                        name: "fallTime",
                        label: "Time until fall"
                    },
                    {
                        name: "recoverTime",
                        label: "Time until recover"
                    }],
                value: {
                    components: "Lab_Falling",
                    w: 128,
                    h: 100
                }
            },
            Garage_Window: {
                tab: "platforms",
                thumbUrl: "assets/mario/window.png",
                value: {
                    components: "Garage_Window",
                    w: 250,
                    h: 127
                }
            },
            Garage_Falling_Ledge: {
                tab: "platforms",
                thumbUrl: "assets/mario/ledge_thumb.png",
                form: [{
                        name: "fallTime",
                        label: "Time until fall",
                        type: "number"
                    },
                    {
                        name: "recoverTime",
                        label: "Time until recover",
                        type: "number"
                    }],
                value: {
                    components: "Garage_Falling_Ledge",
                    w: 150,
                    h: 21,
                    fallTime: 3,
                    recoverTime: 5
                }
            },
            Lab_Enemy: {
                tab: "ennemy",
                thumbUrl: "assets/lab/mechant_thumb.png",
                form: [{
                        name: "direction",
                        label: "Direction",
                        type: "select",
                        choices: ["left", "right"]
                    }],
                value: {
                    components: "Lab_Enemy",
                    w: 44,
                    h: 80,
                    z: 160,
                    direction: "left"
                }
            },
            Mario_Goomba: {
                tab: "ennemy",
                thumbUrl: "assets/mario/blue_goomba_thumb.png",
                form: [{
                        name: "direction",
                        label: "Direction",
                        type: "select",
                        choices: ["left", "right"]
                    }],
                value: {
                    components: "Mario_Goomba",
                    w: 45,
                    h: 45,
                    z: 160,
                    direction: "left"
                }
            },
            Garage_Sign: {
                tab: "platforms",
                thumbUrl: "assets/mario/sign.png",
                value: {
                    components: "Garage_Sign",
                    w: 400,
                    h: 340
                }
            },
            Garage_Target: {
                tab: "platforms",
                thumbUrl: "assets/mario/exit.png",
                value: {
                    components: "Garage_Target",
                    w: 159,
					h: 87
                }
            },
           Lab_MovingPlatform: {
               tab: "platforms",
               thumbUrl: "assets/lab/sprite_plateforme_move.png",
               form: [{
                        name: "yDiff",
                        label: "Vertical movement (- up, + down)",
                        type: "number"
                    },
                    {
                        name: "xDiff",
                        label: "Horizontal movement (- left, + right)",
                        type: "number"
                    },
                    {
                        name: "time",
                        label: "Time in seconds to go one way",
                        type: "number"
                    }],
                    
               value: {
                   components: "Lab_MovingPlatform",
                   w: 154,
                   h: 74,
                   xDiff: 100,
                   yDiff: 100,
                   time: 2
               }
           },
            Lab_Plateform1: {
                tab: "platforms",
                thumbUrl: "assets/lab/sprite_plateforme1.png",
                value: {
                    components: "2D, Canvas, lab_plateforme1, PlatForm, MouseHover",
                    w: 154,
                    h: 74
                }
            },
            Hotdog: {
                tab: "ennemy",
                thumbUrl: "assets/hotdog_thumb.png",
                form: [{
                        name: "direction",
                        label: "Direction",
                        type: "select",
                        choices: ["left", "right"]
                    }],
                value: {
                    components: "Hotdog",
                    w: 45,
                    h: 45,
                    z: 160,
                    direction: "left"
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
        position: "left",
        /**
         *
         */
        init: function() {                                                      // Toggle fps button

            /**
             * Entity edition overlay
             */
            this.initOverlay()

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
            $(".button-toggleLR").click(function() {
                if($.Edit.position == "left"){
	                $(".wallo-debugmode").removeClass("wallo-debugmode").addClass("wallo-debugmode-right")
	                $(".wallo-edit").removeClass("wallo-edit").addClass("wallo-edit-right")
	                $(".wallo-edit-toggle").removeClass("wallo-edit-toggle").addClass("wallo-edit-toggle-right")
	                $.Edit.position = "right"
                } else {
	                $(".wallo-debugmode-right").removeClass("wallo-debugmode-right").addClass("wallo-debugmode")
	                $(".wallo-edit-right").removeClass("wallo-edit-right").addClass("wallo-edit")
	                $(".wallo-edit-toggle-right").removeClass("wallo-edit-toggle-right").addClass("wallo-edit-toggle")
	                $.Edit.position = "left"
                }
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
            _.each(Edit.TOOLBAR, function(i, type) {                                 // Render toolbar elements
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
                            cfg = _.clone(Edit.TOOLBAR[dropType].value);

                        cfg.x = e.clientX - $("#tab-play").position().left - cfg.w / 2 + $(".wallo-play").scrollLeft();
                        cfg.y = e.clientY - cfg.h / 2 + $(".wallo-play").scrollTop();
                        cfg.type = dropType;

                        $.App.cfg.entities.push(cfg);
                        var entity = Crafty.e(cfg.components).attr(cfg);
                        entity.cfg = cfg;
                        Edit.autoSave();
                    } catch (e) {
                        console.log("Unable to drop new object", e);
                    }
                }
            });
        },
        initOverlay: function() {
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
        },
        showEditOverlay: function(entity) {
            if (!Edit.isDragging) {
                $('.wallo-edit-overlay').show();
                $('.wallo-edit-dd').css("left", entity.x)
                    .css("top", entity.y)
                    .width(entity.w)
                    .height(entity.h);
                currentEntity = entity;
                console.log("Edit.showEditOverlay(type: " + currentEntity.cfg.type + ")", currentEntity.cfg);
                if (Edit.TOOLBAR[currentEntity.cfg.type] && Edit.TOOLBAR[currentEntity.cfg.type].form) {
                    $(".wallo-edit-editentity").show();
                } else {
                    $(".wallo-edit-editentity").hide();
                }
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
            Edit.autoSave();
        },
        showEditForm: function() {
            var form,
                dialog = $('<div></div>').dialog({
                title: "Edit",
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
                fields: Edit.TOOLBAR[currentEntity.cfg.type].form,
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
            Edit.autoSave();
        },
        saveTimer: null,
        autoSave: function() {
            if ($.App.cfg.editable !== false) {
                clearTimeout(Edit.saveTimer);
                Edit.saveTimer = setTimeout(Edit.save, 800);
                $(".wallo-status-msg").text("Saving...");
            } else {
                $(".wallo-status-msg").text("Demo game, changes cannot be saved");
            }
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
                    $(".wallo-status-msg").text("All changes saved");
                    console.log('level saved');
                } else {
                    alert('Error: ' + response.msg);                            // If something goes wrong, alert the error message that our service returned
                }
            });
        }
    };
    $.Edit = Edit;                                                              // Set up global reference
}($));
