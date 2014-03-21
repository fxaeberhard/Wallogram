package com.dozeo.pusheras.events
{
	import flash.events.Event;
	
	/**
	 * @author 
	 */
	public class PusherAuthenticationEvent extends Event
	{
		// const
		static public const SUCCESSFUL:String = 'successful';
		static public const FAILED:String = 'failed';
		
		// vars
		private var _signature:String;
		private var _channel_data:String;
		
		public function PusherAuthenticationEvent(type:String, signature:String = '', channel_data:String= "", bubbles:Boolean = false, cancelable:Boolean = false):void 
		{ 
			super(type, bubbles, cancelable);
			this._signature = signature;
			this._channel_data = channel_data;
		}
		
		public function get signature():String
		{
			return this._signature;
		}
		
		public function get channel_data():String
		{
			return this._channel_data;
		}
		
		override public function clone():Event 
		{ 
			return new PusherAuthenticationEvent(this.type, this._signature, this.channel_data, this.bubbles, this.cancelable);
		} 
		
		override public function toString():String 
		{ 
			return formatToString("PusherAuthenticationEvent", "type", "signature", "bubbles", "cancelable", "eventPhase"); 
		}
	}
}
