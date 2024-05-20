//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instances the Scene000 class.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 * 
 * The Scene000 class is a test scene within the Demo application.
 */
demo.scene.Scene000 = function() {

	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.scene.Scene.
	 */
	rune.scene.Scene.call(this, "scene000");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.scene.Scene000.prototype = Object.create(rune.scene.Scene.prototype);
demo.scene.Scene000.prototype.constructor = demo.scene.Scene000;

//------------------------------------------------------------------------------
// Override public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.scene.Scene000.prototype.onSelect = function() {
    //@note: It is not possible to change the scene directly by init().
	rune.scene.Scene.prototype.onSelect.call(this);
    this.application.scenes.load([
        new demo.scene.Scene001(),
        new demo.scene.Scene002(),
        new demo.scene.Scene003(),
        new demo.scene.Scene004()
    ]);
};