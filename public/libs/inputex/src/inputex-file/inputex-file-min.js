YUI.add("inputex-file",function(c){var b=c.Lang,a=c.inputEx;a.FileField=function(d){a.FileField.superclass.constructor.call(this,d)};a.FileField._id_count=0;c.extend(a.FileField,a.Field,{setOptions:function(d){a.FileField.superclass.setOptions.call(this,d);this.options.size=d.size;this.options.accept=d.accept},renderComponent:function(){var d={};d.id=this.divEl.id?this.divEl.id+"-field":("_inputex_fileid"+(a.FileField._id_count++));d.type="file";if(this.options.name){d.name=this.options.name}if(this.options.size){d.size=this.options.size}if(this.options.accept){d.accept=this.options.accept}this.el=a.cn("input",d);this.fieldContainer.appendChild(this.el)}});a.registerType("file",a.FileField)},"3.1.0",{requires:["inputex-field"]});