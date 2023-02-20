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
 * The Master class represents a graphical tool that illustrates the number of 
 * registered audio objects in the Master audio channel.
 */
rune.debug.Master = function() {

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

rune.debug.Master.prototype = Object.create(rune.text.BitmapField.prototype);
rune.debug.Master.prototype.constructor = rune.debug.Master;

//------------------------------------------------------------------------------
// Override protected methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Master.prototype.init = function() {
	rune.text.BitmapField.prototype.init.call(this);
	this['text'] = " 00 ";
	this['width'] = 24;
	this['backgroundColor'] = rune.util.Palette.GRAY;
};

/**
 * @inheritDoc
 */
rune.debug.Master.prototype.update = function(step) {
	rune.text.BitmapField.prototype.update.call(this, step);
	this['text'] = " " + this['application']['sounds']['master']['length'] + " ";
};