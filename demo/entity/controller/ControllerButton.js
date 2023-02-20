//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object of the ControllerButton class.
 *
 * @constructor
 * @extends rune.display.Sprite
 *
 * @param {number} x X position.
 * @param {number} y Y position.
 * @param {rune.input.Gamepad} gamepad Reference to the GamePad API.
 * @param {number} buttonID Button ID (according to W3C's spec).
 * @param {string} The name of the resource file to be used as a texture. 
 *
 * @class
 * @classdesc
 * 
 * Represents a button on a game controller.
 */
demo.entity.ControllerButton = function(x, y, gamepad, buttonID, GFX) {
    
    //--------------------------------------------------------------------------
    // Private properties (SCOPE BOUND)
    //--------------------------------------------------------------------------

    /**
     * Reference to the resource file used as texture.
     *
     * @type {HTMLImageElement}
     * @private
     */
    var resource = this.application.resources.get(GFX).data;
        
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Reference to the GamePad API.
     * 
     * @type {rune.input.Gamepad}
     * @private
     */
    this.m_gamepad = gamepad;
    
    /**
     * Button ID (according to W3C's spec).
     * 
     * @type {number}
     * @private
     */
    this.m_buttonID = buttonID || 0;

    //--------------------------------------------------------------------------
    //  Constructor call
    //--------------------------------------------------------------------------
    
    /**
     *  Extend Sprite.
     */
    rune.display.Sprite.call(this, x, y, resource.width >> 1, resource.height, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.ControllerButton.prototype = Object.create(rune.display.Sprite.prototype);
demo.entity.ControllerButton.prototype.constructor = demo.entity.ControllerButton;

//------------------------------------------------------------------------------
// Override public prototype methods
//------------------------------------------------------------------------------

/**
 * @override
 */
demo.entity.ControllerButton.prototype.init = function() {
    rune.display.Sprite.prototype.init.call(this);
    this.m_initAnimation();
};

/**
 * @override
 */
demo.entity.ControllerButton.prototype.update = function(step) {
    this.m_updateInput();
    rune.display.Sprite.prototype.update.call(this, step);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the button's animation sequence.
 * 
 * @return {undefined}
 * @private
 */
demo.entity.ControllerButton.prototype.m_initAnimation = function() {
    this.animation.create("inactive", [0], 1);
    this.animation.create("active",   [1], 1);

    this.animation.gotoAndStop("inactive");
};

/**
 * Updates the button's visual state.
 * 
 * @return {undefined}
 * @private
 */
demo.entity.ControllerButton.prototype.m_updateInput = function(step) {
    if (this.m_gamepad != null) {
        if (this.m_gamepad.pressed(this.m_buttonID)) this.animation.gotoAndStop("active");
        else this.animation.gotoAndStop("inactive");
    }
};