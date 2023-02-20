//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the KeyboardKey class.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The KeyboardKey class represents a keyboard key.
 */
rune.input.KeyboardKey = function() {

    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------

    /**
     * Current state of the key.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_current = rune.input.KeyboardKey.RELEASED;

    /**
     * Previous state of the key.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_previous = rune.input.KeyboardKey.RELEASED;
};

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Indicates that the key was just pressed.
 *
 * @constant {number}
 * @default 1
 */
rune.input.KeyboardKey.JUST_PRESSED = 1;

/**
 * Indicates that the key has just been released.
 *
 * @constant {number}
 * @default -1
 */
rune.input.KeyboardKey.JUST_RELEASED = -1;

/**
 * Indicates that the key is pressed.
 *
 * @constant {number}
 * @default 2
 */
rune.input.KeyboardKey.PRESSED = 2;

/**
 * Indicates that the key is released.
 *
 * @constant {number}
 * @default 0
 */
rune.input.KeyboardKey.RELEASED = 0;

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Checks whether the key is pressed (true) or not (false).
 * 
 * @returns {boolean}
 */
rune.input.KeyboardKey.prototype.isPressed = function() {
    return this.m_current > rune.input.KeyboardKey.RELEASED;
};

/**
 * Checks whether the key was just pressed (true) or not (false).
 * 
 * @returns {boolean}
 */
rune.input.KeyboardKey.prototype.isJustPressed = function() {
    return this.m_current === rune.input.KeyboardKey.JUST_PRESSED;
};

/**
 * Checks whether the key was just released (true) or not (false).
 * 
 * @returns {boolean}
 */
rune.input.KeyboardKey.prototype.isJustReleased = function() {
    return this.m_current === rune.input.KeyboardKey.JUST_RELEASED;
};

/**
 * Resets the state of the current key.
 *
 * @returns {undefined}
 */
rune.input.KeyboardKey.prototype.reset = function() {
    this.m_current  = rune.input.KeyboardKey.RELEASED;
    this.m_previous = rune.input.KeyboardKey.RELEASED;
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the current state of the key.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.input.KeyboardKey.prototype.update = function() {
    this.m_updateStates();
};

/**
 * Simulates that the button is pressed.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.KeyboardKey.prototype.onKeyDown = function() {
    if  (this.m_current > rune.input.KeyboardKey.RELEASED) this.m_current = rune.input.KeyboardKey.PRESSED;
    else this.m_current = rune.input.KeyboardKey.JUST_PRESSED;
};

/**
 * Simulates the release of the button.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.KeyboardKey.prototype.onKeyUp = function() {
    if  (this.m_current > rune.input.KeyboardKey.RELEASED) this.m_current = rune.input.KeyboardKey.JUST_RELEASED;
    else this.m_current = rune.input.KeyboardKey.RELEASED;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the current state of the key.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.input.KeyboardKey.prototype.m_updateStates = function() {
    if (this.m_previous === rune.input.KeyboardKey.JUST_RELEASED && this.m_current == rune.input.KeyboardKey.JUST_RELEASED) this.m_current = rune.input.KeyboardKey.RELEASED;
    else if (this.m_previous === rune.input.KeyboardKey.JUST_PRESSED && this.m_current === rune.input.KeyboardKey.JUST_PRESSED) this.m_current = rune.input.KeyboardKey.PRESSED;

    this.m_previous = this.m_current;
};