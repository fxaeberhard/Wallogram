package org.redagent.wallogram {

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

    /**
     * Component responsible for translating keyboard input to forces on the
     * player entity.
	 * 
	 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
     */
    public class PlatformController {
		var breakable:Boolean = false;

        /*public override function onTick(tickRate:Number):void {
			
        }*/
        
        protected override function onAdd():void {
            super.onAdd();
            //owner.eventDispatcher.addEventListener(CollisionEvent.COLLISION_EVENT, _OnCollision);
            //owner.eventDispatcher.addEventListener(CollisionEvent.COLLISION_STOPPED_EVENT, _OnCollisionEnd);
        }
        
        protected override function onRemove():void {
            super.onRemove();
            //owner.eventDispatcher.removeEventListener(CollisionEvent.COLLISION_EVENT, _OnCollision);
            //owner.eventDispatcher.removeEventListener(CollisionEvent.COLLISION_STOPPED_EVENT, _OnCollisionEnd);
        }
    }
}