//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the KeyboardOptions class.
 * 
 * @constructor
 *
 * @param {Object} [options] Keyboard settings.
 *
 * @class
 * @classdesc
 * 
 * The KeyboardOptions class contains properties that represent keyboard 
 * class settings.
 */
rune.input.KeyboardOptions = function(options) {

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
     * Whether the keyboard should be activated or not. An inactive keyboard, 
     * registers no input.
     *
     * @type {boolean}
     * @default false
     */
    this.enable = options.enable || false;

    /**
     * The EventTarget object to which the keyboard event listener must be 
     * registered.
     *
     * @type {Object}
     * @default window
     */
    this.target = options.target || window;
};