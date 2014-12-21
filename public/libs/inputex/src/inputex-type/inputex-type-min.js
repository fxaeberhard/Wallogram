YUI.add("inputex-type",function(c){var b=c.Lang,a=c.inputEx;a.TypeField=function(d){a.TypeField.superclass.constructor.call(this,d)};c.extend(a.TypeField,a.Field,{renderComponent:function(){this.fieldValueWrapper=a.cn("div",{className:"inputEx-TypeField-FieldValueWrapper"});this.fieldContainer.appendChild(this.fieldValueWrapper);this.propertyPanel=a.cn("div",{className:"inputEx-TypeField-PropertiesPanel"},{display:"none"});var d=[];for(var e in a.typeClasses){if(a.typeClasses.hasOwnProperty(e)){d.push({value:e})}}this.typeSelect=new a.SelectField({label:"Type",choices:d,parentEl:this.propertyPanel});this.groupOptionsWrapper=a.cn("div");this.propertyPanel.appendChild(this.groupOptionsWrapper);this.button=a.cn("div",{className:"inputEx-TypeField-EditButton"});this.button.appendChild(this.propertyPanel);this.fieldContainer.appendChild(this.button);this.rebuildGroupOptions()},initEvents:function(){a.TypeField.superclass.initEvents.call(this);c.one(this.button).on("click",this.onTogglePropertiesPanel,this,true);c.one(this.propertyPanel).on("click",function(d){d.stopPropagation()},this,true);this.typeSelect.on("updated",this.rebuildGroupOptions,this,true)},rebuildGroupOptions:function(){try{var d=null;if(this.group){d=this.group.getValue();this.group.close();this.group.destroy();this.groupOptionsWrapper.innerHTML=""}var g=a.getFieldClass(this.typeSelect.getValue());var e={fields:g.groupOptions,parentEl:this.groupOptionsWrapper};this.group=new a.Group(e);if(d){this.group.setValue({name:d.name,label:d.label})}this.group.on("updated",this.onChangeGroupOptions,this,true);this.updateFieldValue()}catch(f){if(c.Lang.isObject(window.console)&&c.Lang.isFunction(window.console["log"])){console.log("inputEx.TypeField.rebuildGroupOptions: ",f)}}},onTogglePropertiesPanel:function(){if(this.propertyPanel.style.display=="none"){this.propertyPanel.style.display="";c.one(this.button).addClass(this.button,"opened")}else{this.propertyPanel.style.display="none";c.one(this.button).removeClass("opened")}},onChangeGroupOptions:function(){this.updateFieldValue();this.fireUpdatedEvt()},updateFieldValue:function(){try{if(this.fieldValue){this.fieldValue.close();this.fieldValue.destroy();delete this.fieldValue;this.fieldValueWrapper.innerHTML=""}var e=this.group.getValue();e.type=this.getValue().type;e.parentEl=this.fieldValueWrapper;this.fieldValue=a(e,this);this.fieldValue.on("updated",this.fireUpdatedEvt,this,true)}catch(d){if(c.Lang.isObject(window.console)&&c.Lang.isFunction(window.console["log"])){console.log("Error while updateFieldValue",d.message)}}},setValue:function(f,d){this.typeSelect.setValue(f.type,false);this.rebuildGroupOptions();this.group.setValue(f,false);this.updateFieldValue();var e=this;if(!b.isUndefined(f.value)){setTimeout(function(){e.fieldValue.setValue(f.value,false)},50)}if(d!==false){this.fireUpdatedEvt(false)}},getValue:function(){var i=function(k,n){var j,l=k.groupOptions.length,m;for(j=0;j<l;j++){m=k.groupOptions[j];if(m.name==n){return m.value}}return undefined};var e=this.group.getValue();var h=a.getFieldClass(this.typeSelect.getValue());for(var g in e){if(e.hasOwnProperty(g)){var f=i(h,g);var d=e[g];if(f==d){e[g]=undefined}}}e.type=this.typeSelect.getValue();if(this.fieldValue){e.value=this.fieldValue.getValue()}return e}});a.registerType("type",a.TypeField,[])},"3.1.0",{requires:["inputex-field","inputex-group","inputex-select","inputex-list","inputex-string","inputex-checkbox","inputex-integer"]});