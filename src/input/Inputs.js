//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Inputs class.
 *
 * @constructor
 *
 * @param {Object} [options] Input settings.
 * 
 * @class
 * @classdesc
 * 
 * The Inputs class is a subsystem that handles all of Rune's input devices, 
 * such as keyboards and gamepads. All access to input devices thus passes 
 * through an instance of this class.
 */
rune.input.Inputs = function(options) {
	
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * The subsystem responsible for gamepad devices.
     *
     * @type {rune.input.Gamepads}
     * @private
     */
    this.m_gamepads = null;
    
    /**
     * The subsystem responsible for keyboard input.
     *
     * @type {rune.input.Keyboard}
     * @private
     */
    this.m_keyboard = null;
    
    /**
     * Input settings.
     *
     * @type {Object}
     * @private
     */
    this.m_options = options || {};
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * A subsystem that handles all connected gamepad devices. A connected device 
 * is represented by a Gamepad object, which can be requested via this instance.
 *
 * @member {rune.input.Gamepads} gamepads
 * @memberof rune.input.Inputs
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Inputs.prototype, "gamepads", {
    /**
     * @this rune.input.Inputs
     * @ignore
     */
    get : function() {
        return this.m_gamepads;
    },
});

/**
 * Represents the keyboard. Use this object to read the current state of keys, 
 * such as pressed, released, etc..
 *
 * @member {rune.input.Keyboard} keyboard
 * @memberof rune.input.Inputs
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Inputs.prototype, "keyboard", {
    /**
     * @this rune.input.Inputs
     * @ignore
     */
    get : function() {
        return this.m_keyboard;
    },
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Resets the state of all input devices.
 *
 * @returns {undefined}
 */
rune.input.Inputs.prototype.reset = function() {
    if (this.m_keyboard != null) this.m_keyboard.reset();
    if (this.m_gamepads != null) this.m_gamepads.reset();
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates the state of all input devices.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.input.Inputs.prototype.update = function(step) {
    this.m_updateKeyboard(step);
    this.m_updateGamepads(step);
};

/**
 * Removes all handling of input devices. No input will be registered after 
 * this method is called.
 *
 * @returns {undefined}
 * @ignore
 */
rune.input.Inputs.prototype.dispose = function() {
    this.m_disposeGamepads();
    this.m_disposeKeyboard();
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
rune.input.Inputs.prototype.m_construct = function() {
    this.m_constructKeyboard();
    this.m_constructGamepads();
};

/**
 * Creates and activates the keyboard management system.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.input.Inputs.prototype.m_constructKeyboard = function() {
    this.m_disposeKeyboard();
    if (this.m_keyboard === null) {
        this.m_keyboard = new rune.input.Keyboard({
            enable: this.m_options.useKeyboard,
            target: window
        });
    } else throw new Error();
};

/**
 * Creates the subsystem that handles all gamepad devices.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.input.Inputs.prototype.m_constructGamepads = function() {
    this.m_disposeGamepads();
    if (this.m_gamepads === null) {
        this.m_gamepads = new rune.input.Gamepads({
            enable: this.m_options.useGamepads
        });
    } else throw new Error();
};

/**
 * Updates the state of the keyboard.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.input.Inputs.prototype.m_updateKeyboard = function(step) {
    if (this.m_keyboard != null) {
        this.m_keyboard.update();
    }
};

/**
 * Updates the state of all connected gamepad devices.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.input.Inputs.prototype.m_updateGamepads = function(step) {
    if (this.m_gamepads != null) {
        this.m_gamepads.update();
    }
};

/**
 * Removes all handling of gamepad devices.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.input.Inputs.prototype.m_disposeGamepads = function() {
    if (this.m_gamepads instanceof rune.input.Gamepads) {
        this.m_gamepads.dispose();
        this.m_gamepads = null;
    }
};

/**
 * Removes the representation of the keyboard.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.input.Inputs.prototype.m_disposeKeyboard = function() {
    if (this.m_keyboard instanceof rune.input.Keyboard) {
        this.m_keyboard.dispose();
        this.m_keyboard = null;
    }
};