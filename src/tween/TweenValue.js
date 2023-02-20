//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of TweenValue.
 * 
 * @constructor
 *
 * @param {string} name Name of the property.
 * @param {number} [start] The initial value of the property.
 * @param {number} [end] The final value of the property.
 *
 * @class
 * @classdesc
 * 
 * The TweenValue class represents a name-value pair used by Tween objects.
 */
rune.tween.TweenValue = function(name, start, end) {
	
	//--------------------------------------------------------------------------
	// Public properties
	//--------------------------------------------------------------------------

	/**
	 * Name of the property.
	 * 
	 * @type {string}
	 * @default ""
	 */
	this.name = name;

	/**
	 * The initial value of the property (before interpolation).
	 * 
	 * @type {number}
	 * @default 0
	 */
	this.start = start || 0;

	/**
	 * The final value of the property (after interpolation).
	 * 
	 * @type {number}
	 * @default 0
	 */
	this.end = end || 0;
};

//------------------------------------------------------------------------------
// Override public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Delta value of the start and end value.
 *
 * @member {number} delta
 * @memberof rune.tween.TweenValue
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tween.TweenValue.prototype, "delta", {
	/**
	 * @this rune.tween.TweenValue
	 * @ignore
	 */
	get : function() {
		return this.end - this.start;
	}
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Free up allocated memory.
 *
 * @returns {undefined}
 */
rune.tween.TweenValue.prototype.dispose = function() {
	//NOTHING; ATM
};

/**
 * Returns a string representation of the TweenValue object.
 *
 * @returns {string}
 */
rune.tween.TweenValue.prototype.toString = function() {
	return "[{TweenProp (name=" + this['name'] + " start=" + this['start'] + " end=" + this['end']  + ")}]";
};