//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of Linear.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Linear class provides three easing functions that enable the 
 * implementation of smooth motion in Rune animations.
 */
rune.tween.Linear = function() {
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
rune.tween.Linear.easeIn = function(t, b, c, d) {
    return c * t / d + b;
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
rune.tween.Linear.easeOut = function(t, b, c, d) {
    return c * t / d + b;
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
rune.tween.Linear.easeInOut = function(t, b, c, d) {
    return c * t / d + b;
};