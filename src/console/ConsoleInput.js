//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the ConsoleInput class.
 *
 * @constructor
 * @package
 *
 * @param {rune.console.Console} console Reference to the console to which the object is connected.
 *
 * @class
 * @classdesc
 * 
 * The ConsoleInput class represents an input field for a text console.
 */
rune.console.ConsoleInput = function(console) {
	
	//--------------------------------------------------------------------------
	// Public properties
	//--------------------------------------------------------------------------
	
	/**
	 * Whether or not the input field receives input from keyboard events.
	 *
	 * @type {boolean}
	 */
	this.enabled = true;
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * The Console object to which the input field belongs.
	 *
	 * @type {rune.console.Console}
	 * @private
	 */
	this.m_console = console;
	
	/**
	 * Represents the text cursor.
	 *
	 * @type {rune.console.ConsoleCursor}
	 * @private
	 */
	this.m_cursor = null;
	
	/**
	 * Input prefix.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_cursorPrefix = "> ";
	
	/**
	 * Represents input history.
	 *
	 * @type {rune.console.ConsoleHistory}
	 * @private
	 */
	this.m_history = null;
	
	/**
	 * Current input string.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_input = "";
	
	/**
	 * Callback handle for "keydown" events.
	 *
	 * @type {Function}
	 * @private
	 */
	this.m_onKeyDownHandler = null;
	
	//--------------------------------------------------------------------------
	// Constructor call
	//--------------------------------------------------------------------------

	/**
	 * Invokes secondary class constructor.
	 */
	this.m_construct();
};

//------------------------------------------------------------------------------
// Private static constants
//------------------------------------------------------------------------------

/**
 * The key code of "enter".
 *
 * @const {number}
 * @private
 */
rune.console.ConsoleInput.KEYBOARD_RETURN = 13;

/**
 * The key code of "backspace".
 *
 * @const {number}
 * @private
 */
rune.console.ConsoleInput.KEYBOARD_BACKSPACE = 8;

/**
 * The key code of "up arrow".
 *
 * @const {number}
 * @private
 */
rune.console.ConsoleInput.KEYBOARD_UP = 38;

/**
 * The key code of "down arrow".
 *
 * @const {number}
 * @private
 */
rune.console.ConsoleInput.KEYBOARD_DOWN = 40;

/**
 * The key code of "grave accent".
 *
 * @const {number}
 * @private
 */
rune.console.ConsoleInput.KEYBOARD_TILDE = 192;

/**
 * The key code of "shift".
 *
 * @const {number}
 * @private
 */
rune.console.ConsoleInput.KEYBOARD_SHIFT = 16;

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a character to the input field.
 *
 * @param {string} chr The character to add.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.console.ConsoleInput.prototype.add = function(chr) {
	this.m_input += chr || "";
	this.m_console.breakCache();
};

/**
 * Clears the contents of the input field.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.console.ConsoleInput.prototype.clear = function() {
	this.m_input = "";
	this.m_console.breakCache();
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates the input field.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.console.ConsoleInput.prototype.update = function(step) {
	this.m_updateCursor(step);
};

/**
 * Renders the input field.
 *
 * @returns {undefined}
 * @ignore
 */
rune.console.ConsoleInput.prototype.render = function() {
	this.m_renderString(this.m_cursorPrefix + this.m_input + this.m_cursor.text);
};

/**
 * Removes and frees memory allocated by the input field.
 *
 * @returns {undefined}
 * @ignore
 */
