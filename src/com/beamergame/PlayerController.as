package com.beamergame {

	// *** Flash Imports *** //
	import com.pblabs.engine.entity.Entity;
	import flash.display.BitmapData;
    import flash.geom.Point;
    import flash.display.Sprite;
	import flash.geom.ColorTransform;
	import flash.geom.*;
	import flash.filters.*;
	
	// *** PBE Imports *** //
    import com.pblabs.box2D.CollisionEvent;
    import com.pblabs.engine.PBE;
	import com.pblabs.engine.entity.Entity;
    import com.pblabs.engine.components.TickedComponent;
    import com.pblabs.engine.core.InputMap;
    import com.pblabs.engine.entity.EntityComponent;
    import com.pblabs.engine.entity.PropertyReference;
    import com.pblabs.engine.debug.Logger;
	import com.pblabs.animation.AnimatorComponent;
	import com.pblabs.rendering2D.SpriteSheetRenderer;
	
    
    /**
     * Component responsible for translating keyboard input to forces on the
     * player entity.
     */
    public class PlayerController extends TickedComponent {
        [TypeHint(type="flash.geom.Point")]
        public var velocityReference:PropertyReference;
		public var rendererReference:SpriteSheetRenderer;
		public var animatorReference:AnimatorComponent;
		
		private var _jumping:Boolean = true;
        private var _inputMap:InputMap;
        private var _left:Number = 0;
        private var _right:Number = 0;
        private var _jump:Number = 0;
        private var _onGround:int = 0;
		
        public function get input():InputMap {
            return _inputMap;
        }
        
        public function set input(value:InputMap):void {
            _inputMap = value;
            if (_inputMap != null) {
                _inputMap.mapActionToHandler("GoLeft", _OnLeft);
                _inputMap.mapActionToHandler("GoRight", _OnRight);
                _inputMap.mapActionToHandler("Jump", _OnJump);
            }
        }
        
        public override function onTick(tickRate:Number):void {
            var move:Number = _right - _left;
            var velocity:Point = owner.getProperty(velocityReference);
            velocity.x = move * 100;
            
            if (_jump > 0) {
				//PBE.soundManager.play("../Assets/Sounds/testSound.mp3");
                velocity.y -= 200;
                _jump = 0;
				_jumping = true;
			}
			
            owner.setProperty(velocityReference, velocity);
        }
        
        protected override function onAdd():void {
            super.onAdd();
			
			var matrix:Array = new Array();
			//var name:String = this.owner.getProperty('name');
			var ownerE:com.pblabs.engine.entity.Entity = (owner as com.pblabs.engine.entity.Entity);
			if (ownerE.name == 'Player1') {
				matrix = matrix.concat([0, 0, 0, 0, 255]);// red
				matrix = matrix.concat([0, 0, 0, 0, 0]);// gree
				matrix = matrix.concat([0, 0, 0, 0, 0]);// blue
				matrix = matrix.concat([0, 0, 0, 1, 0]);// alpha
			} else {
				matrix = matrix.concat([0, 0, 0, 0, 0]);
				matrix = matrix.concat([0, 0, 0, 0, 0]);
				matrix = matrix.concat([0, 0, 0, 0, 255]);
				matrix = matrix.concat([0, 0, 0, 1, 0]);
			}
			
			var s:Sprite = (rendererReference.displayObject as Sprite);
			s.filters = [ new ColorMatrixFilter(matrix) ];
			
            owner.eventDispatcher.addEventListener(CollisionEvent.COLLISION_EVENT, _OnCollision);
            owner.eventDispatcher.addEventListener(CollisionEvent.COLLISION_STOPPED_EVENT, _OnCollisionEnd);
        }
        
        protected override function onRemove():void {
            super.onRemove();
            
            owner.eventDispatcher.removeEventListener(CollisionEvent.COLLISION_EVENT, _OnCollision);
            owner.eventDispatcher.removeEventListener(CollisionEvent.COLLISION_STOPPED_EVENT, _OnCollisionEnd);
        }
        
        private function _OnCollision(event:CollisionEvent):void {

			if (PBE.objectTypeManager.doesTypeOverlap(event.collidee.collisionType, "Platform")) {
                if (event.normal.y > 0.7)
                    _onGround++;
            }
            
            if (PBE.objectTypeManager.doesTypeOverlap(event.collider.collisionType, "Platform")) {
                if (event.normal.y < -0.7)
                    _onGround++;
									
				if ( _left + _right == 0 ) {
					animatorReference.play( "idle" );
				} else {
					animatorReference.play( "run" );
				}
            }
        }
        
        private function _OnCollisionEnd(event:CollisionEvent):void
        {
			if (PBE.objectTypeManager.doesTypeOverlap(event.collidee.collisionType, "Platform")) {
				trace("case 3");
                if (event.normal.y > 0.7)
                    _onGround--;
            }
            
            if (PBE.objectTypeManager.doesTypeOverlap(event.collider.collisionType, "Platform")) {
				trace("case 4");
                if (event.normal.y < -0.7)
                    _onGround--;
            }
        }
        
        private function _OnLeft(value:Number):void {
			rendererReference.scale = new  Point( -1, 1);
			if (_onGround > 0) {
				trace(rendererReference.scale);
				if (value == 0 ) {
					animatorReference.play( "idle" );
				} else {
					animatorReference.play( "run" );
				}
			}
            _left = value;
        }
        
        private function _OnRight(value:Number):void {
			rendererReference.scale = new  Point( 1, 1);
			if (_onGround > 0) {
				if (value == 0 ) {
					animatorReference.play( "idle" );
				} else {
					animatorReference.play( "run" );
				}
			}
			_right = value;
        }
        
        private function _OnJump(value:Number):void {
            if (_onGround > 0) {
                animatorReference.play( "jump" );
				_jump = value;
			}
        }
    }
}