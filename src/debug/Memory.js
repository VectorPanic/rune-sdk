//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object.
 *
 * @constructor
 * @extends rune.text.BitmapField
 * @package
 *
 * @class
 * @classdesc
 * 
 * The Memory class is used to visualize the amount of memory that the current 
 * application allocates.
 */
rune.debug.Memory = function() {

	//--------------------------------------------------------------------------
	//  Constructor call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend BitmapField.
	 */
	rune.text.BitmapField.call(this, " 00.0 MB ");
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.debug.Memory.prototype = Object.create(rune.text.BitmapField.prototype);
rune.debug.Memory.prototype.constructor = rune.debug.Memory;

//------------------------------------------------------------------------------
// Override protected methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Memory.prototype.init = function() {
	rune.text.BitmapField.prototype.init.call(this);
	this['text'] = " 00.0 MB ";
	this['width'] = 54;
	this['backgroundColor'] = rune.util.Palette.GRAY;
};

/**
 * @inheritDoc
 */
rune.debug.Memory.prototype.update = function(step) {
	rune.text.BitmapField.prototype.update.call(this, step);
	this['text'] = " " + rune.util.Math.formatBytes(window.performance.memory.usedJSHeapSize, 1) + " ";
};