//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new BitmapFormat.
 *
 * @constructor
 * @package
 *
 * @param {string} [texture] The name of the resource file to be used as texture.
 *
 * @class
 * @classdesc
 * 
 * The BitmapFormat class represents a bitmap-based font. The font stores its 
 * graphics in a texture that can hold up to 96 characters identified by their 
 * Unicode character code (from U+0020 to U+007E). Characters are divided into 
 * three lines with 32 characters per line.
 *
 */
rune.text.BitmapFormat = function(texture) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * List of characters. Each character is represented by a rectangle whose 
     * size corresponds to the size of a character. The position of the 
     * rectangle corresponds to the character's location in the texture file.
     *
     * @type {Array.<rune.geom.Rectangle>}
     * @private
     */
    this.m_chars = null;

    /**
     * Texture file, ie an image containing all (96) characters.
     *
     * @type {HTMLImageElement}
     * @private
     */
    this.m_texture = this.getTexture(texture || rune.text.BitmapFormat.FONT_SMALL);

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
 * A bitmap texture for a medium-sized font where each character is represented 
 * by 8 x 8 pixels.
 *
 * @const {string}
 * @default "rune_font_medium_256x24"
 */
rune.text.BitmapFormat.FONT_MEDIUM = "rune_font_medium_256x24";

/**
 * A bitmap texture for a small font where each character is represented by 
 * 6 x 10 pixels. This is the default font for BitmapField and is used when 
 * nothing else is specified.
 *
 * @const {string}
 * @default "rune_font_small_192x30"
 */
rune.text.BitmapFormat.FONT_SMALL = "rune_font_small_192x30";

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The width of a character (in pixels).
 *
 * @member {number} charWidth
 * @memberof rune.text.BitmapFormat
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapFormat.prototype, "charWidth", {
    /**
     * @this rune.text.BitmapFormat
     * @ignore
     */
    get : function() {
        return ~~(this.m_texture.width / 32); //@note: Magic
    }
});

/**
 * The height of a character (in pixels). 
 *
 * @member {number} charWidth
 * @memberof rune.text.BitmapFormat
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapFormat.prototype, "charHeight", {
    /**
     * @this rune.text.BitmapFormat
     * @ignore
     */
    get : function() {
        return ~~(this.m_texture.height / 3); //@note: Magic
    }
});

/**
 * Reference to the bitmap texture used to represent the font.
 *
 * @member {HTMLImageElement} texture
 * @memberof rune.text.BitmapFormat
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapFormat.prototype, "texture", {
    /**
     * @this rune.text.BitmapFormat
     * @ignore
     */
    get : function() {
        return this.m_texture;
    }
});

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Retrieves a rectangle that describes the part of the texture that represents 
 * a specific character. The selection of character is specified via a unicode 
 * character code.
 *
 * @param {number} charCode Unicode character code of requested character.
 *
 * @return {rune.geom.Rectangle}
 * @package
 * @ignore
 */
rune.text.BitmapFormat.prototype.getCharRect = function(charCode) {
    return this.m_chars[charCode];
};

/**
 * Deletes the current object.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.text.BitmapFormat.prototype.dispose = function() {
    this.m_disposeChars();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.text.BitmapFormat.prototype.m_construct = function() {
    this.m_constructChars();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates all characters. 
 *
 * @return {undefined}
 * @private
 */
rune.text.BitmapFormat.prototype.m_constructChars = function() {
    this.m_disposeChars();
    if (this.m_chars == null) {
        this.m_chars = new Array(256);
        
        var x = 0;
        var y = 0;
        var w = this.m_texture.width / 32; //@note: Magic
        var h = this.m_texture.height / 3; //@note: Magic
        
        var charCode = 32;
        for (y = 0; y < this.m_texture.height; y += h) {
            for (x = 0; x < this.m_texture.width; x += w) {
                this.m_chars[charCode] = new rune.geom.Rectangle(x, y, w, h);
                charCode++;
            }
        }
    }
};

/**
 * Removes all characters.
 *
 * @return {undefined}
 * @private
 */
rune.text.BitmapFormat.prototype.m_disposeChars = function() {
    if (Array.isArray(this.m_chars)) {
        this.m_chars.length = 0;
    }
    
    this.m_chars = null;
};

/**
 * Retrieves a reference to a texture based on resource name.
 *
 * @param {string} [resource] Name of resource.
 *
 * @return {HTMLImageElement}
 * @private
 */
rune.text.BitmapFormat.prototype.getTexture = function(resource) {
    var texture = rune.system.Application['instance']['resources'].get(resource);
    if (texture) return texture['data'];
    else throw new Error();
};