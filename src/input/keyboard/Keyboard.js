//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Keyboard class.
 * 
 * @constructor
 *
 * @param {Object} [options] Keyboard settings.
 *
 * @class
 * @classdesc
 * 
 * The Keyboard class represents a physical keyboard with associated keys. 
 * With class instances, it is possible to read the state (pressed, released, 
 * etc.) for each individual key on the keyboard.
 */
rune.input.Keyboard = function(options) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether the keyboard should be activated or not. An inactive keyboard, 
     * registers no input.
     *
     * @type {boolean}
     * @private
     */
    this.m_enabled = Boolean(options.enable);
    
    /**
     * List of keyboard keys.
     *
     * @type {Array.<rune.input.KeyboardKey>}
     * @private
     */
    this.m_keys = new Array(rune.input.Keyboard.NUM_KEYS);
    
    /**
     * Lookup table for the keyboard keys.
     *
     * @type {Object}
     * @private
     */
    this.m_LUT = {};
    
    /**
     * Reference to event handler (keydown).
     *
     * @type {Function}
     * @private
     */
    this.m_onKeyDownHandler = null;
    
    /**
     * Reference to event handler (keyup).
     *
     * @type {Function}
     * @private
     */
    this.m_onKeyUpHandler = null;
    
    /**
     * Settings for the current keyboard.
     *
     * @type {rune.input.KeyboardOptions}
     * @private
     */
    this.m_options = new rune.input.KeyboardOptions(options);
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Number of keys.
 * 
 * @constant {number}
 */
rune.input.Keyboard.NUM_KEYS = 256;

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the keyboard should be activated or not. An inactive (false) 
 * keyboard, registers no input.
 *
 * @member {boolean} enabled
 * @memberof rune.input.Keyboard
 * @instance
 */
