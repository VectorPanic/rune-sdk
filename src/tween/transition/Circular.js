//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of Circular.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Circular class provides three easing functions that enable the 
 * implementation of smooth motion in Rune animations.
 */
rune.tween.Circular = function() {
    console.warn("This class is not meant to be instantiated; all content is static.");
};

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Ease in.
 *
 * @param {number} t Specifies the current time, between 0 and duration inclusive.
 * @param {number} b Specifies the initial value of the animation property.
 * @param {number} c Specifies the total change in the animation property.
 * @param {number} d Specifies the duration of the motion.
 *
 * @returns {number} The value of the interpolated property at the specified time.
 */
rune.tween.Circular.easeIn = function(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
};

/**
 * Ease out.
 *
 * @param {number} t Specifies the current time, between 0 and duration inclusive.
 * @param {number} b Specifies the initial value of the animation property.
 * @param {number} c Specifies the total change in the animation property.
 * @param {number} d Specifies the duration of the motion.
 *
 * @returns {number} The value of the interpolated property at the specified time.
 */
rune.tween.Circular.easeOut = function(t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
};

/**
 * Ease in and out.
 *
 * @param {number} t Specifies the current time, between 0 and duration inclusive.
 * @param {number} b Specifies the initial value of the animation property.
 * @param {number} c Specifies the total change in the animation property.
 * @param {number} d Specifies the duration of the motion.
 *
 * @returns {number} The value of the interpolated property at the specified time.
 */
rune.tween.Circular.easeInOut = function(t, b, c, d) {
    if ((t /= d * 0.5) < 1) return -c * 0.5 * (Math.sqrt(1 - t * t) - 1) + b;
    return c * 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
};