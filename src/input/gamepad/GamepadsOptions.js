//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new GamepadsOptions object.
 * 
 * @constructor
 * @package
 *
 * @param {Object} [options=null] Used to override default settings.
 *
 * @class
 * @classdesc
 * 
 * The GamepadOptions class represents a set of settings that can be applied to 
 * an instance of the Gamepads class. Note that this class is intended for 
 * internal use.
 */
rune.input.GamepadsOptions = function(options) {

    //--------------------------------------------------------------------------
    // Default arguments
    //--------------------------------------------------------------------------

    /**
     * @ignore
     */
    options = options || {};

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether the gamepads subsystem should be enabled (true) or not (false). 
     * If the property is set to false, no gamepad input is read.
     *
     * @type {boolean}
     * @default false
     */
    this.enable = options.enable || false;
    
    /**
     * Executes automatically when a new gamepad is connected.
     *
     * @type {rune.util.Executable}
     * @default null
     */
    this.onConnect = options.onConnect || null;
    
    /**
     * Executes automatically when a gamepad is disconnected.
     *
     * @type {rune.util.Executable}
     * @default null
     */
    this.onDisconnect = options.onDisconnect || null;
};

//------------------------------------------------------------------------------
// Internal getter and setter methods
//------------------------------------------------------------------------------

/**
 * Executing a callback handler.
 *
 * @param {string} name Handler to execute.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.GamepadsOptions.prototype.exec = function(name) {
    if (this[name] instanceof rune.util.Executable) {
        this[name].execute();
    }
};