//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new ConsoleOutput.
 *
 * @constructor
 * @package
 *
 * @param {rune.console.Console} console Reference to the console to which the object is connected.
 *
 * @class
 * @classdesc
 * 
 * The ConsoleOutput class represents the output field of a text console.
 */
rune.console.ConsoleOutput = function(console) {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * The Console object to which the output field belongs.
	 *
	 * @type {rune.console.Console}
	 * @private
	 */
	this.m_console = console;
	
	/**
	 * Output rows.
	 *
	 * @type {Array.<string>}
	 * @private
	 */
	this.m_rows = [];
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Clears previous text strings from the console.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.console.ConsoleOutput.prototype.clear = function() {
	this.m_rows = [];
	this.m_console.breakCache();
};

/**
 * Outputs a string to the console.
 *
 * @param {string} str String to log.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.console.ConsoleOutput.prototype.log = function(str) {
	str = str || "";
	var strs = str.split("\n");
	for (var i = 0; i < strs.length; i++) {
		this.m_rows.unshift(strs[i]);
	}

	this.m_trimLog();
	this.m_console.breakCache();
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Free up allocated memory.
 *
 * @returns {undefined}
 * @ignore
 */
rune.console.ConsoleOutput.prototype.dispose = function() {
	this.m_rows.length = 0;
	this.m_rows = null;
	this.m_console = null;
};

/**
 * Renders output text.
 *
 * @returns {undefined}
 * @ignore
 */
rune.console.ConsoleOutput.prototype.render = function() {
	this.m_renderRows();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Cuts output lines that are no longer visible in the output field.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleOutput.prototype.m_trimLog = function() {
	while (this.m_rows.length > this.m_console['numLines']) {
		this.m_rows.pop();
	}
};

/**
 * Renders a row.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleOutput.prototype.m_renderRows = function() {
	var text = "";
	var rows = this.m_rows;
	for (var ln = 0; ln < this.m_rows.length; ln++) {
		text = rows[ln];
		var x = this.m_console['indentation'];
		var y = (this.m_console['unscaledHeight'] - (this.m_console['format']['charHeight'] << 1)) - (this.m_console['format']['charHeight'] * ln);
		for (var col = 0; col < text.length; col++) {
			this.m_renderCharacter(
				text.charCodeAt(col),
				x,
				y
			);
			
			x += this.m_console['format']['charWidth'];
		}
	}
};

/**
 * Renders a character.
 *
 * @param {number} chr The character code for the character to render.
 * @param {number} x The x position of the character.
 * @param {number} y The y position of the character.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleOutput.prototype.m_renderCharacter = function(chr, x, y) {
	var rect = this.m_console['format'].getCharRect(chr);
	this.m_console['canvas'].drawImage(
		this.m_console['format']['texture'],
		x,
		y,
		rect['width'],
		rect['height'],
		rect['x'], 
		rect['y'],
		rect['width'],
		rect['height']
	);
};