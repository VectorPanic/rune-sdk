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
 * The Update class is used to visualize the amount of time that the current 
 * application spends in the update loop.
 */
rune.debug.Update = function() {

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

rune.debug.Update.prototype = Object.create(rune.text.BitmapField.prototype);
rune.debug.Update.prototype.constructor = rune.debug.Update;

//------------------------------------------------------------------------------
// Override protected methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Update.prototype.init = function() {
	rune.text.BitmapField.prototype.init.call(this);
	this.text = " 00 ";
	this.width = 24;
	this.backgroundColor = rune.util.Palette.GRAY;
};

/**
 * @inheritDoc
 */
rune.debug.Update.prototype.update = function(step) {
	rune.text.BitmapField.prototype.update.call(this, step);
	
	this.m_peak = Math.max(
		Math.round(this['application'].time.update.duration),
		this.m_peak
	);

	this.m_interval += this['application']['time']['step'];
	if (this.m_interval >= 1000) {
		this.m_interval  = 0;
		
		this.text = " " + this.m_peak + " ";
		this.m_peak = 0.0;
	}
};