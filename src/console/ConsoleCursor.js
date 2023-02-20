//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new ConsoleCursor.
 *
 * @constructor
 * @package
 *
 * @class
 * @classdesc
 * 
 * The ConsoleCursor class represents a text cursor.
 */
rune.console.ConsoleCursor = function() {

	//--------------------------------------------------------------------------
	// Public properties
	//--------------------------------------------------------------------------

	/**
	 * Blink frequency, specified in milliseconds.
	 *
	 * @type {number}
	 * @default 500
	 */
	this.blinkRate = 500;

	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * Is true when the cursor is visible and false when it is invisible.
	 *
	 * @type {boolean}
	 * @private
	 */
	this.m_cursor = false;

	/**
	 * Time elapsed since the last "blink".
	 *
	 * @type {number}
	 * @private
	 */
	this.m_cursorTicker = 0.0;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Returns the character that represents the cursor.
 *
 * @member {string} cursor
 * @memberof rune.console.ConsoleCursor
 * @instance
 */
Object.defineProperty(rune.console.ConsoleCursor.prototype, "text", {
	/**
	 * @this rune.console.ConsoleCursor
	 * @ignore
	 */
	get : function() {
		return this.m_cursor ? "_" : "";
	}
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Resets the cursor blink frequency.
 *
 * @returns {undefined}
 */
rune.console.ConsoleCursor.prototype.reset = function() {
	this.m_cursor = false;
	this.m_cursorTicker = 0;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates the cursor.
 *
 * @param {number} step Current time step.
 *
 * @returns {boolean}
 * @ignore
 */
rune.console.ConsoleCursor.prototype.update = function(step) {
	return this.m_updateCursor(step);
};

/**
 * Removes the cursor and frees allocated memory.
 *
 * @returns {boolean}
 * @ignore
 */
rune.console.ConsoleCursor.prototype.dispose = function() {
	//@note: Nothing yet.
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the cursor blink frequency.
 *
 * @param {number} step Current time step.
 *
 * @returns {boolean}
 * @private
 */
rune.console.ConsoleCursor.prototype.m_updateCursor = function(step) {
	this.m_cursorTicker += step;
	if (this.m_cursorTicker > this.blinkRate) {
		this.m_cursorTicker = 0;
		this.m_cursor = !this.m_cursor;
		
		return true;
	}

	return false;
};