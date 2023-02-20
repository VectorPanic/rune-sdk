//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the ConsoleCommands class.
 *
 * @constructor
 * @package
 *
 * @class
 * @classdesc
 * 
 * The ConsoleCommands class represents a register of available console 
 * commands. Commands can be added and deleted via this class.
 */
rune.console.ConsoleCommands = function() {

	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------

	/**
	 * List of available commands.
	 *
	 * @type {Array.<rune.console.ConsoleCommand>}
	 * @private
	 */
	this.m_commands = [];

	/**
	 * Command output prefix.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_cursorMarker = "> ";
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a command to the console so that it can be called via text input.
 *
 * @param {rune.console.ConsoleCommand} command Console command to add.
 *
 * @throws {TypeError} In case of incorrect data type.
 *
 * @returns {undefined}
 */
rune.console.ConsoleCommands.prototype.add = function(command) {
	if (command instanceof rune.console.ConsoleCommand) {
		this.m_commands.push(command);
	} else throw new TypeError("Invalid console command.");
};

/**
 * Creates and adds a new console command.
 *
 * @param {string} command The name of the command, ie. the trigger.
 * @param {Function} callback Command function.
 * @param {Object} scope Scope of the function.
 *
 * @returns {undefined}
 */
rune.console.ConsoleCommands.prototype.create = function(command, callback, scope) {
	this.add(new rune.console.ConsoleCommand(command, callback, scope));
};

/**
 * Removes a command.
 *
 * @param {string} command Command to remove.
 *
 * @returns {undefined}
 */
rune.console.ConsoleCommands.prototype.remove = function(command) {
	for (var i = 0; i < this.m_commands.length; i++) {
		if (this.m_commands[i].trigger === command) {
			this.m_commands.splice(i, 1);
			break;
		}
	}
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Free up memory allocated by the object.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.console.ConsoleCommands.prototype.dispose = function() {
	this.m_commands.length = 0;
	this.m_commands = null;
};

/**
 * Execute a command from the command list.
 *
 * @param {string} input Command, including possible arguments.
 * 
 * @returns {string}
 * @package
 * @ignore
 */
rune.console.ConsoleCommands.prototype.exec = function(input) {
	var command = input.replace(/ .*/, "");
	var args = input.split(" ");
		args.shift();
		
	for (var i = 0; i < this.m_commands.length; i++) {
		if (this.m_commands[i].trigger.toLowerCase() === command.toLowerCase()) {
			var output = this.m_commands[i].callback.apply(
				this.m_commands[i].scope,
				args
			);
			
			//@note: Special case.
			if (command.toLowerCase() == rune.console.Console.CMD_CLEAR) {
				return ""
			}
			
			return (output) ? this.m_cursorMarker + input +"\n" + output : this.m_cursorMarker + input;
		}
	}

	return this.m_cursorMarker + input + "\nUnknown command \"" + command + "\"";
};