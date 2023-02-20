//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new ConsoleHistory.
 *
 * @constructor
 * @package
 *
 * @class
 * @classdesc
 * 
 * The ConsoleHistory class represents the input history of a text console.
 */
rune.console.ConsoleHistory = function() {

	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * Stores history in the form of text strings. One string per entry.
	 *
	 * @type {Array.<string>}
	 * @private
	 */
	this.m_inputs = [];

	/**
	 * Current history index.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_inputIndex = -1;

	/**
	 * The extent of the history.
	 *
	 * @type {number}
	 * @private 
	 */
	this.m_length = 5;
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Add input to current history.
 *
 * @param {string} input Input to store.
 *
 * @returns {undefined}
 */
rune.console.ConsoleHistory.prototype.add = function(input) {
	this.m_inputs.unshift(input);
	this.m_trimPrevious();
};

/**
 * Select next.
 *
 * @returns {string}
 */
rune.console.ConsoleHistory.prototype.next = function() {
	this.m_inputIndex--;
	if (this.m_inputIndex < 0) {
		this.m_inputIndex = this.m_inputs.length - 1;
	}

	return this.m_inputs[this.m_inputIndex];
};

/**
 * Select previous. 
 *
 * @returns {string}
 */
rune.console.ConsoleHistory.prototype.previous = function() {
	this.m_inputIndex++;
	if (this.m_inputIndex > this.m_inputs.length - 1) {
		this.m_inputIndex = 0;
	}

	return this.m_inputs[this.m_inputIndex];
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Deletes current object.
 *
 * @returns {undefined}
 */
rune.console.ConsoleHistory.prototype.dispose = function() {
	this.m_inputs.length = 0;
	this.m_inputs = null;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Trims current history.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleHistory.prototype.m_trimPrevious = function() {
	while (this.m_inputs.length > this.m_length) {
		this.m_inputs.pop();
	}
};