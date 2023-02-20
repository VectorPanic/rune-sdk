//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Counter class.
 * 
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {number} [numDigits=5] Number of digits.
 * @param {number} [digitWidth=10] Digit height.
 * @param {number} [digitHeight=10] Digit width.
 * @param {string} [texture="rune_counter_100x10"] Texture for digits.
 * @param {number} [padding=0] Padding between digits.
 *
 * @class
 * @classdesc
 * 
 * The Counter class represents a bitmap based numeric counter. Each digit is 
 * represented by an object of the CounterDigit class.
 */
rune.ui.Counter = function(numDigits, digitWidth, digitHeight, texture, padding) {

	//--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * The height of a digit.
     * 
     * @type {number}
     * @private
     */
    this.m_digitHeight = digitHeight || 10;

    /**
     * List containing the counter's digit objects.
     * 
     * @type {Array.<rune.ui.CounterDigit>}
     * @private
     */
    this.m_digits = [];

    /**
     * The width of a digit.
     * 
     * @type {number}
     * @private
     */
    this.m_digitWidth = digitWidth || 10;

    /**
     * The number of digits.
     * 
     * @type {number}
     * @private
     */
    this.m_numDigits = numDigits || 5;

    /**
     * Padding between digits.
     * 
     * @type {number}
     * @private
     */
    this.m_padding = padding || 0;

    /**
     * Name of texture used to represent digits.
     * 
     * @type {string}
     * @private
     */
    this.m_texture = texture || "rune_texture_counter_digit_10x10";

    /**
     * The actual numeric value of the counter.
     * 
     * @type {number}
     * @private
     */
    this.m_value = 0;

	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.display.DisplayObjectContainer.
	 */
	rune.display.DisplayObjectContainer.call(this, 0, 0, this.m_numDigits * (this.m_digitWidth + this.m_padding), this.m_digitHeight);
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.Counter.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.ui.Counter.prototype.constructor = rune.ui.Counter;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The numerical value of the counter.
 *
 * @member {number} value
 * @memberof rune.ui.Counter
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.Counter.prototype, "value", {
    /**
     * @this rune.ui.Counter
     * @ignore
     */
    get : function() {
        return this.getValue();
    },
    
    /**
     * @this rune.ui.Counter
     * @ignore
     */
    set : function(value) {
        this.setValue(value);
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Gets the numeric value of the Counter object.
 *
 * @returns {number}
 */
rune.ui.Counter.prototype.getValue = function() {
    return this.m_value;
};

/**
 * Sets the numeric value of the Counter object.
 *
 * @param  {number} value Value to set.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.ui.Counter.prototype.setValue = function(value) {
    if (this.m_value != value) {
        this.m_value = value || 0;
        var str = String(value) || "0";
        var arr = str.split("");
        
        while (arr.length < this.m_digits.length) {
            arr.unshift("0");
        }
        
        for (var i = 0; i < this.m_digits.length; i++) {
            this.m_digits[i].value = arr[i];
        }
        
        this.breakCache();   
    }
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.Counter.prototype.m_construct = function() {
    rune.display.DisplayObjectContainer.prototype.m_construct.call(this);
    this.m_constructDigits();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates CounterDigit objects to represent counter digits.
 *
 * @returns {undefined}
 * @private
 */
rune.ui.Counter.prototype.m_constructDigits = function() {
    for (var i = 0; i < this.m_numDigits; i++) {
         var x = (this.m_digitWidth * i) + (i * this.m_padding);
         var t = this.m_texture;
    	 var d = new rune.ui.CounterDigit(x, 0, this.m_digitWidth, this.m_digitHeight, t);
         
    	this.m_digits.push(d);
    	this.addChild(d);
    }
};