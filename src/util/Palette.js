//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Palette class.
 *
 * @constructor
 *
 * @class
 * @classdesc
 *
 * The Palette class contains static constants that represent colors used by 
 * Rune.
 */
rune.util.Palette = function() {
	console.warn("This class is not meant to be instantiated; all content is static.");
};

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Hexadecimal color code for black.
 *
 * @constant {string}
 * @default "#000000"
 */
rune.util.Palette.BLACK = "#000000";

/**
 * Hexadecimal color code for gray.
 *
 * @constant {string}
 * @default "#252525"
 */
rune.util.Palette.GRAY = "#252525";

/**
 * Hexadecimal color code for green.
 *
 * @constant {string}
 * @default "#FFDA45"
 */
rune.util.Palette.GREEN = "#9DE64E";

/**
 * Hexadecimal color code for orange.
 *
 * @constant {string}
 * @default "#FFDA45"
 */
rune.util.Palette.ORANGE = "#DE5D3A";

/**
 * Hexadecimal color code for red.
 *
 * @constant {string}
 * @default "#EC273F"
 */
rune.util.Palette.RED = "#EC273F";

/**
 * Hexadecimal color code for white.
 *
 * @constant {string}
 * @default "#FFFFFF"
 */
rune.util.Palette.WHITE = "#FFFFFF";