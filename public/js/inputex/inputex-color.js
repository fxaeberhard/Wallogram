/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
/**
 * @module inputex-url
 */
YUI.add("inputex-color", function(Y) {

    var lang = Y.Lang,
        inputEx = Y.inputEx;
    /**
     * @class inputEx.ColorField
     * @extends inputEx.StringField
     * @constructor
     * @param {Object} options inputEx.Field options object
     * <ul>
     *   <li>favicon: boolean whether the domain favicon.ico should be displayed or not (default is true, except for https)</li>
     * </ul>
     */
    inputEx.ColorField = function(options) {
        inputEx.ColorField.superclass.constructor.call(this, options);
    };
    Y.extend(inputEx.ColorField, inputEx.StringField, {
        /**
         * @method setOptions
         * @param {Object} options Options object as passed to the constructor
         */
        setOptions: function(options) {
            inputEx.ColorField.superclass.setOptions.call(this, options);
            this.options.size = 5;
        },
        /**
         * Adds a img tag before the field to display the favicon
         * @method render
         */
        render: function() {
            inputEx.ColorField.superclass.render.call(this);
            var that = this;
            $(this.el).ColorPicker({
                onChange: function(hsb, hex, rgb) {
                    $(that.el).val("#" + hex);
                    $(that.el).css("background", "#" + hex);
                },
                onBeforeShow: function() {
                    $(this).ColorPickerSetColor($(that.el).val());
                }
            })
                .bind('keyup', function() {
                    $(this).ColorPickerSetColor($(that.el).val());
                });
        },
        setValue: function(value, sendUpdatedEvt) {
            // call parent class method to set style and fire "updated" event
            inputEx.ColorField.superclass.setValue.call(this, value, sendUpdatedEvt);
            $(this.el).css("background", value);
        }
    });
    // Register this class as "color" type
    inputEx.registerType("color", inputEx.ColorField, []);
}, '3.1.0', {
    requires: ["inputex-string"]
});
