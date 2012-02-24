package
{
	
	import Box2D.Common.Math.b2Vec2;
	import Box2D.Dynamics.Joints.*;
	import Box2D.Dynamics.b2Body;
	
	import com.adobe.serialization.json.JSONDecoder;
	import com.adobe.serialization.json.JSONEncoder;
	import com.pblabs.animation.AnimatorComponent;
	import com.pblabs.box2D.Box2DDebugComponent;
	import com.pblabs.box2D.Box2DManagerComponent;
	import com.pblabs.box2D.Box2DSpatialComponent;
	import com.pblabs.box2D.CircleCollisionShape;
	import com.pblabs.box2D.CollisionEvent;
	import com.pblabs.box2D.PolygonCollisionShape;
	import com.pblabs.engine.PBE;
	import com.pblabs.engine.core.InputKey;
	import com.pblabs.engine.core.LevelEvent;
	import com.pblabs.engine.core.LevelManager;
	import com.pblabs.engine.entity.Entity;
	import com.pblabs.engine.entity.IEntity;
	import com.pblabs.engine.resource.Resource;
	import com.pblabs.rendering2D.BasicSpatialManager2D;
	import com.pblabs.rendering2D.DisplayObjectScene;
	import com.pblabs.rendering2D.SimpleSpatialComponent;
	import com.pblabs.rendering2D.SpriteRenderer;
	import com.pblabs.rendering2D.SpriteSheetRenderer;
	import com.pblabs.rendering2D.spritesheet.CellCountDivider;
	import com.pblabs.rendering2D.spritesheet.SpriteSheetComponent;
	import com.pblabs.rendering2D.ui.SceneView;
	import com.pusher.Pusher;
	import com.pusher.PusherConstants;
	import com.pusher.auth.PostAuthorizer;
	import com.pusher.channel.Channel;
	import com.pusher.events.PusherEvent;
	
	import flash.display.Loader;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.filters.*;
	import flash.geom.Point;
	import flash.net.URLRequest;
	import flash.text.*;
	import flash.utils.*;
	import flash.utils.Timer;
	import flash.xml.XMLDocument;
	import flash.xml.XMLNode;
	import flash.xml.XMLNodeType;
	
	import org.redagent.wallogram.PlayerController;
	
	public class Wallogram extends Sprite {
		
		private var currentScreen:Number = 0;
		private var tf:TextField = new TextField();
		private var startingPositions:Array = [ new Point(315, -250) , new Point(0, 0), new Point(0, 0), new Point(0, 0) ];
		
		private var sessionId:String = '222';	
		private static var pusherAppAuthKey:String = '9d4eb6ada84f3af3c77f';
		private static var pusherChannelPrefix:String = 'private-';
		private static var pusherAppId:String = '10827';
		private static var pusherSecretKey:String = 'c0ecc6aa74215d03cc22';
		private static var pusherAuthUrl:String = "http://localhost/wallogram/web/pusher_auth.php";
		private static var padUrl:String = "http://www.red-agent.com/wallogram/web/pad.php";
		private static var QRURL:String = "http://chart.apis.google.com/chart?cht=qr&chs=170x170&chld=Q&choe=UTF-8&chl=";
		
		private var pusher:Pusher;
		private var channel:Channel;
		private var players:Object = {};
		
		public function Wallogram() {
			this.initPusherWebsocket();
			this.initPBE();
			this.initLoggerTextField();
			this.initUI();
		}
		public function initPusherWebsocket():void {
			trace("Wallogram.initPusherWebsocket()");
			
			Pusher.log = function(msg:String):void {
				trace(msg);
			}
			Pusher.authorizer = new PostAuthorizer(Wallogram.pusherAuthUrl);
			
			this.pusher = new Pusher(Wallogram.pusherAppAuthKey, "test");
			this.channel = this.pusher.subscribe(Wallogram.pusherChannelPrefix + this.sessionId);
			this.channel.bind("client-pad-event", this.onClientPadEvent);
			this.channel.bind("client-connection", this.onClientConnection);
			
		}
		public function onPusherOpen(e:Event):void {
			trace("onPusherOpen");
			//this.dispatchPusherEvent("pusher:subscribe", { channel: "private" } );
			//this.dispatchPusherEvent("pusher:subscribe", { channel: "private-"+sessionId } );
			//this.dispatchPusherEvent("pusher:subscribe", { channel: "presence" } );
		}
		public function onClientPadEvent(data:Object):void {		
			trace("Wallogram.onClientPadEvent()", data);
			
			var p:IEntity = this.players[data.uid] as IEntity;
			var pc:PlayerController = PlayerController(p.lookupComponentByType(PlayerController));
			
			switch (data.button) {
				case "cross-down": 
					switch (data.position) {
						case "a": 
						case "b":
						case "top": 
							pc._OnJump(1);
							break;
						case "left":
							pc._OnLeft(1);
							break;
						case "right": 
							pc._OnRight(1);
							break;
					}
					break;
				
				case "cross-up": 
					switch (data.position) {
						case "a": 
						case "b":
						case "top": 
							pc._OnJump(0);
							break;
						case "left":
							pc._OnLeft(0);
							break;
						case "right": 
							pc._OnRight(0);
							break;
					}
					break;
			}
			return;			
		}
		public function onClientConnection(data: Object):void {
			this.initPlayer(data.uid);
		}
		
		public function initPBE():void {	
			// Make sure all the types our XML will use are registered.
			PBE.registerType(com.pblabs.rendering2D.DisplayObjectScene);
			PBE.registerType(com.pblabs.rendering2D.SpriteSheetRenderer);
			PBE.registerType(SpriteRenderer);
			PBE.registerType(com.pblabs.rendering2D.spritesheet.SpriteSheetComponent);
			PBE.registerType(com.pblabs.rendering2D.SimpleSpatialComponent);
			PBE.registerType(com.pblabs.rendering2D.BasicSpatialManager2D);
			PBE.registerType(com.pblabs.rendering2D.spritesheet.CellCountDivider);
			PBE.registerType(com.pblabs.rendering2D.ui.SceneView);
			PBE.registerType(com.pblabs.box2D.Box2DDebugComponent);
			PBE.registerType(com.pblabs.box2D.Box2DManagerComponent);
			PBE.registerType(com.pblabs.box2D.Box2DSpatialComponent);
			PBE.registerType(com.pblabs.box2D.PolygonCollisionShape);
			PBE.registerType(com.pblabs.box2D.CircleCollisionShape);
			PBE.registerType(com.pblabs.animation.AnimatorComponent);
			
			PBE.registerType(PlayerController);
			
			// Initialize the engine!
			PBE.startup(this);
			
			// Load resources.
			PBE.addResources(new Resources());
			
			// Set up the scene view.
			var sv:SceneView = new SceneView();
			sv.name = "MainView";
			sv.x = 0;
			sv.y = 0;
			sv.width = 1024;
			sv.height = 768;
			addChild(sv);
			
			LevelManager.instance.addEventListener(LevelEvent.LEVEL_LOADED_EVENT, this.onLevelLoaded);
			
			LevelManager.instance.load("levelDescriptions.xml", 1);		// Load the descriptions, and start up level 1.
			
		}
		
		public function getBody(name:String):b2Body {
			var f:Box2DSpatialComponent = PBE.lookupComponentByName(name, "Spatial") as Box2DSpatialComponent;
			return f.body;
		}
		public function createJoint(entity1:String, entity2:String):void {
			var t:Box2DManagerComponent = PBE.lookupComponentByName("SpatialDB", "Manager") as Box2DManagerComponent;
			
			var _jointDef:b2PrismaticJointDef = new b2PrismaticJointDef ();
			_jointDef.localAnchor1 = new b2Vec2(0, 1);
			_jointDef.body1 = this.getBody(entity1);
			_jointDef.localAnchor2 = new b2Vec2(0, 0);
			_jointDef.body2 = this.getBody(entity2);
			//_jointDef.collideConnected = false;
			_jointDef.enableLimit = true;
			
			t.world.CreateJoint(_jointDef);
		}
		
		public function initPlayer(uid:String):void {
			trace("Wallogram.initPlayer("+uid+")");
			
			var playerEntity:IEntity = PBE.templateManager.instantiateEntity("PlayerTemplate");
			var sc:Box2DSpatialComponent = Box2DSpatialComponent(playerEntity.lookupComponentByType(Box2DSpatialComponent));
			var pc:PlayerController = PlayerController(playerEntity.lookupComponentByType(PlayerController));
			sc.position = startingPositions[0];y
			this.players[uid] = playerEntity;
		}
		public function onLevelLoaded(e:LevelEvent):void {
			//this.initPlayer("test");
			
			this.createJoint("Window1", "WPlateform1");
			this.createJoint("Window12", "WPlateform12");
			this.createJoint("Window2", "WPlateform2");
			this.createJoint("Window22", "WPlateform22");
			this.createJoint("Window3", "WPlateform3");
			this.createJoint("Window32", "WPlateform32");
			this.createJoint("Window4", "WPlateform4");
			this.createJoint("Window42", "WPlateform42");
			this.createJoint("Window5", "WPlateform5");
			this.createJoint("Window52", "WPlateform52");
			
			
			this.createJoint("LWindow1", "LWPlateform1");
			this.createJoint("LWindow12", "LWPlateform12");
			this.createJoint("LWindow2", "LWPlateform2");
			this.createJoint("LWindow22", "LWPlateform22");
			this.createJoint("LWindow3", "LWPlateform3");
			this.createJoint("LWindow32", "LWPlateform32");
		}
		
		public function initUI():void {
			var myImageLoader:Loader = new Loader();
			var myImageLocation:URLRequest = new URLRequest(Wallogram.QRURL+escape(Wallogram.padUrl+"?sid="+this.sessionId));
			// load the bitmap data from the image source in the Loader instance
			myImageLoader.load(myImageLocation);
			// add the Loader instance to the display list
			this.addChild(myImageLoader);
		}
		
		public function initLoggerTextField():void {
			tf.text = "";
			this.addChild(tf);
			tf.width = 400;
			tf.height = 100;
			tf.x = 312;
			tf.y = 384;
			var format1:TextFormat = new TextFormat();
			format1.color = 0xFFFFFF;
			format1.align = "center";
			format1.font = "Arial";
			format1.size = 40;
			format1.bold = true;
			tf.setTextFormat(format1);
		}
		/*
		public function updateTitle(e:Event):void {
		this.currentScreen++;
		
		var format1:TextFormat = new TextFormat();
		format1.color = 0xFFFFFF;
		format1.align = "center";
		format1.font = "Arial";
		format1.size = 20;
		format1.bold = false;
		
		switch (this.currentScreen) {
		case 1:
		this.tf.text = "This is a rough sample of our game.";
		break;
		
		case 2:
		this.tf.text = "Neither visuals nor level design is definitive.";
		break;
		
		case 3:
		this.tf.text = "Red player have to catch blue ones.";
		break;
		
		case 4:
		this.tf.text = "Player 1 uses up, down, right and left\n Player2 uses w, a, s , d \n Player 3 uses j, i, k, l";
		break;
		
		case 5:
		this.removeChild(this.tf);
		this.startGame();
		break;
		}
		tf.setTextFormat(format1);
		}*/
	}
}