rune.console.ConsoleInput.prototype.dispose = function() {
	this.m_disposeHistory();
	this.m_disposeCursor();
	this.m_disposeEvent();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.console.ConsoleInput.prototype.m_construct = function() {
	this.m_constructEvent();
	this.m_constructCursor();
	this.m_constructHistory();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates event handler for "keydown" events.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_constructEvent = function() {
	this.m_disposeEvent();
	var m_this = this;
	if (this.m_onKeyDownHandler == null) {
		window.addEventListener(
			"keydown",
			this.m_onKeyDownHandler = function(event) {
				m_this.m_onKeyDown(event);
			}
		);
	} else throw new Error();
};

/**
 * Creates the text cursor.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_constructCursor = function() {
	this.m_disposeCursor();
	if (this.m_cursor == null) {
		this.m_cursor = new rune.console.ConsoleCursor();
	} else throw new Error();
};

/**
 * Creates the input history subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_constructHistory = function() {
	this.m_disposeHistory();
	if (this.m_history == null) {
		this.m_history = new rune.console.ConsoleHistory();
	} else throw new Error();
};

/**
 * Updates the text cursor.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.console.ConsoleInput.prototype.m_updateCursor = function(step) {
	if (this.m_cursor != null) {
		if (this.m_cursor.update(step)) {
			this.m_console.breakCache();
		}
	}
};

/**
 * Renders a string to the input field.
 *
 * @param {string} str String to render.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_renderString = function(str) {
	var x = this.m_console['indentation'];
	var y = this.m_console['unscaledHeight'] - this.m_console['format']['charHeight'];

	for (var i = 0; i < str.length; i++) {
		this.m_renderCharacter(
			str.charCodeAt(i),
			x,
			y
		);
		
		x += this.m_console['format']['charWidth'];
	}
};

/**
 * Renders a character to the input field.
 *
 * @param {number} chr The character code for the character to render.
 * @param {number} x The x position of the character.
 * @param {number} y The y position of the character.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_renderCharacter = function(chr, x, y) {
	var rect = this.m_console['format'].getCharRect(chr);
	if (rect != null) {
		this.m_console['canvas'].drawImage(
			this.m_console['format']['texture'],
			x,
			y,
			rect.width,
			rect.height,
			rect.x, 
			rect.y,
			rect.width,
			rect.height
		);
	}
};

/**
 * Removes the input history subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_disposeHistory = function() {
	if (this.m_history instanceof rune.console.ConsoleHistory) {
		this.m_history.dispose();
		this.m_history = null;
	}
};

/**
 * Removes the text cursor.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_disposeCursor = function() {
	if (this.m_cursor instanceof rune.console.ConsoleCursor) {
		this.m_cursor.dispose();
		this.m_cursor = null;
	}
};

/**
 * Removes event listeners who listen for "keydown" events.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_disposeEvent = function() {
	if (typeof this.m_onKeyDownHandler === "function") {
		window.removeEventListener(
			"keydown",
			this.m_onKeyDownHandler
		);
	}
};

/**
 * Automatically called when a key is pressed.
 *
 * @param {Event} event Keyboard event.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_onKeyDown = function(event) {
	if (this.enabled == true && this.m_console['enabled'] == true) {
		this.m_commandSwitch(event);
	}
};

/**
 * Handles how to handle a character entry.
 *
 * @param {Event} event Keyboard event.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_commandSwitch = function(event) {
	switch (event.keyCode) {
		case rune.console.ConsoleInput.KEYBOARD_RETURN:
			this.m_executeCommand();
			break;
			
		case rune.console.ConsoleInput.KEYBOARD_BACKSPACE:
			this.m_removeFromInput();
			break;
			
		case rune.console.ConsoleInput.KEYBOARD_UP:
			this.m_previousInput();
			break;
			
		case rune.console.ConsoleInput.KEYBOARD_DOWN:
			this.m_nextInput();
			break;
			
		case rune.console.ConsoleInput.KEYBOARD_TILDE:
			break;
			
		case rune.console.ConsoleInput.KEYBOARD_SHIFT:
			break;
			
		default:
			this.m_addToInput(event);
			break;
	}
};
	
/**
 * Executes entered command.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_executeCommand = function() {
	this.m_onInput(this.m_input);
	this.m_history.add(this.m_input);
	this.clear();
};

/**
 * Executes the command of a text string.
 *
 * @param {string} input Input string.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_onInput = function(input) {
	if (this.m_console != null) {
		this.m_console.execute(input);
	}
};

/**
 * Adds a character to the input string.
 *
 * @param {Event} event Keyboard event.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_addToInput = function(event) {
	this.m_cursor.reset();
	var chr = (event.key != null && event.key.length === 1) ? event.key : String.fromCharCode(event.which || event.keyCode);
	this.add(chr);
};

/**
 * Retrieves the next input string from the history.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_nextInput = function() {
	this.clear();
	this.m_input = this.m_history.next() || "";
};

/**
 * Retrieves the previous input string from the history.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleInput.prototype.m_previousInput = function() {
	this.clear();
	this.m_input = this.m_history.previous() || "";
};

/**
 * Deletes the last character in the input string.
 *
 * @returns {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.console.ConsoleInput.prototype.m_removeFromInput = function() {
	this.m_cursor.reset();
	this.m_input = this.m_input.substring(0, this.m_input.length - 1);
	this.m_console.breakCache();
};