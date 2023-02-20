//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Math class. Note that this class is intended 
 * as a static library of methods, thus instantiation results in a warning.
 *
 * @constructor
 *
 * @class
 * @classdesc
 *
 * The Math class contains a library of static methods for common mathematical 
 * calculations. The class can thus be used as an alternative to JavaScripts' 
 * built-in Math class.
 */
rune.util.Math = function() {
    console.warn("This class is not meant to be instantiated; all content is static.");
};

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Magic number used when converting between degrees to radians.
 *
 * @constant {number}
 * @default 0.01745329251
 */
rune.util.Math.DEG_TO_RAD = Math.PI / 180.0;

/**
 * Magic number used when converting between radians to degrees.
 *
 * @constant {number}
 * @default 57.2957795131
 */
rune.util.Math.RAD_TO_DEG = 180.0 / Math.PI;

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Returns the absolute value of n.
 * 
 * @param {number} n A number.
 * 
 * @return {number} The absolute value of the given number.
 */
rune.util.Math.abs = function(n) {
    return (n > 0) ? n : -n;
};

/**
 * Returns the mean of n.
 *
 * @param {Array} n A list of numbers. 
 * 
 * @return {number} The mean of given numbers.
 */
rune.util.Math.avg = function(n) {
    var sum = 0;
    var i = n.length;
    while (i--) {
        sum += (n[i]);
    }
    
    return sum / n.length;
};

/**
 * Returns the smallest integer greater than or equal to n.
 *
 * @param {number} n A number.
 * 
 * @return {number} The smallest integer greater than or equal to the given number.
 */
rune.util.Math.ceil = function(n) {
    var t = ~~n;
    return (t === n) ? n : (n > 0) ? (t + 1) : (t - 1);
};

/**
 * Returns true based on a chance of n.
 *
 * @param {number} n Chance between 0 and 100.
 * 
 * @return {boolean} True or false, depending on the chance of n.
 */
rune.util.Math.chance = function(n) {
    n = n || 50;
    n = Math.min(n, 100);
    n = Math.max(n,   0);

    return n >= Math.random() * 100;
};

/**
 * Returns a number within a specified range.
 *
 * @param {number} num A number.
 * @param {number} min Minimum number.
 * @param {number} max Maximum number.
 * 
 * @return {number} A number between the minimum and maximum value.
 */
rune.util.Math.clamp = function(num, min, max) {
    return Math.min(Math.max(num, min), max);
};

/**
 * Returns the cosine of n.
 *
 * @param {number} n The angle in radians for which to return the cosine.
 * 
 * @return {number} The cosine of the given number.
 */
rune.util.Math.cos = function(n) {
    return rune.util.Math.sin(n + 1.570796327);
};

/**
 * Converts an angle in degrees to radians.
 *
 * @param {number} angle Angle described in degrees.
 * 
 * @return {number} Specified angle in radians.
 */
rune.util.Math.degreesToRadians = function(angle) {
    return angle * rune.util.Math.DEG_TO_RAD;
};

/**
 * Calculates the difference between a and b.
 * 
 * @param {number} a A number.
 * @param {number} b A number.
 * 
 * @return {number} The difference between a and b.
 */
rune.util.Math.diff = function(a, b) {
    return Math.abs(a - b);
};

/**
 * Returns the distance between two points.
 * 
 * @param {number} x1 The x coordinate of the first point.
 * @param {number} y1 The y coordinate of the first point.
 * @param {number} x2 The x coordinate of the second point.
 * @param {number} y2 The y coordinate of the second point.
 * 
 * @return {number} The distance between the first and second points.
 */
rune.util.Math.distance = function(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;

    return Math.sqrt(a * a + b * b);
};

/**
 * Returns the largest integer less than or equal to n.
 *
 * @param {number} n A number.
 * 
 * @return {number} A number representing the largest integer less than or equal to the specified number.
 */
rune.util.Math.floor = function(n) {
    return ~~n;
};

/**
 * Returns a human-friendly string representation of a quantity specified in 
 * bytes.
 *
 * @param {number} bytes Number of bytes.
 * @param {number} decimals Number of decimals.
 * 
 * @return {string} Human-friendly string representation.
 */
