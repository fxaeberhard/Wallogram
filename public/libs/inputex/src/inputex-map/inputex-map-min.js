YUI.add("inputex-map",function(c){var b=c.Lang,a=c.inputEx;a.MapFieldGlobals={yahoo_preloader_error:1,lat:43.648565,lon:-79.385329,uzoom:-13,api:"google",api_key:""};a.MapField=function(d){a.MapField.superclass.constructor.call(this,d)};c.extend(a.MapField,a.Field,{setOptions:function(d){a.MapField.superclass.setOptions.call(this,d);this.options.className=d.className||"inputEx-Field inputEx-MapField";this.options.width=d.width||"400px";this.options.height=d.height||"400px";this.options.loading=d.loading||"loading....";this.options.lat=d.lat||a.MapFieldGlobals.lat;this.options.lon=d.lon||a.MapFieldGlobals.lon;this.options.uzoom=d.uzoom||a.MapFieldGlobals.uzoom;this.options.api=d.api||a.MapFieldGlobals.api;this.options.api_key=d.api_key||a.MapFieldGlobals.api_key;this.options.mapType=d.mapType||a.MapFieldGlobals.mapType},renderComponent:function(){if(!a.MapFieldsNumber){a.MapFieldsNumber=0}else{a.MapFieldsNumber++}this.options.api="google";var i="inputEx-MapField-"+a.MapFieldsNumber;var h="inputEx-MapFieldWrapper-"+a.MapFieldsNumber;var e="inputEx-MapFieldLat-"+a.MapFieldsNumber;var g="inputEx-MapFieldLon-"+a.MapFieldsNumber;var f="inputEx-MapFieldUZoom-"+a.MapFieldsNumber;this.elWrapper=a.cn("div",{id:h,style:"width: "+this.options.width+"; height: "+this.options.height},null,null);this.fieldContainer.appendChild(this.elWrapper);this.el=a.cn("div",{id:i,style:"position: relative; width: "+this.options.width+"; height: "+this.options.height},null,this.options.loading);this.elWrapper.appendChild(this.el);this.elLat=a.cn("input",{id:e,type:"hidden",value:this.options.lat});this.fieldContainer.appendChild(this.elLat);this.elLon=a.cn("input",{id:g,type:"hidden",value:this.options.lon});this.fieldContainer.appendChild(this.elLon);this.elZoom=a.cn("input",{id:f,type:"hidden",value:this.options.uzoom});this.fieldContainer.appendChild(this.elZoom);var d={center:new google.maps.LatLng(this.options.lat,this.options.lon),zoom:this.options.uzoom,mapTypeId:google.maps.MapTypeId[this.options.mapType]};this.map=new google.maps.Map(this.el,d)},initEvents:function(){var d=this;google.maps.event.addListener(this.map,"click",function(f){d.setValue({lat:f.latLng.Xa,lon:f.latLng.Ya,uzoom:d.map.getZoom()});if(this.marker){this.marker.setPosition(f.latLng)}else{this.marker=new google.maps.Marker({position:f.latLng,map:d.map,title:"Hello World!"})}})},setValue:function(d){if(d.uzoom){this.elZoom.value=d.uzoom}if(d.lat){this.elLat.value=d.lat}if(d.lon){this.elLon.value=d.lon}},getValue:function(){if(!this.elLat){return{}}return{lat:this.elLat.value,lon:this.elLon.value,uzoom:this.elZoom.value}}});a.registerType("map",a.MapField)},"3.1.0",{requires:["inputex-field"]});