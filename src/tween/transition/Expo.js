//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of Expo.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Expo class provides three easing functions that enable the 
 * implementation of smooth motion in Rune animations.
 */
rune.tween.Expo = function() {
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
rune.tween.Expo.easeIn = function(t, b, c, d) {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b - c * 0.001;
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
rune.tween.Expo.easeOut = function(t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
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
rune.tween.Expo.easeInOut = function(t, b, c, d) {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d * 0.5) < 1) return c * 0.5 * Math.pow(2, 10 * (t - 1)) + b;
    return c * 0.5 * (-Math.pow(2, -10 * --t) + 2) + b;
};