package com.pblabs.engine.components
{
    import com.pblabs.engine.PBE;
    import com.pblabs.engine.entity.EntityComponent;
    import com.pblabs.engine.core.IQueuedObject;
    import com.pblabs.engine.core.ProcessManager;
    
    /**
     * Base class for components which want to use think notifications.
     * 
     * <p>"Think notifications" allow a component to specify a time and
     * callback function which should be called back at that time. In this
     * way you can easily build complex behavior (by changing which callback
     * you pass) which is also efficient (because it is only called when 
     * needed, not every tick/frame). It is also light on the GC because
     * no allocations are required beyond the initial allocation of the
     * ThinkingComponent.</p>
     */
    public class ThinkingComponent extends EntityComponent implements IQueuedObject
    {
        protected var _nextThinkTime:int;
        protected var _nextThinkCallback:Function;
        
        /**
         * Schedule the next time this component should think. 
         * @param nextCallback Function to be executed.
         * @param timeTillThink Time in ms from now at which to execute the function (approximately).
         */
        public function think(nextCallback:Function, timeTillThink:int):void
        {
            _nextThinkTime = PBE.processManager.virtualTime + timeTillThink;
            _nextThinkCallback = nextCallback;

            PBE.processManager.queueObject(this);
        }
        
        override protected function onRemove() : void
        {
            super.onRemove();
            
            // Do not allow us to be called back if we are still
            // in the queue.
            _nextThinkCallback = null;
        }
            
        public function get nextThinkTime():Number
        {
            return _nextThinkTime;
        }
        
        public function get nextThinkCallback():Function
        {
            return _nextThinkCallback;
        }
        
        public function get priority():int
        {
            return -_nextThinkTime;
        }
        
        public function set priority(value:int):void
        {
            throw new Error("Unimplemented.");
        }
    }
}