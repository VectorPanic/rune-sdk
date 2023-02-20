//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new ConsoleCommand.
 *
 * @constructor
 * @package
 *
 * @param {string} [trigger] Command trigger.
 * @param {Function} [callback] Command function.
 * @param {Object} [scope] Command scope.
 *
 * @class
 * @classdesc
 * 
 * The ConsoleCommand class represents a command that can be called from the 
 * text console.
 */
rune.console.ConsoleCommand = function(trigger, callback, scope) {

	//--------------------------------------------------------------------------
	// Public properties
	//--------------------------------------------------------------------------

	/**
	 * String value that activates the command, ie. the command name.
	 *
	 * @type {string}
	 */
	this.trigger = trigger || "...";

	/**
	 * Command function, ie the function that is executed when the command 
	 * is called.
	 *
	 * @type {Function}
	 */
	this.callback = callback || function() { return "..." };

	/**
	 * Within what scope the command is executed.
	 *
	 * @type {Object}
	 */
	this.scope = scope || window;
};