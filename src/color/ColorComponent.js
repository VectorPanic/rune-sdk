//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new 8-bit component.
 *
 * @constructor
 *
 * @class
 * @classdesc
 *
 * Represents an 8-bit color component. Can be used for red, green, blue or 
 * alpha.
 */
rune.color.ColorComponent = function(value) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Current value.
     *
     * @type {number}
     * @private
     */
    this.m_value = rune.util.Math.clamp(value | 0x0, 0x0, 0xff);
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The current value of the component. A component is represented by eight bits 
 * and can thus be a value between 0 and 255. Invalid values will be squeezed 
 * within the allowable range.
 *
 * @member {number} value
 * @memberof rune.color.ColorComponent
 * @instance
 */
Object.defineProperty(rune.color.ColorComponent.prototype, "value", {
    /**
     * @this rune.color.ColorComponent
     * @ignore
     */
    get : function() {
        return this.m_value;
    },
    
    /**
     * @this rune.color.ColorComponent
     * @ignore
     */
    set : function(value) {
        this.m_value = rune.util.Math.clamp(value, 0x0, 0xff);
    }
});

/**
 * The value of the component represented in a number from 0 to 1. The number 
 * 0.5 therefore corresponds to 127.5 in numerical form, or 7F in hexadecimal.
 *
 * @member {number} factor
 * @memberof rune.color.ColorComponent
 * @instance
 */
Object.defineProperty(rune.color.ColorComponent.prototype, "fraction", {
    /**
     * @this rune.color.ColorComponent
     * @ignore
     */
    get : function() {
        return this.m_value / 0xff;
    },
    
    /**
     * @this rune.color.ColorComponent
     * @ignore
     */
    set : function(value) {
        this.m_value = rune.util.Math.clamp(value, 0.0, 1.0) * 0xff;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Returns a string representation of the current component value in 
 * hexadecimal.
 *
 * @return {string}
 */
rune.color.ColorComponent.prototype.toString = function() {
    var hex = parseInt(this.m_value, 10).toString(16);
    while(hex.length < 2) hex = "0" + hex;
    
    return hex.toUpperCase();
};