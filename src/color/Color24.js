//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new 24-bit RGB color.
 *
 * @constructor
 *
 * @param {number} [r=0] The red component.
 * @param {number} [g=0] The green component.
 * @param {number} [b=0] The blue component.
 *
 * @class
 * @classdesc
 *
 * Represents a 24-bit opaque RGB color. A color consists of three 8-bit 
 * components; red, green, blue.
 */
rune.color.Color24 = function(r, g, b) {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * The red component.
     *
     * @type {rune.color.ColorComponent}
     * @protected
     * @ignore
     */
    this.m_r = new rune.color.ColorComponent(r);
    
    /**
     * The green component.
     *
     * @type {rune.color.ColorComponent}
     * @protected
     * @ignore
     */
    this.m_g = new rune.color.ColorComponent(g);
    
    /**
     * The blue component.
     *
     * @type {rune.color.ColorComponent}
     * @protected
     * @ignore
     */
    this.m_b = new rune.color.ColorComponent(b);
};

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Creates and returns a new Color24 object, based on a hexadecimal value, 
 * specified in string format.
 *
 * @param {string} s String-based color code (as hexadecimal).
 *
 * @return {rune.color.Color24}
 */
rune.color.Color24.fromHex = function(s) {
    if (typeof s !== "string") {
        throw new TypeError("Argument must be of type string.");
    }

    s = s.replace("#", "");

    if (s.length < 6) {
        throw new Error("Color must be specified as a 24 bit value.");
    }

    var r = parseInt(s.substring(0, 2), 16);
    var g = parseInt(s.substring(2, 4), 16);
    var b = parseInt(s.substring(4, 6), 16);
        
    return new rune.color.Color24(
        r,
        g,
        b
    );
}

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The red component (in 8 bits), ie, a value between 0 and 255.
 *
 * @member {rune.util.ColorComponent} red
 * @memberof rune.color.Color24
 * @instance
 * @readonly
 */
Object.defineProperty(rune.color.Color24.prototype, "r", {
    /**
     * @this rune.color.Color24
     * @ignore
     */
    get : function() {
        return this.m_r;
    }
});

/**
 * The green component (in 8 bits), ie, a value between 0 and 255.
 *
 * @member {rune.util.ColorComponent} green
 * @memberof rune.color.Color24
 * @instance
 * @readonly
 */
Object.defineProperty(rune.color.Color24.prototype, "g", {
    /**
     * @this rune.color.Color24
     * @ignore
     */
    get : function() {
        return this.m_g;
    }
});

/**
 * The blue component (in 8 bits), ie, a value between 0 and 255.
 *
 * @member {rune.util.ColorComponent} blue
 * @memberof rune.color.Color24
 * @instance
 * @readonly
 */
Object.defineProperty(rune.color.Color24.prototype, "b", {
    /**
     * @this rune.color.Color24
     * @ignore
     */
    get : function() {
        return this.m_b;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Disposes this color.
 *
 * @return {undefined}
 */
rune.color.Color24.prototype.dispose = function() {
    this.m_r = null;
    this.m_g = null;
    this.m_b = null;
}

/**
 * Generates a random color for this object.
 *
 * @return {undefined}
 */
rune.color.Color24.prototype.random = function() {
    this.m_r['value'] = rune.util.Math.randomInt(0, 255);
    this.m_g['value'] = rune.util.Math.randomInt(0, 255);
    this.m_b['value'] = rune.util.Math.randomInt(0, 255);
}

/**
 * Sets the color instance to the specified RGB value.
 *
 * @param {number} r The red component (in 8 bits), ie, a value between 0 and 255.
 * @param {number} g The green component (in 8 bits), ie, a value between 0 and 255.
 * @param {number} b The blue component (in 8 bits), ie, a value between 0 and 255.
 *
 * @return {undefined}
 */
rune.color.Color24.prototype.setRGB = function(r, g, b) {
    this.m_r['value'] = r;
    this.m_g['value'] = g;
    this.m_b['value'] = b;
}

/**
 * Returns a 24-bit hex representation of this color, as a string.
 *
 * @return {string}
 */
rune.color.Color24.prototype.toString = function() {
    var r = this.m_r.toString();
    var g = this.m_g.toString();
    var b = this.m_b.toString();
    
    return "#" + r + g + b;
}