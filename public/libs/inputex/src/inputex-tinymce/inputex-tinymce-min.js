YUI.add("inputex-tinymce",function(c){var b=c.Lang,a=c.inputEx;a.TinyMCEField=function(d){if(!window.tinymce){alert("TinyMCE was not found on this page !")}a.TinyMCEField.superclass.constructor.call(this,d)};c.extend(a.TinyMCEField,a.Field,{defaultOpts:{mode:"textareas",language:"en",theme:"advanced",plugins:"paste",paste_auto_cleanup_on_paste:true,paste_remove_styles:true,paste_remove_styles_if_webkit:true,paste_strip_class_attributes:true,theme_advanced_buttons1:"formatselect,fontselect,fontsizeselect,|,bold,italic,underline,strikethrough,|,forecolor,backcolor",theme_advanced_buttons2:"justifyleft,justifycenter,justifyright,justifyfull,|,outdent,indent,blockquote,hr,|,bullist,numlist,|,link,unlink,image,|,removeformat,code,|,undo,redo",theme_advanced_buttons3:"",theme_advanced_toolbar_location:"top",theme_advanced_toolbar_align:"left",height:"200",verify_html:true,cleanup_on_startup:true,cleanup:true},setOptions:function(d){a.TinyMCEField.superclass.setOptions.call(this,d);this.options.opts=d.opts||this.defaultOpts},renderComponent:function(){if(!a.TinyMCEfieldsNumber){a.TinyMCEfieldsNumber=0}var e="inputEx-TinyMCEField-"+a.TinyMCEfieldsNumber;this.id=e;var d={id:e,className:"mceAdvanced"};if(this.options.name){d.name=this.options.name}this.el=a.cn("textarea",d);a.TinyMCEfieldsNumber+=1;this.fieldContainer.appendChild(this.el);this.editor=new tinymce.Editor(this.id,this.options.opts);c.later(0,this,function(){this.editor.render()})},setValue:function(f,d){var e=tinymce.get(this.id);if(e&&e.initialized){e.setContent(f,{format:"raw"})}else{this.editor.onInit.add(function(g){g.setContent(f,{format:"raw"})})}if(d!==false){this.fireUpdatedEvt()}},getValue:function(){var d=tinymce.get(this.id);if(d&&d.initialized){return d.getContent()}else{return null}},getText:function(){var d=tinymce.get(this.id);if(d&&d.initialized){return d.getContent({format:"raw"})}else{return null}}});a.registerType("tinymce",a.TinyMCEField,[])},"3.1.0",{requires:["inputex-field"]});