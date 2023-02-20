//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new object.
 * 
 * @constructor
 * @extends rune.display.Sprite
 *
 * @param {number} x The digit's x position.
 * @param {number} y The digit's y position.
 * @param {number} width The digit's width.
 * @param {number} height The digit's height.
 * @param {string} texture The digit's texture.
 *
 * @class
 * @classdesc
 * 
 * The CounterDigit class represents a single digit in a numeric counter.
 */
rune.ui.CounterDigit = function(x, y, width, height, texture) {

	//--------------------------------------------------------------------------
	//  Constructor call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.display.Sprite.
	 */
	rune.display.Sprite.call(this, x, y, width, height, texture);
}

//------------------------------------------------------------------------------
//  Inheritance
//------------------------------------------------------------------------------

rune.ui.CounterDigit.prototype = Object.create(rune.display.Sprite.prototype);
rune.ui.CounterDigit.prototype.constructor = rune.ui.CounterDigit;

//------------------------------------------------------------------------------
//  Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The value of the digit.
 *
 * @member {number} value
 * @memberof rune.ui.CounterDigit
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.CounterDigit.prototype, "value", {
    /**
     * @this rune.ui.CounterDigit
     * @ignore
     */
    get : function() {
        return this.getValue();
    },
    
    /**
     * @this rune.ui.CounterDigit
     * @ignore
     */
    set : function(value) {
        this.setValue(value);
    }
});

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.CounterDigit.prototype.init = function() {
    rune.display.Sprite.prototype.init.call(this);
    this.m_initAnimation();
};

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Gets the value of the digit.
 *
 * @returns {number}
 */
rune.ui.CounterDigit.prototype.getValue = function() {
	var value = parseInt(this['animations'].current.name, 10);
	return rune.util.Math.clamp(value, 0, 9);
};

/**
 * Sets the value of the digit.
 *
 * @param {number} value The new value.
 *
 * @returns {undefined}
 */
rune.ui.CounterDigit.prototype.setValue = function(value) {
	value = rune.util.Math.clamp(parseInt(value, 10), 0, 9);
	this['animation'].gotoAndStop(value.toString());
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the animation sequence of the digit.
 *
 * @returns {undefined}
 */
rune.ui.CounterDigit.prototype.m_initAnimation = function() {
	this['animation'].create("0", [0], 1, true);
	this['animation'].create("1", [1], 1, true);
	this['animation'].create("2", [2], 1, true);
	this['animation'].create("3", [3], 1, true);
	this['animation'].create("4", [4], 1, true);
	this['animation'].create("5", [5], 1, true);
	this['animation'].create("6", [6], 1, true);
	this['animation'].create("7", [7], 1, true);
	this['animation'].create("8", [8], 1, true);
	this['animation'].create("9", [9], 1, true);
};