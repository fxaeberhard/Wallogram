YUI.add("inputex-smdtester",function(c){var b=c.Lang,a=c.inputEx;a.RPC.SMDTester=function(e,f){this.el=document.getElementById(e);var d="select smd";a({type:"select",label:"SMD",parentEl:this.el,choices:[{value:d}].concat((function(){var g=[],h,j;for(h=0,j=f.length;h<j;h+=1){g.push({value:f[h]})}return g}())),description:"Select the Service Mapping Description file"}).on("updated",function(h){var g=h;if(g!=d){this.loadSMD(g)}},this,true);this.smdDescriptionEl=a.cn("p");this.el.appendChild(this.smdDescriptionEl);this.serviceMethodEl=a.cn("div");this.el.appendChild(this.serviceMethodEl);this.methodDescriptionEl=a.cn("p");this.el.appendChild(this.methodDescriptionEl);this.formContainerEl=a.cn("div");this.el.appendChild(this.formContainerEl);this.treeContainerEl=a.cn("div");this.treeContainerEl.appendChild(a.cn("p",null,null,"Results :"));this.el.appendChild(this.treeContainerEl)};a.RPC.SMDTester.prototype={loadSMD:function(d){this.serviceMethodEl.innerHTML="";this.formContainerEl.innerHTML="";this.service=new a.RPC.Service(d,{success:this.onServiceLoaded,scope:this})},onServiceLoaded:function(){this.smdDescriptionEl.innerHTML=(c.Lang.isString(this.service._smd.description))?this.service._smd.description:"";var e="select a method";var g=[e];for(var f in this.service){if(this.service.hasOwnProperty(f)&&c.Lang.isFunction(this.service[f])){g.push({value:f})}}var d=a({type:"select",parentEl:this.serviceMethodEl,choices:g,label:"Method",description:"Select the method"});d.on("updated",function(i){var h=i;if(h!=e){this.onServiceMethod(h)}},this,true);if(g.length==2){d.setValue(g[1])}},onServiceMethod:function(d){this.methodDescriptionEl.innerHTML=(c.Lang.isString(this.service[d].description))?this.service[d].description:"";this.formContainerEl.innerHTML="";a.RPC.generateServiceForm(this.service[d],{parentEl:this.formContainerEl},{success:function(e){this.treeContainerEl.innerHTML="";new a.widget.JsonTreeInspector(this.treeContainerEl,e)},scope:this})}}},"3.1.0",{requires:["inputex"]});