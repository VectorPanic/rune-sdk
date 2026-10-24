//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new 32-bit RGB color.
 *
 * @constructor
 * @extends rune.color.Color24
 *
 * @param {number} [r=0] The red component.
 * @param {number} [g=0] The green component.
 * @param {number} [b=0] The blue component.
 * @param {number} [a=255] The alpha component; zero is fully transparent.
 *
 * @class
 * @classdesc
 *
 * Represents a 32-bit RGB color. A color consists of four 8-bit components; 
 * red, green, blue and alpha.
 */
rune.color.Color32 = function(r, g, b, a) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * The alpha component.
     *
     * @type {rune.color.ColorComponent}
     * @private
     */
    this.m_a = new rune.color.ColorComponent(a === undefined ? 0xff : a);
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Color24.
     */
    rune.color.Color24.call(this, r, g, b);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.color.Color32.prototype = Object.create(rune.color.Color24.prototype);
rune.color.Color32.prototype.constructor = rune.color.Color32;

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Creates and returns a new Color32 object, based on a hexadecimal value, 
 * specified in string format.
 *
 * @param {string} s String-based color code (as hexadecimal).
 *
 * @return {rune.color.Color32}
 */
rune.color.Color32.fromHex = function(s) {
    if (typeof s !== "string") {
        throw new TypeError("Argument must be of type string.");
    }
    
    s = s.replace("#", "");

    if (s.length < 8) {
        throw new Error("Color must be specified as a 32 bit value.");
    }

    var a = parseInt(s.substring(0, 2), 16);
    var r = parseInt(s.substring(2, 4), 16);
    var g = parseInt(s.substring(4, 6), 16);
    var b = parseInt(s.substring(6, 8), 16);
    
    return new rune.color.Color32(
        r,
        g,
        b,
        a
    );
}

/**
 * Linearly interpolates RGBA components into an optional reusable output color.
 * Reuses Color24 interpolation for RGB; alpha is blended independently, without
 * premultiplication. Components are rounded to whole bytes. Output may alias
 * either input. Inputs remain unchanged when output is a separate color.
 *
 * @param {rune.color.Color32} start Starting color.
 * @param {rune.color.Color32} target Target color.
 * @param {number} amount Blend amount, clamped to the interval zero to one.
 * @param {rune.color.Color32} [output] Result color; allocated only if omitted.
 *
 * @return {rune.color.Color32} The output color.
 * @throws {TypeError} If an input or supplied output is not a Color32.
 * @throws {RangeError} If amount is not a finite number.
 */
rune.color.Color32.lerp = function(start, target, amount, output) {
    if (!(start instanceof rune.color.Color32) || !(target instanceof rune.color.Color32)) {
        throw new TypeError("Expected Color32 colors.");
    }

    if (output !== undefined && !(output instanceof rune.color.Color32)) {
        throw new TypeError("Expected Color32 colors.");
    }

    var startAlpha = start['a']['value'];
    var targetAlpha = target['a']['value'];

    if (output === undefined) {
        output = new rune.color.Color32();
    }

    rune.color.Color24.lerp(start, target, amount, output);

    amount = rune.util.Math.clamp(amount, 0, 1);
    var alpha = rune.util.Math.lerp(startAlpha, targetAlpha, amount);

    output['a']['value'] = Math.round(alpha);

    return output;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The alpha component (in 8 bits), ie, a value between 0 and 255.
 *
 * @member {rune.util.ColorComponent} alpha
 * @memberof rune.color.Color32
 * @instance
 * @readonly
 */
Object.defineProperty(rune.color.Color32.prototype, "a", {
    /**
     * @this rune.color.Color32
     * @ignore
     */
    get : function() {
        return this.m_a;
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.color.Color32.prototype.dispose = function() {
    rune.color.Color24.prototype.dispose.call(this);
    this.m_a = null;
}

/**
 * Blends this color toward a Color32 target, including alpha, without allocating
 * colors. Use static lerp() with a fixed start color for a time-based transition.
 *
 * @param {rune.color.Color24} target Target color; must be a Color32.
 * @param {number} amount Blend amount, clamped to the interval zero to one.
 *
 * @return {rune.color.Color32} This color.
 * @throws {TypeError} If target is not a Color32.
 * @throws {RangeError} If amount is not a finite number.
 */
rune.color.Color32.prototype.lerp = function(target, amount) {
    if (!(target instanceof rune.color.Color32)) throw new TypeError("Expected a Color32 target.");
    return rune.color.Color32.lerp(this, target, amount, this);
};

/**
 * Returns a 32-bit RGBA representation of this color, as a string.
 *
 * @return {string}
 */
rune.color.Color32.prototype.toString = function() {
    var r = this.m_r['value'];
    var g = this.m_g['value'];
    var b = this.m_b['value'];
    var a = this.m_a['factor'];
    
    return "rgba(" + r + "," + g + "," + b + "," + a +")";
}

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Sets the color instance to the specified RGBA value.
 *
 * @param {number} r The red component (in 8 bits), ie, a value between 0 and 255.
 * @param {number} g The green component (in 8 bits), ie, a value between 0 and 255.
 * @param {number} b The blue component (in 8 bits), ie, a value between 0 and 255.
 * @param {number} a The alpha component (in 8 bits), ie, a value between 0 and 255.
 *
 * @return {undefined}
 */
rune.color.Color32.prototype.setRGBA = function(r, g, b, a) {
    this.setRGB(r, g, b);
    this.m_a['value'] = a;
}
