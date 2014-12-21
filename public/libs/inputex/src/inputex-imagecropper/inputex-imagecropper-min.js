YUI.add("inputex-imagecropper",function(c){var b=c.Lang,a=c.inputEx;a.ImageCropperField=function(d){a.ImageCropperField.superclass.constructor.call(this,d)};c.extend(a.ImageCropperField,a.Field,{setOptions:function(d){a.ImageCropperField.superclass.setOptions.call(this,d);this.options.url=d.url;this.options.ratio=b.isArray(d.ratio)?(d.ratio[0]/d.ratio[1]):null;this.options.padding=d.padding||10;this.options.minSize=b.isArray(d.minSize)?d.minSize:[0,0]},renderComponent:function(){this.wrapEl=c.Node.create('<div class="inputEx-ImageCropperField-wrapper" style="padding: '+this.options.padding+'px;" />');this.wrapEl.appendTo(this.fieldContainer);this.el=c.Node.create('<img src="'+this.options.url+'" />');this.el.appendTo(this.wrapEl);this.mask={};this.mask.n=c.Node.create('<div class="inputEx-ImageCropperField-mask inputEx-ImageCropperField-mask-n" style="top: 0; left: 0;"></div>').appendTo(this.wrapEl);this.mask.s=c.Node.create('<div class="inputEx-ImageCropperField-mask inputEx-ImageCropperField-mask-s" style="bottom: 0; left: 0;"></div>').appendTo(this.wrapEl);this.mask.e=c.Node.create('<div class="inputEx-ImageCropperField-mask inputEx-ImageCropperField-mask-e" style="right: 0; "></div>').appendTo(this.wrapEl);this.mask.w=c.Node.create('<div class="inputEx-ImageCropperField-mask inputEx-ImageCropperField-mask-w" style="left: 0;  "></div>').appendTo(this.wrapEl);this.mask.border=c.Node.create('<div class="inputEx-ImageCropperField-mask-border" style="left: 0;"></div>').appendTo(this.wrapEl);this.el.on("load",function(){var d=this.el.get("region");this.imageSize=[d.width,d.height];this.setValue(this.options.value?this.options.value:{origin:[0,0],size:this.imageSize},false)},this)},setValue:function(k,h){if(!this.imageSize){return}var g=this._constrain(c.clone(k));var j=this.options.padding,f=j+g.origin[1],o=j+g.origin[1]+g.size[1],i=j+g.origin[0]+g.size[0],l=j+g.origin[0],d=(j*2)+this.imageSize[0],m=(j*2)+this.imageSize[1];this.value=g;this.mask.n.setStyles({width:d,height:f});this.mask.s.setStyles({width:d,height:m-o});this.mask.e.setStyles({top:f,height:o-f,width:d-i});this.mask.w.setStyles({top:f,height:o-f,width:l});this.mask.border.setStyles({top:f-1,left:l-1,width:g.size[0],height:g.size[1]});if(h!==false){this.fireUpdatedEvt()}},getValue:function(){return this.value},initEvents:function(){this.mask.border.on("mousedown",this._onMouseDown,this);this.wrapEl.on("mousedown",this._onMouseDown,this)},_onMouseDown:function(f){f.halt(true);this.dragging=(f.target===this.mask.border);this.imageOrigin=this.el.getXY();var d=[f.pageX-this.imageOrigin[0],f.pageY-this.imageOrigin[1]];if(!this.dragging){this.firstOrigin=null;this.setValue({origin:d,size:[1,1]},false)}else{this.firstOrigin=d}c.one(document).on("mousemove",this._onMouseMove,this);c.one(document).once("mouseup",function(g){c.one(document).detach("mousemove",this._onMouseMove);this._onMouseMove(g);this.fireUpdatedEvt()},this)},_onMouseMove:function(i){i.halt(true);var g=this.imageOrigin,l=this.firstOrigin,k=Math.min(this.imageSize[0],Math.max(0,i.pageX-g[0])),j=Math.min(this.imageSize[1],Math.max(0,i.pageY-g[1])),f=k-l[0],d=j-l[1],h=[],m=[];if(this.dragging){h=this.value.size;m[0]=this.value.origin[0]+f;m[1]=this.value.origin[1]+d;this.firstOrigin=[k,j]}else{h=[Math.abs(f),Math.abs(d)];m[0]=(f<0?k:l[0]);m[1]=(d<0?j:l[1])}this.setValue({origin:m,size:h},false)},_constrain:function(h){var g=this.options.ratio,e=this.imageSize,d=this.options.minSize,j=h.origin,f=h.size;if(d){f=[Math.min(e[0],Math.max(d[0],f[0])),Math.min(e[1],Math.max(d[1],f[1]))]}if(g){if((f[0]/f[1])<g){f[1]=Math.round(f[0]/g)}else{f[0]=Math.round(f[1]*g)}}if(!this.dragging){if(!this.firstOrigin){this.firstOrigin=[Math.max(0,Math.min(e[0],j[0])),Math.max(0,Math.min(e[1],j[1]))]}else{if(j[0]<this.firstOrigin[0]){j[0]=this.firstOrigin[0]-f[0]}if(j[1]<this.firstOrigin[1]){j[1]=this.firstOrigin[1]-f[1]}}}j[0]=Math.max(0,Math.min(e[0]-f[0],j[0]));j[1]=Math.max(0,Math.min(e[1]-f[1],j[1]));return{origin:j,size:f}}});a.registerType("imagecropper",a.ImageCropperField)},"3.1.0",{requires:["inputex-field"]});