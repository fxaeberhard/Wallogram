YUI.add("inputex",function(c){var b=c.Lang;c.inputEx=function(d,f){var e=null,g;if(d.type){e=a.getFieldClass(d.type);if(!c.Lang.isFunction(e)){throw new Error("Missing inputEx module for type: '"+d.type+"' ?")}}else{e=d.fieldClass?d.fieldClass:a.StringField}g=new e(d);if(f){g.setParentField(f)}return g};var a=c.inputEx;c.mix(c.inputEx,{VERSION:"3.1.0",spacerUrl:YUI_config.groups.inputex.base+"inputex/assets/skins/sam/images/space.gif",stateEmpty:"empty",stateRequired:"required",stateValid:"valid",stateInvalid:"invalid",messages:null,widget:{},mixin:{},regexps:{email:/^[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+(?:\.[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,6}$/i,url:/^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(\:[0-9]{1,5})?(([0-9]{1,5})?\/.*)?$/i,password:/^[0-9a-zA-Z\x20-\x7E]*$/},typeClasses:{},browserAutocomplete:true,registerType:function(e,g,d,h){if(!b.isString(e)){throw new Error("inputEx.registerType: first argument must be a string")}if(!b.isFunction(g)){throw new Error("inputEx.registerType: second argument must be a function")}this.typeClasses[e]=g;var f=[];if(b.isArray(d)){f=d}if(g.superclass&&!h&&b.isArray(g.superclass.constructor.groupOptions)){f=g.superclass.constructor.groupOptions.concat(f)}g.groupOptions=f},getFieldClass:function(d){return b.isFunction(this.typeClasses[d])?this.typeClasses[d]:null},getType:function(d){for(var e in this.typeClasses){if(this.typeClasses.hasOwnProperty(e)){if(this.typeClasses[e]==d){return e}}}return null},getRawModulesFromDefinition:function(h){var g=h.type||"string",f=YUI_config.groups.inputex.modulesByType[g],e=[f||g],d=h.fields||h.availableFields||[];if(h.elementType){d.push(h.elementType)}c.Array.each(d,function(i){e=e.concat(this.getModulesFromDefinition(i))},this);return e},getModulesFromDefinition:function(e){var d=this.getRawModulesFromDefinition(e);return c.Object.keys(c.Array.hash(d))},use:function(g,e){var d,f=[];if(!c.Array.test(g)){d=[g]}else{d=g}c.each(d,function(h){f=f.concat(this.getModulesFromDefinition(h))},this);f.push(e);c.use.apply(c,f)},sn:function(g,f,d){if(!g){return}var e;if(f){for(e in f){var j=f[e];if(b.isFunction(j)){continue}if(e=="className"){e="class";g.className=j}if(j!==g.getAttribute(e)){try{if(j===false){g.removeAttribute(e)}else{g.setAttribute(e,j)}}catch(h){}}}}if(d){for(e in d){if(b.isFunction(d[e])){continue}if(g.style[e]!=d[e]){g.style[e]=d[e]}}}},cn:function(d,h,e,j){if(d=="input"&&c.UA.ie&&c.UA.ie<9){var g="<"+d;if(h!=="undefined"){for(var f in h){g+=" "+(f==="className"?"class":f)+'="'+h[f]+'"'}}g+="/>";return document.createElement(g)}else{var i=document.createElement(d);this.sn(i,h,e);if(j){i.innerHTML=j}return i}},indexOf:function(h,d,g){var e=d.length,f;if(!b.isFunction(g)){g=function(i,j){return i===j}}for(f=0;f<e;f++){if(g.call({},h,d[f])){return f}}return -1},compactArray:function(d){var g=[],e=d.length,f;for(f=0;f<e;f++){if(!b.isNull(d[f])&&!b.isUndefined(d[f])){g.push(d[f])}}return g},removeAccents:function(d){return d.replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[ìíîï]/g,"i").replace(/[òóôõö]/g,"o").replace(/[ùúûü]/g,"u").replace(/[ýÿ]/g,"y").replace(/[ñ]/g,"n").replace(/[ç]/g,"c").replace(/[œ]/g,"oe").replace(/[æ]/g,"ae")},htmlEntities:function(d){return d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}})},"3.1.0",{requires:["pluginhost-base","pluginhost-config","base-pluginhost","node-pluginhost","plugin","node","intl"]});