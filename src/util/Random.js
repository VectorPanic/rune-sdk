//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates an independent seeded pseudo-random generator.
 *
 * @constructor
 * @param {number} [seed=1] Integer seed between 1 and 2147483646, inclusive.
 *
 * @class
 * @classdesc
 *
 * Uses the Park-Miller generator. The same seed and sequence of method calls
 * produce the same results. Instances do not affect each other or Math.random().
 * Intended for reproducible game content, not cryptographic use.
 *
 * @example
 * var random = new rune.util.Random(12345);
 * var column = random.randomInt(0, 11);
 * random.reset();
 */
rune.util.Random = function(seed) {

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Seed used when restarting the sequence.
     *
     * @type {number}
     * @private
     */
    this.m_seed = 1;

    /**
     * Current generator state.
     *
     * @type {number}
     * @private
     */
    this.m_state = 1;

    //--------------------------------------------------------------------------
    // CONSTRUCTOR CALL
    //--------------------------------------------------------------------------

    this.reset(seed);
};

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE GETTER AND SETTER METHODS
//------------------------------------------------------------------------------

/**
 * The seed used to start the current sequence.
 *
 * @member {number} seed
 * @memberof rune.util.Random
 * @instance
 * @readonly
 */
Object.defineProperty(rune.util.Random.prototype, "seed", {
    /**
     * @this rune.util.Random
     * @ignore
     */
    get : function() {
        return this.m_seed;
    }
});

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Returns the next value, greater than or equal to zero and less than one.
 *
 * @returns {number} A pseudo-random fraction.
 */
rune.util.Random.prototype.next = function() {
    return (this.m_next() - 1) / 2147483646;
};

/**
 * Selects an element without modifying the array. Empty arrays return undefined.
 * Arrays with fewer than two elements do not advance the random sequence.
 *
 * @param {Array} array Elements to choose from.
 *
 * @returns {*} The selected element, or undefined if the array is empty.
 * @throws {TypeError} If array is not an Array.
 * @throws {RangeError} If the array contains more than 2147483646 elements.
 */
rune.util.Random.prototype.pick = function(array) {
    if (!Array.isArray(array)) {
        throw new TypeError("Random: Expected an array to pick from.");
    }

    if (array.length < 2) {
        return array[0];
    }

    return array[this.randomInt(0, array.length - 1)];
};

/**
 * Returns a floating-point value in the specified range.
 *
 * @param {number} [min=0] Inclusive minimum.
 * @param {number} [max=1] Maximum; floating-point rounding may reach this value.
 *
 * @returns {number} A pseudo-random value, or min when both bounds are equal.
 * @throws {RangeError} If bounds or their difference are not finite, or min > max.
 */
rune.util.Random.prototype.random = function(min, max) {
    min = min === undefined ? 0 : min;
    max = max === undefined ? 1 : max;

    if (!rune.util.Math.isNum(min) || !rune.util.Math.isNum(max) ||
        min > max || !isFinite(max - min)) {
        throw new RangeError("Random: Expected finite bounds with min <= max.");
    }

    return min + this.next() * (max - min);
};

/**
 * Returns an integer in an inclusive range. Rejection sampling avoids bias
 * when the number of possible results does not divide the generator's range.
 * A rejected sample advances the sequence before trying again.
 *
 * @param {number} min Inclusive minimum safe integer.
 * @param {number} max Inclusive maximum safe integer.
 *
 * @returns {number} A pseudo-random integer.
 * @throws {RangeError} If bounds are not safe integers, min > max, or the range
 * contains more than 2147483646 integers.
 */
rune.util.Random.prototype.randomInt = function(min, max) {
    if (!rune.util.Math.isNum(min) || !rune.util.Math.isNum(max) ||
        Math.floor(min) !== min || Math.floor(max) !== max ||
        Math.abs(min) > 9007199254740991 || Math.abs(max) > 9007199254740991 ||
        min > max || max - min >= 2147483646) {
        throw new RangeError("Random: Expected safe integer bounds spanning at most 2147483646 values.");
    }

    var range = max - min + 1;
    var limit = 2147483646 - 2147483646 % range;
    var value;

    do {
        value = this.m_next() - 1;
    } while (value >= limit);

    return min + value % range;
};

