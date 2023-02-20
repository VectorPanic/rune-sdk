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
 * The Render class is used to visualize the amount of time that the current 
 * application spends in the rendering loop.
 */
rune.debug.Render = function() {

	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * Interval counter.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_interval = 0.0;

	/**
	 * Peak value.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_peak = 0.0;

	//--------------------------------------------------------------------------
	//  Constructor call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend BitmapField.
	 */
	rune.text.BitmapField.call(this, " 00 ");
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.debug.Render.prototype = Object.create(rune.text.BitmapField.prototype);
rune.debug.Render.prototype.constructor = rune.debug.Render;

//------------------------------------------------------------------------------
// Override protected methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Render.prototype.init = function() {
	rune.text.BitmapField.prototype.init.call(this);
	this['text'] = " 00 ";
	this['width'] = 24;
	this['backgroundColor'] = rune.util.Palette.GRAY;
};

/**
 * @inheritDoc
 */
rune.debug.Render.prototype.update = function(step) {
	rune.text.BitmapField.prototype.update.call(this, step);
	
	this.m_peak = Math.max(
		Math.round(this['application']['time']['render']['duration']),
		this.m_peak
	);

	this.m_interval += this['application']['time']['step'];
	if (this.m_interval >= 1000) {
		this.m_interval  = 0;
		
		this['text'] = " " + this.m_peak + " ";
		this.m_peak = 0.0;
	}
};