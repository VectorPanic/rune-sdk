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
