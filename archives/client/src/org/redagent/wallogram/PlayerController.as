/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
package org.redagent.wallogram {

	// *** Flash Imports *** //
	import Box2D.Common.Math.b2Vec2;
	import Box2D.Dynamics.Joints.*;
	
	import com.pblabs.animation.AnimatorComponent;
	import com.pblabs.box2D.Box2DSpatialComponent;
	import com.pblabs.box2D.CollisionEvent;
	import com.pblabs.engine.PBE;
	import com.pblabs.engine.components.TickedComponent;
	import com.pblabs.engine.core.InputMap;
	import com.pblabs.engine.entity.PropertyReference;
	import com.pblabs.rendering2D.SpriteSheetRenderer;
	
	import flash.display.Sprite;
	import flash.filters.*;
	import flash.geom.*;
	
	import mx.utils.ObjectUtil;
    
    /**
     * Component responsible for translating keyboard input to forces on the
     * player entity.
	 * 
	 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
     */
    public class PlayerController extends TickedComponent {
		
		[TypeHint(type="flash.geom.Point")]
        public var velocityReference:PropertyReference;
		public var rendererReference:SpriteSheetRenderer;
		public var animatorReference:AnimatorComponent;
		public var box2dReference:Box2DSpatialComponent;
		
		//public var STARTINGPOSITION:Point = new Point(-357, -130);
		public var STARTINGPOSITION:Point = new Point(280, 0);
		
		public var team:String;
		
		private var _chasing:Boolean = true;
        private var _inputMap:InputMap;
        private var _left:Number = 0;
        private var _right:Number = 0;
        private var _jump:Number = 0;
        private var _onGround:Boolean = false;
		private var _blinking:Boolean = true;
		
		private var _blinkCounter: Number = 0;
		private var _blinkCounterInter: Number = 0;
		
		private var _onGroundTime:Number = 0;
		private var _jointDef2:b2RevoluteJointDef = null;
		private var _joint:b2Joint = null;
		private var _target:Box2DSpatialComponent = null;
		
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
		public function resetPosition():void {
			this.box2dReference.position = STARTINGPOSITION;
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
				//PBE.soundManager.play("Sounds/testSound.mp3");
				if (_joint) {
					this.box2dReference.spatialManager.world.DestroyJoint(_joint);
					_joint = null;
					
					var s:Box2DSpatialComponent = (this.owner.lookupComponentByName("Spatial") as Box2DSpatialComponent);
					s.position = new Point(s.position.x, s.position.y - 50);
					//trace("moved" + s.position);
					velocity.y -= 60;
				} else {
					velocity.y -= 280;
				}
                _jump = 0;				
			}
			
			if (this._onGround) {
				this._onGroundTime++;
				if (_onGroundTime > 30 && _target != null) {
					this._target.canMove = true;
					this._target.canRotate = true;
					this._target = null;
					this._onGroundTime = 0;
				}
			} else {
				this._onGroundTime = 0;
			}
			
			if (_jointDef2 != null) {
				//var s:Box2DSpatialComponent = PBE.lookup("Explosion").lookupComponentByName("Spatial");
				//owner.lookupComponentByName("
				this._joint = this.box2dReference.spatialManager.world.CreateJoint(_jointDef2);
				this._jointDef2 = null;
			}
			
			if (this.box2dReference.position.y > 500) {
				this.resetPosition();
			}
			
            owner.setProperty(velocityReference, velocity);
			
			// Blinking mode
			if (this._blinking) {
				this._blinkCounterInter++;
				if (this._blinkCounterInter === 10) {		
					this._blinkCounter++;
					this._blinkCounterInter = 0;
					if (this._blinkCounter %2 === 0) {
						this.rendererReference.alpha = 100;
					} else {
						this.rendererReference.alpha = 0;
					}
					
					if (this._blinkCounter === 10) {
						this._blinking = false;
						this._blinkCounter = 0;
						this._blinkCounterInter = 0;
					}
				}
			}
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
			trace("PlayerController._OnCollision(" + event.collider.collisionType.typeName + ", "
				+ event.collidee.collisionType.typeName	+ ", normal: " + event.normal.y);
			
			// Collision event are not always in the same order (for js pad and keyboard players), normalize
			var	collidee:Box2DSpatialComponent = event.collidee,
				collider:Box2DSpatialComponent = event.collider,
				normal:Number = event.normal.y;
			if (PBE.objectTypeManager.doesTypeOverlap(event.collidee.collisionType, "Player")) {
				collidee = event.collider;
				collider = event.collidee;
				normal = -normal;
			}
			
			// When the player hits the ground, change state
		    if (PBE.objectTypeManager.doesTypeOverlap(collidee.collisionType, "Platform")) {
		        if (normal > 0.7) {
                    _onGround = true;
					
					if (_left + _right == 0) {
						animatorReference.play("idle");
					} else {
						animatorReference.play("run");
					}
				}
            }
			
			// When they touch players change color (chase game)
			if (PBE.objectTypeManager.doesTypeOverlap(collider.collisionType, "Player") &&
				PBE.objectTypeManager.doesTypeOverlap(collidee.collisionType, "Player") &&
				this.team == "blue" ) {
				this.setTeam("red");
			}
			// Player can grab plateform from the button
			if (PBE.objectTypeManager.doesTypeOverlap(collidee.collisionType, "Platform")
				&& collidee.owner["name"].indexOf("WPlateform") != -1) {
				
				// Plateform falls on collision
				this._target = collidee;
				
				// Player can grab platforms
				if (normal < -0.7) {
					this._onGround = true;
										
					_jointDef2 = new b2RevoluteJointDef();
					_jointDef2.localAnchor1 = new b2Vec2(0, 0);
					_jointDef2.localAnchor2 = new b2Vec2(0, 1);
					_jointDef2.collideConnected = false;
					_jointDef2.body1 = collider.body;
					_jointDef2.body2 = collidee.body;
					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();
				}
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
			trace("PlayerController._OnCollisionEnd(" + event.collider.collisionType.typeName + ", " + event.collidee.collisionType.typeName + ")");
			
			
			if (PBE.objectTypeManager.doesTypeOverlap(event.collidee.collisionType, "Player")) {
                if (event.normal.y < -0.7)
                    _onGround = false;
            }
            
            if (PBE.objectTypeManager.doesTypeOverlap(event.collider.collisionType, "Player")) {
                if (event.normal.y > 0.7)
                    _onGround = false;
            }
        }
        
        public function _OnLeft(value:Number):void {
			trace("onleft(val: " + value + ", onground: " + _onGround + ")");
			if (_onGround) {
				if (value == 0 ) {
					animatorReference.play( "idle" );
				} else {
					_right = 0;
					animatorReference.play( "run" );
				}
			}
            _left = value;
        }
        
        public function _OnRight(value:Number):void {
			trace("onRight(val: " + value + ", onground: " + _onGround + ")");
			if (_onGround) {
				if (value == 0 ) {
					animatorReference.play( "idle" );
				} else {
					_left = 0;
					animatorReference.play( "run" );
				}
			}
			_right = value;
        }
        
        public function _OnJump(value:Number):void {
			trace("onJump(val: " + value + ", onground: " + _onGround + ", joint: " + _joint + ")");          
			if (_joint != null) {
				_jump = value;
			} else if (_onGround) {
                animatorReference.play( "jump" );
				_jump = value;
			}
        }
    }
}
