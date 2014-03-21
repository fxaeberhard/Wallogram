// Copyright (c) 2012 dozeo GmbH
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

package com.dozeo.pusheras.channel
{
	import com.dozeo.pusheras.Pusher;
	import com.dozeo.pusheras.auth.PusherAuthenticator;
	import com.dozeo.pusheras.events.PusherAuthenticationEvent;
	import com.dozeo.pusheras.events.PusherChannelEvent;
	import com.dozeo.pusheras.events.PusherEvent;
	import com.dozeo.pusheras.utils.PusherConstants;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;

	/**
	 * Pusher <http://pusher.com> Channel
	 * @author Tilman Griesel <https://github.com/TilmanGriesel> - dozeo GmbH <http://dozeo.com>
	 */
	public class PusherChannel extends EventDispatcher
	{
		static public const PUBLIC:String = 'public';
		static public const PRIVATE:String = 'private';
		static public const PRESENCE:String = 'presence';
		
		private var _type:String;
		private var _name:String;
		private var _pusherEventDispatcherCallback:Function;
		private var _authenticationSignature:String = '';
		private var _channel_data:String = "";
		
		private var _authenticationRequired:Boolean;
		private var _socketID:String;
		private var _authenticationEndPoint:String;
		
		public function PusherChannel(type:String, name:String, pusherEventDispatcherCallback:Function,
									  authenticationRequired:Boolean = false, socketID:String = '',
									  authenticationEndPoint:String = '')
		{
			// copy vars
			this._type = type;
			this._name = name;
			this._pusherEventDispatcherCallback = pusherEventDispatcherCallback;
			
			this._authenticationRequired = authenticationRequired;
			this._socketID = socketID;
			this._authenticationEndPoint = authenticationEndPoint;

		}
		
		public function init():void
		{
			// if authentication is required (private / presence channels) load the signature from the server
			// and dispatch the complete event after it
			// else dispatch complete event immediately
			if(_authenticationRequired)
			{
				if(_authenticationEndPoint == '')
					throw new Error('The authentication endpoint cannot be empty if authentication is enabled!');
				
				authenticate(_socketID, _authenticationEndPoint);
			}
			else
			{
				this.dispatchEvent(new PusherEvent(PusherChannelEvent.SETUP_COMPLETE));
			}
		}
		
		/**
		 * Dispatch pusher event on the channel
		 * notice: the channel name and the "client" prefix will be set
		 * automatically 
		 * @param Pusher event
		 * */
		public function dispatchPusherEvent(event:PusherEvent):void
		{
			if(_pusherEventDispatcherCallback == null)
				return;
			
			event.channel = _name;
			event.event = PusherConstants.CLIENT_EVENT_NAME_PREFIX + event.event;
			
			event.data.auth = _authenticationSignature;
			_pusherEventDispatcherCallback(event);
		}
		
		private function authenticate(socketID:String, authenticationEndPoint:String):void
		{
			var pusherAuthenticator:PusherAuthenticator = new PusherAuthenticator();
			pusherAuthenticator.addEventListener(PusherAuthenticationEvent.SUCCESSFUL, pusherAuthenticator_SUCESSFULL, false, 0, true);
			pusherAuthenticator.addEventListener(PusherAuthenticationEvent.FAILED, pusherAuthenticator_FAILED, false, 0, true);
			
			pusherAuthenticator.authenticate(socketID, authenticationEndPoint, _name);
		}
		
		protected function pusherAuthenticator_SUCESSFULL(event:PusherAuthenticationEvent):void
		{
			_authenticationSignature = event.signature;
			this._channel_data = event.channel_data;
			this.dispatchEvent(new PusherEvent(PusherChannelEvent.SETUP_COMPLETE));
		}
		
		protected function pusherAuthenticator_FAILED(event:PusherAuthenticationEvent):void
		{
			this.dispatchEvent(new PusherEvent(PusherChannelEvent.SETUP_FAILED));
		}
		
		/**
		 * Returns the channel name
		 * @return channel name
		 * */
		public function get name():String
		{
			return _name;
		}
		
		/**
		 * Sets the channel name
		 * @param channel name
		 * */
		public function set name(value:String):void
		{
			_name = value;
		}
		
		public function set pusherEventDispatcherCallback(value:Function):void
		{
			_pusherEventDispatcherCallback = value;
		}

		public function get authenticationSignature():String
		{
			return _authenticationSignature;
		}
		
		public function get type():String
		{
			return _type;
		}
		public function get channel_data():String
		{
			return _channel_data;
		}

	}
}