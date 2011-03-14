package com.beamergame {

	// *** Flash Imports *** //
	import Box2D.Common.Math.b2Vec2;
	import Box2D.Dynamics.Joints.*;
	import com.pblabs.engine.entity.Entity;
	import com.pblabs.engine.entity.IEntity;
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
	import com.pblabs.box2D.Box2DSpatialComponent;
    import com.pblabs.engine.PBE;
	
    
    /**
     * Component responsible for translating keyboard input to forces on the
     * player entity.
     */
    public class PlayerController extends TickedComponent {
        [TypeHint(type="flash.geom.Point")]
        public var velocityReference:PropertyReference;
		public var rendererReference:SpriteSheetRenderer;
		public var animatorReference:AnimatorComponent;
		public var box2dReference:com.pblabs.box2D.Box2DSpatialComponent;
		
		public var team:String;
		
		private var _chasing:Boolean = true;
		private var _jumping:Boolean = true;
        private var _inputMap:InputMap;
        private var _left:Number = 0;
        private var _right:Number = 0;
        private var _jump:Number = 0;
        private var _onGround:int = 0;
		
		private var _onGroundTime:Number = 0;
		private var _jointDef2:b2RevoluteJointDef = null;
		private var _joint:b2Joint = null;
		private var _target;
		
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
			//trace("Player.onTick(): ", _right, _left);
			
            var move:Number = _right - _left;
			
			if (move != 0) {
				rendererReference.scale = new Point( move, 1);
			}
			
            var velocity:Point = owner.getProperty(velocityReference);
            velocity.x = move * 100;
            
            if (_jump > 0) {
				//PBE.soundManager.play("../Assets/Sounds/testSound.mp3");
				if (_joint) {
					this.box2dReference.spatialManager.world.DestroyJoint(_joint);
					_joint = null;
					//this.
				}
				
                velocity.y -= 280;
                _jump = 0;
				_jumping = true;
				
			}
			
			if (_onGround > 0) {
				_onGroundTime++;
				if (_onGroundTime > 500) {
					var t = PBE.lookup("Explosion");
					var s:Box2DSpatialComponent = t.lookupComponentByName("Spatial");
					var a = t.lookupComponentByName("FrameAnimation");
					a.play( "explode" );
					s.position = _target.position;
					_target.owner.remove();
				}
			} else {
				_onGroundTime = 0;
			}
			
			if (_jointDef2 != null) {
				//var s:Box2DSpatialComponent = PBE.lookup("Explosion").lookupComponentByName("Spatial");
				//owner.lookupComponentByName("
				_joint = this.box2dReference.spatialManager.world.CreateJoint(_jointDef2);
				_jointDef2 = null;
			}
			
            owner.setProperty(velocityReference, velocity);
        }
        
        protected override function onAdd():void {
            super.onAdd();
			
			this.setTeam(this.team);
			
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
                if (event.normal.y < -0.7) {
                    _onGround++;
						
					if ( _left + _right == 0 ) {
						animatorReference.play( "idle" );
					} else {
						animatorReference.play( "run" );
					}
				}
				
				_target = event.collider;
				
				if ( event.normal.y > 0.7 ) {
				
					
					_jointDef2 = new b2RevoluteJointDef();
					_jointDef2.localAnchor1 = new b2Vec2(0, 0);
					_jointDef2.localAnchor2 = new b2Vec2(0, 0);
					
					_jointDef2.collideConnected = false;
					_jointDef2.body1 = event.collidee.body;
					_jointDef2.body2 = event.collider.body;
				//	event.contactPoint.
					//BE.
					//event.collider
					//PBE.scene.
					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();
					//_jointDef2.type
				}
            }
			
			if (PBE.objectTypeManager.doesTypeOverlap(event.collider.collisionType, "Player") &&
				PBE.objectTypeManager.doesTypeOverlap(event.collidee.collisionType, "Player") &&
				this.team == "blue" ) {
					this.setTeam("red");
			}
			
        }
        
		private function setTeam(team:String):void {
			this.team = team;
			trace("Player.setTeam(" + team + ")");
			var matrix:Array = new Array();
			
			if ( this.team == "red" ) {
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
		}
		
        private function _OnCollisionEnd(event:CollisionEvent):void {
			if (PBE.objectTypeManager.doesTypeOverlap(event.collidee.collisionType, "Platform")) {
                if (event.normal.y > 0.7)
                    _onGround--;
            }
            
            if (PBE.objectTypeManager.doesTypeOverlap(event.collider.collisionType, "Platform")) {
                if (event.normal.y < -0.7)
                    _onGround--;
            }
        }
        
        private function _OnLeft(value:Number):void {
			if (_onGround > 0) {
				if (value == 0 ) {
					animatorReference.play( "idle" );
				} else {
					animatorReference.play( "run" );
				}
			}
            _left = value;
        }
        
        private function _OnRight(value:Number):void {
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
            if (_onGround > 0 || _joint != null) {
                animatorReference.play( "jump" );
				_jump = value;
			}
        }
    }
}