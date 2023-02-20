//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Application class.
 *
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * Entry point class.
 */
demo.system.Application = function() {

	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend (rune) Application.
	 */
	rune.system.Application.call(this, {
		developer: "com.vectorpanic",
		app: "demo",
		build: "0.0.0",
		scene: demo.scene.Scene000,
		resources: demo.data.Requests,
		useGamepads:true,
		useKeyboard:true,
		debug: true,
		framerate: 30,
		//screenResolutionX: 1280,
		//screenResolutionY: 720
	});
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.system.Application.prototype = Object.create(rune.system.Application.prototype);
demo.system.Application.prototype.constructor = demo.system.Application;