/**
 * Restarts the sequence with its current seed, or sets a new seed.
 *
 * @param {number} [seed] Integer seed between 1 and 2147483646, inclusive.
 *
 * @returns {undefined}
 * @throws {RangeError} If a supplied seed is outside the supported integer range.
 */
rune.util.Random.prototype.reset = function(seed) {
    seed = seed === undefined ? this.m_seed : seed;

    if (!rune.util.Math.isNum(seed) || Math.floor(seed) !== seed || seed < 1 || seed > 2147483646) {
        throw new RangeError("Random: Expected an integer seed between 1 and 2147483646.");
    }

    this.m_seed = seed;
    this.m_state = seed;
};

/**
 * Shuffles an array in place using Fisher-Yates and returns the same array.
 * Elements are not cloned. Arrays with fewer than two elements do not advance
 * the random sequence. Copy the array first to preserve its original order.
 *
 * @param {Array} array Writable array to shuffle.
 *
 * @returns {Array} The supplied array in its new order.
 * @throws {TypeError} If array is not an Array.
 * @throws {RangeError} If the array contains more than 2147483646 elements.
 */
rune.util.Random.prototype.shuffle = function(array) {
    if (!Array.isArray(array)) {
        throw new TypeError("Random: Expected an array to shuffle.");
    }

    for (var i = array.length - 1; i > 0; i--) {
        var index = this.randomInt(0, i);
        var value = array[i];

        array[i] = array[index];
        array[index] = value;
    }

    return array;
};

/**
 * Returns -1 or 1 with equal probability using the seeded sequence.
 * Each call advances the sequence once.
 *
 * @returns {number} A pseudo-random sign.
 */
rune.util.Random.prototype.sign = function() {
    return this.randomInt(0, 1) === 0 ? -1 : 1;
};

/**
 * Selects an item using relative weights without modifying either array.
 * Each weight must be finite and non-negative, and at least one must be positive.
 * Zero weights exclude items. Weights need not add up to one or one hundred.
 * If only one item has positive weight, the random sequence is not advanced.
 * Probabilities are limited by floating-point precision and generator resolution.
 *
 * @param {Array} items Items to choose from.
 * @param {Array.<number>} weights Relative weights, one per item.
 *
 * @returns {*} The selected item.
 * @throws {TypeError} If either argument is not an Array.
 * @throws {RangeError} If arrays are empty, lengths differ, weights are invalid,
 * or all weights are zero.
 */
rune.util.Random.prototype.weightedPick = function(items, weights) {
    if (!Array.isArray(items) || !Array.isArray(weights)) {
        throw new TypeError("Random: Expected item and weight arrays.");
    }

    if (items.length === 0 || items.length !== weights.length) {
        throw new RangeError("Random: Expected non-empty arrays of equal length.");
    }

    var maximum = 0;
    var positive = 0;
    var last = -1;

    for (var i = 0; i < weights.length; i++) {
        var weight = weights[i];
        if (typeof weight !== "number" || !isFinite(weight) || weight < 0) {
            throw new RangeError("Random: Expected finite, non-negative weights.");
        }
        
        if (weight > 0) {
            maximum = Math.max(maximum, weight);
            positive++;
            last = i;
        }
    }

    if (positive === 0) {
        throw new RangeError("Random: At least one weight must be positive.");
    }

    if (positive === 1) {
        return items[last];
    }

    var total = 0;
    for (var j = 0; j < weights.length; j++) {
        total += weights[j] / maximum;
    }

    var value = this.next() * total;
    for (var k = 0; k < weights.length; k++) {
        var fraction = weights[k] / maximum;
        if (value < fraction) {
            return items[k];
        }

        value -= fraction;
    }

    return items[last];
};

//------------------------------------------------------------------------------
// PRIVATE PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Advances the state using integer arithmetic within JavaScript's exact range.
 *
 * @returns {number} The next state, between 1 and 2147483646, inclusive.
 * @private
 */
rune.util.Random.prototype.m_next = function() {
    this.m_state = this.m_state * 16807 % 2147483647;

    return this.m_state;
};
