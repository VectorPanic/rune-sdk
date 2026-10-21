//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Scene000 object.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 *
 * Loads the demo scenes when the initial scene is selected.
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
        new demo.scene.Scene004(),
        new demo.scene.Scene005()
    ]);
};
