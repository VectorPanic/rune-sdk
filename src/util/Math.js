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
 * Returns the shortest signed rotation from one angle to another, in radians.
 * The result is between minus pi and pi. A positive result increases the angle;
 * a negative result decreases it. For exactly opposite directions, either sign
 * represents an equally short rotation.
 *
 * @param {number} from Starting angle in radians.
 * @param {number} to Target angle in radians.
 *
 * @return {number} The shortest signed angle difference in radians.
 */
rune.util.Math.angleDifference = function(from, to) {
    var difference = to - from;

    return Math.atan2(Math.sin(difference), Math.cos(difference));
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
 * Returns the smallest integer greater than or equal to n. Uses native
 * rounding without converting the value to a signed 32-bit integer.
 *
 * @param {number} n A number.
 * 
 * @return {number} The smallest integer greater than or equal to the given number.
 */
rune.util.Math.ceil = function(n) {
    return Math.ceil(n);
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
 * Smoothly approaches a target value independently of the update frequency.
 * Smoothing and step are expressed in milliseconds. A lower smoothing value
 * produces a faster response. After one smoothing interval, approximately
 * 63 percent of the remaining difference is covered.
 *
 * Smoothing is not a fixed duration; the value approaches the target gradually.
 * A smoothing value of zero or less returns the target immediately. Otherwise,
 * a step of zero or less leaves the current value unchanged.
 *
 * @param {number} current Current value.
 * @param {number} target Target value.
 * @param {number} smoothing Response time in milliseconds.
 * @param {number} step Elapsed update time in milliseconds.
 *
 * @return {number} The smoothed value.
 */
rune.util.Math.damp = function(current, target, smoothing, step) {
    if (smoothing <= 0) {
        return target;
    }

    if (step <= 0) {
        return current;
    }

    var fraction = 1 - Math.exp(-step / smoothing);

    return rune.util.Math.lerp(current, target, fraction);
};

/**
 * Smoothly approaches a target angle along the shortest rotation path.
 * Angles are expressed in radians. Smoothing and step are expressed in
 * milliseconds, making the response independent of the update frequency.
 *
 * A lower smoothing value produces a faster response. After one smoothing
 * interval, approximately 63 percent of the remaining difference is covered.
 * Smoothing is not a fixed duration; the angle approaches the target gradually.
 * A smoothing value of zero or less returns the target immediately. Otherwise,
 * a step of zero or less leaves the current angle unchanged.
 *
 * @param {number} current Current angle in radians.
 * @param {number} target Target angle in radians.
 * @param {number} smoothing Response time in milliseconds.
 * @param {number} step Elapsed update time in milliseconds.
 *
 * @return {number} The new angle, which may be outside the range of zero to two pi.
 */
rune.util.Math.dampAngle = function(current, target, smoothing, step) {
    if (smoothing <= 0) {
        return target;
    }
    if (step <= 0) {
        return current;
    }

    var difference = rune.util.Math.angleDifference(current, target);
    return current + difference * (1 - Math.exp(-step / smoothing));
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
 * Returns the largest integer less than or equal to n. Uses native rounding
 * without converting the value to a signed 32-bit integer.
 *
 * @param {number} n A number.
 * 
 * @return {number} A number representing the largest integer less than or equal to the specified number.
 */
rune.util.Math.floor = function(n) {
    return Math.floor(n);
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
 * Checks whether n is a number. The method does not consider 
 * "special values" like NaN or Infinity as numbers; they must be 
 * digit-based, either positive or negative.
 * 
 * @param {number|undefined} n A number.
 * 
 * @return {boolean} Whether n is an number.
 */
rune.util.Math.isNum = function(n) {
    return /^[-]?\d+$/.test(n);
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
 * Linearly interpolates between two numbers. A fraction of zero returns from,
 * and a fraction of one returns to. The fraction is not clamped; values outside
 * zero to one extrapolate beyond the endpoints.
 *
 * @param {number} from Starting value.
 * @param {number} to Target value.
 * @param {number} fraction Interpolation fraction.
 *
 * @return {number} The interpolated value.
 */
rune.util.Math.lerp = function(from, to, fraction) {
    return from + (to - from) * fraction;
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
