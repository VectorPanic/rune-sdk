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
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * Interval counter.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_interval = 1000;

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
	this.m_interval += this['application']['time']['step'];
	if (this.m_interval < 1000) {
		return;
	}

	this.m_interval = 0;
	var memory = window.performance && window.performance.memory;
	var value = "N/A";
	if (memory != null && typeof memory.usedJSHeapSize === "number") {
		value = rune.util.Math.formatBytes(memory.usedJSHeapSize, 1);
	}

	this['text'] = " " + value + " ";
	this['width'] = Math.max(54, this['textWidth']);
};