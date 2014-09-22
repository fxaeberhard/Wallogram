/*
 * Wallogram
 * http://www.red-agent.com/wallogram
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
package org.redagent.wallogram {

	// *** Flash Imports *** //
	import Box2D.Dynamics.Joints.*;
	
	import flash.filters.*;
	import flash.geom.*;
	
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