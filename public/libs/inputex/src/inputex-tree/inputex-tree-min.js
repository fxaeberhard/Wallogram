YUI.add("inputex-tree",function(c){var b=c.Lang,a=c.inputEx;a.TreeField=function(d){a.TreeField.superclass.constructor.call(this,d)};c.extend(a.TreeField,a.ListField,{renderSubField:function(h){var f=a.cn("div");var d=a.cn("img",{src:a.spacerUrl,className:"inputEx-ListField-delButton"});c.one(d).on("click",this.onDelete,this,true);f.appendChild(d);var g=new a.TreeField({parentNode:this,elementType:this.options.elementType,value:h});var e=g.getEl();c.one(e).setStyle("marginLeft","4px");c.one(e).setStyle("float","left");f.appendChild(e);g.on("updated",this.onChange,this,true);f.appendChild(a.cn("div",null,{clear:"both"}));this.childContainer.appendChild(f);return g},renderComponent:function(){this.addButton=a.cn("img",{src:a.spacerUrl,className:"inputEx-ListField-addButton"});c.one(this.addButton).setStyle("float","left");this.fieldContainer.appendChild(this.addButton);this.subField=a(this.options.elementType,this);var d=this.subField.getEl();c.one(d).setStyle("marginLeft","4px");c.one(d).setStyle("float","left");this.fieldContainer.appendChild(d);this.fieldContainer.appendChild(a.cn("div",null,{clear:"both"},this.options.listLabel));this.childContainer=a.cn("div",{className:"inputEx-ListField-childContainer"});this.fieldContainer.appendChild(this.childContainer)},setValue:function(e,d){this.subField.setValue(e.value,false);a.TreeField.superclass.setValue.call(this,e.childValues,d)},getValue:function(){var d={value:this.subField.getValue(),childValues:a.TreeField.superclass.getValue.call(this)};return d}});a.registerType("tree",a.TreeField)},"3.1.0",{requires:["inputex-string","inputex-list","inputex-inplaceedit"]});