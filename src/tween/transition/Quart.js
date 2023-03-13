//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of Quart.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Quart class provides three easing functions that enable the 
 * implementation of smooth motion in Rune animations.
 */
rune.tween.Quart = function() {
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
rune.tween.Quart.easeIn = function(t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
};

/**
 * Ease out.
 *
 * @param {number} t Specifies the current time, between 0 and duration inclusive.
 * @param {number} b Specifies the initial value of the animation property.
 * @param {number} c Specifies the total change in the animation property.
 * @param {number} d Specifies the duration of the motion.
 *
 * @returns {number}
 */
rune.tween.Quart.easeOut = function(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
};

/**
 * Ease in and out.
 *
 * @param {number} t Specifies the current time, between 0 and duration inclusive.
 * @param {number} b Specifies the initial value of the animation property.
 * @param {number} c Specifies the total change in the animation property.
 * @param {number} d Specifies the duration of the motion.
 *
 * @returns {number}
 */
rune.tween.Quart.easeInOut = function(t, b, c, d) {
    if ((t /= d * 0.5) < 1) return c * 0.5 * t * t * t * t + b;
    return -c * 0.5 * ((t -= 2) * t * t * t - 2) + b;
};