rune.util.Math.formatBytes = function(bytes, decimals) {
    decimals = decimals || 2;

    if (bytes === 0) return "0 Bytes";

    var k     = 1024;
    var dm    = decimals < 0 ? 0 : decimals;
    var sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var i     = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Returns the percentage (as float) of a specified number.
 * 
 * @param {number} num A number.
 * @param {number} max Maximum number.
 * 
 * @return {number} Percentage of given numbers.
 */
rune.util.Math.percentDec = function(num, max) {
    return rune.util.Math.clamp(1 - (num / max), 0, 1);
};

/**
 * Returns the percentage (as integer) of a specified number.
 * 
 * @param {number} num A number.
 * @param {number} max Maximum number.
 * 
 * @return {number} Percentage of given numbers.
 */
rune.util.Math.percentInc = function(num, max) {
    return rune.util.Math.clamp((num / max), 0, 1);
};

/**
 * Returns whether n is an even number (true) or not (false).
 * 
 * @param {number} n A number.
 * 
 * @return {boolean} Whether a given number is even.
 */
rune.util.Math.isEven = function(n) {
    return (parseInt(n, 10) & 1) === 0;
};

/**
 * Returns whether n is an odd number (true) or not (false).
 *
 * @param {number} n A number.
 * 
 * @return {boolean} Whether a given number is odd.
 */
rune.util.Math.isOdd = function(n) {
    return (parseInt(n, 10) & 1) !== 0;
};

/**
 * Returns whether a number is power of two (true) or not (false).
 * 
 * @param {number} n A number.
 * 
 * @return {boolean} Whether a given number is power of two.
 */
rune.util.Math.isPowerOfTwo = function(n) {
    return (n & (n - 1)) === 0;
};

/**
 * Returns a random floating point number.
 *
 * @param {number} [min] Minimum number.
 * @param {number} [max] Maximum number.
 * 
 * @return {number} A random number between the minimum and maximum value.
 */
rune.util.Math.random = function(min, max) {
    min = (typeof min === "number") ? min : Number.MIN_VALUE;
    max = (typeof max === "number") ? max : Number.MAX_VALUE;
    
    return Math.random() * (max - min) + min;
};

/**
 * Returns a random integer.
 *
 * @param {number} [min] Minimum number.
 * @param {number} [max] Maximum number.
 * 
 * @return {number} A random number between the minimum and maximum value.
 */
rune.util.Math.randomInt = function(min, max) {
    min = (typeof min === "number") ? min : Number.MIN_VALUE;
    max = (typeof max === "number") ? max : Number.MAX_VALUE;

    return Math.round((Math.random() * (max - min)) + min);
};

/**
 * Converts an angle in radians to degrees.
 *
 * @param {number} radians Angle described in radians.
 * 
 * @return {number} Specified angle in degrees.
 */
rune.util.Math.radiansToDegrees = function(radians) {
    return radians * rune.util.Math.RAD_TO_DEG;
};

/**
 * Returns the sine of n.
 * 
 * @param {number} n A number (given in radians).
 * 
 * @return {number} The sine of the given number.
 */
rune.util.Math.sin = function(n) {
    n *= 0.3183098862;

    if (n > 1) {
        n -= (Math.ceil( n) >> 1) << 1;
    } else if (n < -1) {
        n += (Math.ceil(-n) >> 1) << 1;
    }

    if (n > 0) {
        return n * (3.1 + n * (0.5 + n * (-7.2 + n * 3.6)));
    } else {
        return n * (3.1 - n * (0.5 + n * ( 7.2 + n * 3.6)));
    }
};

/**
 * Returns a number within a specified range.
 *
 * @param {number} num A number.
 * @param {number} min Minimum number.
 * @param {number} max Maximum number.
 * 
 * @return {number} A number between the minimum and maximum value.
 */
rune.util.Math.wrap = function(num, min, max) {
    var range = max - min + 1;

    if (num < min) {
        num += range * parseInt(((min - num) / range + 1), 10);
    }

    return min + (num - min) % range;
};