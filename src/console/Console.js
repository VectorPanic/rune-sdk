//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Console.
 *
 * @constructor
 * @extends rune.display.DisplayObject
 * @package
 *
 * @param {number} [width] Console width in pixels.
 * @param {number} [height] Console height in pixels.
 * 
 * @class
 * @classdesc
 * 
 * The Console class represents an input console that can take input and 
 * provide output. Input is given in the form of text commands and output is 
 * given in the form of text strings and / or function calls. With the console, 
 * it is possible to register customized application commands for testing and 
 * troubleshooting.
 */
rune.console.Console = function(width, height) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Command manager.
     *
     * @type {rune.console.ConsoleCommands}
     * @private
     */
    this.m_commands = null;
    
    /**
     * Represents the console font.
     *
     * @type {rune.text.BitmapFormat}
     * @private
     */
    this.m_format = null;
    
    /**
     * Pixel indentation (from left).
     *
     * @type {number}
     * @private
     */
    this.m_indentation = 4;
    
    /**
     * Subsystem for text input.
     *
     * @type {rune.console.ConsoleInput}
     * @private
     */
    this.m_input = null;
    
    /**
     * Subsystem for text output.
     *
     * @type {rune.console.ConsoleOutput}
     * @private
     */
    this.m_output = null;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend DisplayObject.
     */
    rune.display.DisplayObject.call(this, 0, 0, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.console.Console.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.console.Console.prototype.constructor = rune.console.Console;

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Command string to clear the console output.
 *
 * @const {string}
 */
rune.console.Console.CMD_CLEAR = "clear";

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the console's command system. Use this reference to add and 
 * delete console commands.
 *
 * @member {rune.console.ConsoleCommands} commands
 * @memberof rune.console.Console
 * @instance
 * @readonly
 */
Object.defineProperty(rune.console.Console.prototype, "commands", {
    /**
     * @this rune.console.Console
     * @ignore
     */
    get : function() {
        return this.m_commands;
    }
});

/**
 * Whether the console is in use (true) or not (false).
 *
 * @member {boolean} enabled
 * @memberof rune.console.Console
 * @instance
 * @readonly
 */
Object.defineProperty(rune.console.Console.prototype, "enabled", {
    /**
     * @this rune.console.Console
     * @ignore
     */
    get : function() {
        return (this['parent'] != null);
    }
});

/**
 * Refers to the font set by the console to represent text strings.
 *
 * @member {rune.text.BitmapFormat} format
 * @memberof rune.console.Console
 * @instance
 * @readonly
 */
Object.defineProperty(rune.console.Console.prototype, "format", {
    /**
     * @this rune.console.Console
     * @ignore
     */
    get : function() {
        return this.m_format;
    }
});

/**
 * Pixel indentation (from left).
 *
 * @member {number} indentation
 * @memberof rune.console.Console
 * @instance
 */
Object.defineProperty(rune.console.Console.prototype, "indentation", {
    /**
     * @this rune.console.Console
     * @ignore
     */
    get : function() {
        return this.m_indentation;
    },
    
    /**
     * @this rune.console.Console
     * @ignore
     */
    set : function(value) {
        this.m_indentation = parseInt(value, 10);
    }
});

/**
 * Reference to the console input system.
 *
 * @member {rune.console.ConsoleInput} input
 * @memberof rune.console.Console
 * @instance
 * @readonly
 */
Object.defineProperty(rune.console.Console.prototype, "input", {
    /**
     * @this rune.console.Console
     * @ignore
     */
    get : function() {
        return this.m_input;
    }
});

/**
 * The number of lines of text that fit within the console.
 *
 * @member {number} numLines
 * @memberof rune.console.Console
 * @instance
 * @readonly
 */
Object.defineProperty(rune.console.Console.prototype, "numLines", {
    /**
     * @this rune.console.Console
     * @ignore
     */
    get : function() {
        return Math.ceil(this['height'] / this.m_format['charHeight']);
    }
});

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Clears the contents of the console.
 *
 * @returns {string}
 */
rune.console.Console.prototype.clear = function() {
    if (this.m_output != null) {
        this.m_output.clear();
    }

    return " ";
};

/**
 * Executes console command.
 *
 * @param {string} cmd Command to execute.
 *
 * @returns {undefined}
 */
rune.console.Console.prototype.execute = function(cmd) {
    if (this.m_commands != null) {
        this.log(this.m_commands.exec(cmd));
    }
};

/**
 * Adds a text string to the console output.
 *
 * @param {string} msg String to add.
 *
 * @returns {undefined}
 */
rune.console.Console.prototype.log = function(msg) {
    if (this.m_output != null) {
        this.m_output.log(msg);
    }
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.console.Console.prototype.update = function(step) {
    rune.display.DisplayObject.prototype.update.call(this, step);
    this.m_updateInput(step);
};

/**
 * @inheritDoc
 */
rune.console.Console.prototype.render = function() {
    rune.display.DisplayObject.prototype.render.call(this);
    this.m_renderInput();
    this.m_renderOutput();
};

/**
 * @inheritDoc
 */
rune.console.Console.prototype.dispose = function() {
    this.m_disposeCommands();
    this.m_disposeOutput();
    this.m_disposeInput();
    this.m_disposeFormat();
    rune.display.DisplayObject.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.console.Console.prototype.m_construct = function() {
    rune.display.DisplayObject.prototype.m_construct.call(this);
    this['backgroundColor'] = rune.util.Palette.GRAY;
    this.m_constructFormat();
    this.m_constructInput();
    this.m_constructOutput();
    this.m_constructCommands();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates text format, ie font.
 *
 * @throws {Error} If already exists.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_constructFormat = function() {
    this.m_disposeFormat();
    if (this.m_format == null) {
        this.m_format = new rune.text.BitmapFormat();
    } else throw new Error();
};

/**
 * Creates the console's input system.
 *
 * @throws {Error} If already exists.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_constructInput = function() {
    this.m_disposeInput();
    if (this.m_input == null) {
        this.m_input = new rune.console.ConsoleInput(this);
    } else throw new Error();
};

/**
 * Creates the console's output system.
 *
 * @throws {Error} If already exists.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_constructOutput = function() {
    this.m_disposeOutput();
    if (this.m_output == null) {
        this.m_output = new rune.console.ConsoleOutput(this);
    } else throw new Error();
};

/**
 * Creates the subsystem for console commands.
 *
 * @throws {Error} If already exists.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_constructCommands = function() {
    this.m_disposeCommands();
    if (this.m_commands == null) {
        this.m_commands = new rune.console.ConsoleCommands();
        this.m_commands.create(rune.console.Console.CMD_CLEAR, this.clear, this);
    } else throw new Error();
};

/**
 * Updates text input.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_updateInput = function(step) {
    if (this.m_input != null) {
        this.m_input.update(step);
    }
};

/**
 * Renders text input.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_renderInput = function() {
    if (this.m_input != null) {
        this.m_input.render();
    }
};

/**
 * Renders text output.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_renderOutput = function() {
    if (this.m_output != null) {
        this.m_output.render();
    }
};

/**
 * Removes the console command subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_disposeCommands = function() {
    if (this.m_commands instanceof rune.console.ConsoleCommands) {
        this.m_commands.dispose();
        this.m_commands = null;
    }
};

/**
 * Removes the text output subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_disposeOutput = function() {
    if (this.m_output instanceof rune.console.ConsoleOutput) {
        this.m_output.dispose();
        this.m_output = null;
    }
};

/**
 * Removes the text input subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.console.Console.prototype.m_disposeInput = function() {
    if (this.m_input instanceof rune.console.ConsoleInput) {
        this.m_input.dispose();
        this.m_input = null;
    }
};

/**
 * Removes the font.
 *
 * @returns {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.console.Console.prototype.m_disposeFormat = function() {
    if (this.m_format instanceof rune.text.BitmapFormat) {
        this.m_format.dispose();
        this.m_format = null;
    }
};