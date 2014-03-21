// Copyright (c) 2012 dozeo GmbH
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

package com.dozeo.pusheras.vo
{
	/**
	 * Pusher <http://pusher.com> Pusher Staus Storage Object
	 * @author Tilman Griesel <https://github.com/TilmanGriesel> - dozeo GmbH <http://dozeo.com>
	 */
	public final class PusherStatus
	{
		private var _connected:Boolean = false;
		private var _connecting:Boolean = false;
		
		public function PusherStatus():void 
		{ 
		}
		
		public function get connected():Boolean
		{
			return this._connected;
		}
		
		public function set connected(value:Boolean):void
		{
			this._connected = value;
			
			if(value == true)
				_connecting = false;
		}
		
		public function get connecting():Boolean
		{
			return this._connecting;
		}
		
		public function set connecting(value:Boolean):void
		{
			this._connecting = value;
		}
		
	}
}