/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
/**
 * @fileoverview
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
YUI.add("inputex-rte", function(Y) {
    "use strict";

    var inputEx = Y.inputEx, RTEField;

    /**
     * @class Wrapper for the Rich Text Editor from YUI
     * @name Y.inputEx.RTEField
     * @extends Y.inputEx.Textarea
     * @constructor
     * @param {Object} options
     */
    RTEField = function(options) {
        RTEField.superclass.constructor.call(this, options);
    };

    Y.extend(RTEField, inputEx.Textarea, {
        /**
         * Set the default values of the options
         * @param {Object} options Options object as passed to the constructor
         */
        setOptions: function(options) {
            RTEField.superclass.setOptions.call(this, options);

            this.options.opts = options.opts || {};
            this.options.typeInvite = null;
        },
        /**
         * 
         * @returns {undefined}
         */
        destroy: function() {
            if (this.editor) {
                try {
                    this.editor.destroy();
                } catch (e) {
                    // GOTCHA Editor may be out of dom and generate an exception
                }
            } else {
                Y.once("domready", function() {
                    try {
                        this.editor.destroy();
                    } catch (e) {
                        // GOTCHA Editor may be out of dom and generate an exception
                    }
                }, this);
            }
            RTEField.superclass.destroy.call(this);
        },
        /**
         * Render the field using the YUI Editor widget
         */
        renderComponent: function() {
            RTEField.superclass.renderComponent.call(this);
            Y.once("domready", function() {
                this.editor = new tinymce.Editor(this.el.id, {
                    selector: "textarea",
                    theme: "modern",
                    plugins: [
                        "advlist autolink autosave link image lists charmap print preview hr anchor pagebreak spellchecker",
                        "searchreplace wordcount visualblocks visualchars code fullscreen media nonbreaking",
                        "table contextmenu directionality emoticons template textcolor paste fullpage textcolor colorpicker textpattern"
                    ],
                    toolbar1: "bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | fontselect fontsizeselect | bullist numlist | outdent indent | removeformat",
                    toolbar2: "image media code | forecolor backcolor | subscript superscript | charmap | ltr rtl",
//                    plugins: [
//                        "autolink link image lists code media table contextmenu paste advlist textcolor"
//                            //"autoresize"
//                            //textcolor wordcount autosave advlist charmap print preview hr anchor pagebreak spellchecker directionality
//                    ],
//                    toolbar1: "bold italic bullist | link image media code addToolbarButton",
//                    toolbar2: "forecolor backcolor underline alignleft aligncenter alignright alignjustify table",
//                    toolbar3: "fontselect fontsizeselect styleselect",
                    // formatselect removeformat underline unlink forecolor backcolor anchor previewfontselect fontsizeselect styleselect spellchecker template
                    // contextmenu: "link image inserttable | cell row column deletetable | formatselect forecolor",
                    menubar: false,
                    statusbar: false,
                    relative_urls: false,
                    toolbar_items_size: 'small',
//                    hidden_tootlbar: [2, 3],
//                    file_browser_callback: this.onFileBrowserClick,
                    setup: Y.bind(function(editor) {
                        editor.on('change', Y.bind(this.fireUpdatedEvt, this));
                        this.editor = editor;
                    }, this),
                    image_advtab: true,
                    height: 300,
//                    autoresize_min_height: 35,
//                    autoresize_max_height: 500,
                    content_css: [
                        "css/tinymce.css"
                    ],
                    style_formats: [{// Style formats
                            title: 'Title 1',
                            block: 'h1'
                        }, {
                            title: 'Title 2',
                            block: 'h2'
                                // styles : {
                                //    color : '#ff0000'
                                // }
                        }, {
                            title: 'Title 3',
                            block: 'h3'
                        }, {
                            title: 'Normal',
                            inline: 'span'
                        }, {
                            title: "Code",
                            //icon: "code",
                            block: "code"
                        }]}, tinymce.EditorManager);

                //this.editor.on('change', Y.bind(this.sendUpdatedEvt, this));    // Update on editor update
                this.editor.render();

                //tinymce.createEditor(this.el.id, {});
                //tinymce.execCommand('mceAddEditor', false, this.el.id);
            }, this);
        },
        /**
         * Set the html content
         * @param {String} value The html string
         * @param {boolean} sendUpdatedEvt (optional) Wether this setValue should fire the 'updated' event or not (default is true, pass false to NOT send the event)
         */
        setValue: function(value, sendUpdatedEvent) {
            var tmceI = tinyMCE.get(this.el.id);
            RTEField.superclass.setValue.call(this, value, sendUpdatedEvent);

            if (tmceI) {
                tmceI.setContent(value);
            }
        },
        /**
         * Get the html string
         * @return {String} the html string
         */
        getValue: function() {
            tinyMCE.triggerSave();
            return RTEField.superclass.getValue.call(this);
        }
    });
    inputEx.registerType("html", RTEField, []);                                 // Register this class as "html" type
}, "1", {
    requires: "inputex-textarea"
});
