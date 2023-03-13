//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of Quad.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Quad class provides three easing functions that enable the 
 * implementation of smooth motion in Rune animations.
 */
rune.tween.Quad = function() {
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
rune.tween.Quad.easeIn = function(t, b, c, d) {
    return c * (t /= d) * t + b;
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
rune.tween.Quad.easeOut = function(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
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
rune.tween.Quad.easeInOut = function(t, b, c, d) {
    if ((t /= d * 0.5) < 1) return c * 0.5 * t * t + b;
    return -c * 0.5 * ((--t) * (t - 2) - 1) + b;
};