Object.defineProperty(rune.input.Keyboard.prototype, "enabled", {
    /**
     * @this rune.input.Keyboard
     * @ignore
     */
    get : function() {
        return this.m_enabled;
    },

    /**
     * @this rune.input.Keyboard
     * @ignore
     */
    set : function(value) {
        if (this.m_enabled != value) {
            this.m_enabled  = value;
            
            if (this.m_enabled == true) {
                this.m_constructEvent();
            } else {
                this.m_disposeEvent();
                this.reset();
            }
        }
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Checks if the specified key was just pressed.
 *
 * @param {string} key A valid key, such as "SPACE".
 * 
 * @returns {boolean}
 */
rune.input.Keyboard.prototype.justPressed = function(key) {
    key = key.toUpperCase();
    if (this.m_keys[this.m_LUT[key]] != null) return this.m_keys[this.m_LUT[key]].isJustPressed();
    else return false;
};

/**
 * Checks if the specified key has just been released.
 *
 * @param {string} key A valid key, such as "SPACE".
 * 
 * @returns {boolean}
 */
rune.input.Keyboard.prototype.justReleased = function(key) {
    key = key.toUpperCase();
    if (this.m_keys[this.m_LUT[key]] != null) return this.m_keys[this.m_LUT[key]].isJustReleased();
    else return false;
};

/**
 * Checks if the specified key is pressed.
 *
 * @param {string} key A valid key, such as "SPACE".
 * 
 * @returns {boolean}
 */
rune.input.Keyboard.prototype.pressed = function(key) {
    key = key.toUpperCase();
    if (this.m_keys[this.m_LUT[key]] != null) return this.m_keys[this.m_LUT[key]].isPressed();
    else return false;
};

/**
 * Resets the state of all keyboard keys.
 *
 * @returns {undefined}
 */
rune.input.Keyboard.prototype.reset = function() {
    var i = this.m_keys.length;
    while (i--) {
        var key = this.m_keys[i];
        if (key != null) {
            key.reset();
        }
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updating the keyboard.
 *
 * @returns {undefined}
 * @ignore
 */
rune.input.Keyboard.prototype.update = function() {
    if (this.m_enabled == true) {
        this.m_updateKeys();
    }
};

/**
 * Removes memory allocated by the keyboard.
 * 
 * @returns {undefined}
 * @ignore
 */
rune.input.Keyboard.prototype.dispose = function() {
    this.m_disposeEvent();
    this.m_disposeKeys();
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
rune.input.Keyboard.prototype.m_construct = function() {
    this.m_constructKeys();
    if (this.m_options.enable == true) {
        this.m_constructEvent();
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates a KeyboardKey object for each key (keycode) on the keyboard.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_constructKeys = function() {
    var i = 0;

    i = 1;
    while(i <= 12) {
        this.m_constructKey("F"+i, 111+(i++));
    }
            
    i = 65;
    while (i <= 90) {
        this.m_constructKey(String.fromCharCode(i), i++);
    }

    i = 48;
    this.m_constructKey("ZERO",         i++);
    this.m_constructKey("ONE",          i++);
    this.m_constructKey("TWO",          i++);
    this.m_constructKey("THREE",        i++);
    this.m_constructKey("FOUR",         i++);
    this.m_constructKey("FIVE",         i++);
    this.m_constructKey("SIX",          i++);
    this.m_constructKey("SEVEN",        i++);
    this.m_constructKey("EIGHT",        i++);
    this.m_constructKey("NINE",         i++);

    i = 96;
    this.m_constructKey("NUMPADZERO",   i++);
    this.m_constructKey("NUMPADONE",    i++);
    this.m_constructKey("NUMPADTWO",    i++);
    this.m_constructKey("NUMPADTHREE",  i++);
    this.m_constructKey("NUMPADFOUR",   i++);
    this.m_constructKey("NUMPADFIVE",   i++);
    this.m_constructKey("NUMPADSIX",    i++);
    this.m_constructKey("NUMPADSEVEN",  i++);
    this.m_constructKey("NUMPADEIGHT",  i++);
    this.m_constructKey("NUMPADNINE",   i++);
    this.m_constructKey("PAGEUP",        33);
    this.m_constructKey("PAGEDOWN",      34);
    this.m_constructKey("HOME",          36);
    this.m_constructKey("END",           35);
    this.m_constructKey("INSERT",        45);

    this.m_constructKey("ESCAPE",        27);
    this.m_constructKey("MINUS",        189);
    this.m_constructKey("NUMPADMINUS",  109);
    this.m_constructKey("PLUS",         187);
    this.m_constructKey("NUMPADPLUS",   107);
    this.m_constructKey("DELETE",        46);
    this.m_constructKey("BACKSPACE",      8);
    this.m_constructKey("LBRACKET",     219);
    this.m_constructKey("RBRACKET",     221);
    this.m_constructKey("BACKSLASH",    220);
    this.m_constructKey("CAPSLOCK",      20);
    this.m_constructKey("SEMICOLON",    186);
    this.m_constructKey("QUOTE",        222);
    this.m_constructKey("ENTER",         13);
    this.m_constructKey("SHIFT",         16);
    this.m_constructKey("COMMA",        188);
    this.m_constructKey("PERIOD",       190);
    this.m_constructKey("NUMPADPERIOD", 110);
    this.m_constructKey("SLASH",        191);
    this.m_constructKey("NUMPADSLASH",  191);
    this.m_constructKey("CONTROL",       17);
    this.m_constructKey("ALT",           18);
    this.m_constructKey("SPACE",         32);
    this.m_constructKey("UP",            38);
    this.m_constructKey("DOWN",          40);
    this.m_constructKey("LEFT",          37);
    this.m_constructKey("RIGHT",         39);
    this.m_constructKey("TAB",            9);
    this.m_constructKey("BACKQUOTE",    192);
};

/**
 * Creates a KeyboardKey object for a specific keyboard key.
 *
 * @param {string} keyName Name of key.
 * @param {number} keyCode Key code of key.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_constructKey = function(keyName, keyCode) {
    this.m_LUT[keyName]  = keyCode;
    this.m_keys[keyCode] = new rune.input.KeyboardKey();
};

/**
 * Creates necessary event listeners.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_constructEvent = function() {
    this.m_constructEventKeyDown();
    this.m_constructEventKeyUp();
};

/**
 * Create event listeners for KEY_DOWN.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_constructEventKeyDown = function() {
    var m_this = this;
    this.m_options.target.addEventListener(
        "keydown",
        this.m_onKeyDownHandler = function(event) {
            m_this.m_onKeyDown(event.keyCode);
        }
    );
};

/**
 * Create event listeners for KEY_UP.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_constructEventKeyUp = function() {
    var m_this = this;
    this.m_options.target.addEventListener(
        "keyup",
        this.m_onKeyUpHandler = function(event) {
            m_this.m_onKeyUp(event.keyCode);
        }
    );
};

/**
 * Updates the state of all keys.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_updateKeys = function() {
    var i = this.m_keys.length;
    while (i--) {
        var key = this.m_keys[i];
        if (key != null) {
            key.update();
        }
    }
};

/**
 * Deletes registered event listeners.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_disposeEvent = function() {
    this.reset();
    this.m_disposeEventKeyUp();
    this.m_disposeEventKeyDown();
};

/**
 * Create event listeners for KEY_DOWN.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_disposeEventKeyUp = function() {
    var m_this = this;
    this.m_options.target.removeEventListener(
        "keydown",
        this.m_onKeyDownHandler
    );
};

/**
 * Create event listeners for KEY_DOWN.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_disposeEventKeyDown = function() {
    var m_this = this;
    this.m_options.target.removeEventListener(
        "keyup",
        this.m_onKeyUpHandler
    );
};

/**
 * Clears memory used to store information about available keys.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_disposeKeys = function() {
    this.m_LUT = null;
    this.m_keys.length = 0;
    this.m_keys = null;
};

/**
 * Event handler for KEY_DOWN.
 *
 * @param {number} keyCode Current key code.
 * 
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_onKeyDown = function(keyCode) {
    var key = this.m_keys[keyCode];
    if (key != null) key.onKeyDown();
};

/**
 * Event handler for KEY_DOWN.
 *
 * @param {number} keyCode Current key code.
 * 
 * @returns {undefined}
 * @private
 */
rune.input.Keyboard.prototype.m_onKeyUp = function(keyCode) {
    var key = this.m_keys[keyCode];
    if (key != null) key.onKeyUp();
};