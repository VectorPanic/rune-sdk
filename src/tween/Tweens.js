//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of Tweens.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Tweens class represents a Tween-based animation handler. With Tweens, 
 * it is possible to create and remove Tween objects that handle interpolation 
 * of one or more properties of an object.
 */
rune.tween.Tweens = function() {
	
	//--------------------------------------------------------------------------
	// Public properties
	//--------------------------------------------------------------------------
	
	/**
	 * If set to True, all Tween objects handled by this Tweens instance are 
     * paused.
	 * 
	 * @type {boolean}
	 * @default false
	 */
	this.paused = false;
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * List of all active tween objects.
	 * 
	 * @type {Array.<rune.tween.Tween>}
	 * @private
	 */
	this.m_tweens = [];
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The number of Tween objects handled by this instance. When a Tween is 
 * completed, it is automatically removed.
 *
 * @member {number} length
 * @memberof rune.tween.Tweens
 * @instance
 * @readonly
 */
Object.defineProperty(rune.tween.Tweens.prototype, "length", {
    /**
     * @this rune.tween.Tweens
     * @ignore
     */
    get : function() {
        return this.m_tweens.length;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Removes all Tween objects from this handler. Ongoing interpolations are 
 * interrupted and thus will not be completed.
 *
 * @returns {undefined}
 */
rune.tween.Tweens.prototype.clear = function() {
	this.m_disposeTweens();
};

/**
 * Creates a new Tween object based on the specified option object.
 *
 * @param {Object} options Tween options.
 *
 * @returns {rune.tween.Tween}
 */
rune.tween.Tweens.prototype.create = function(options) {
	var tween = new rune.tween.Tween(options);
	this.m_tweens.push(tween);
    tween.init();
    
	return tween;
};

/**
 * Removes a specific tween object based on the object reference.
 *
 * @param {rune.tween.Tween} tween Tween object to remove.
 *
 * @returns {undefined}
 */
rune.tween.Tweens.prototype.remove = function(tween) {
	this.m_disposeTween(tween);
};

/**
 * Removes all Tween objects registered to the specified target object.
 *
 * @param {Object} target Removes all Tween objects from this object.
 *
 * @returns {undefined}
 */
rune.tween.Tweens.prototype.removeFrom = function(target) {
    for (var i = 0; i < this.m_tweens.length; i++) {
        if (this.m_tweens[i]['target'] == target) {
            this.m_tweens.splice(i, 1);
        }
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates calculations for all registered interpolations. Note that this is 
 * an internal process and should therefore not be called manually.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.tween.Tweens.prototype.update = function(step) {
	if (this.paused === false) {
        this.m_updateTweens(step);
    }
};

/**
 * Prepares for removal of the object.
 *
 * @returns {undefined}
 * @ignore
 */
rune.tween.Tweens.prototype.dispose = function() {
	this.m_disposeTweens();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates all Tween objects.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.tween.Tweens.prototype.m_updateTweens = function(step) {
    var i = this.m_tweens.length;
    while (i--) {
        if (this.m_tweens[i].update(step)) {
            this.m_disposeTween(this.m_tweens[i]);
        }
    }
};

/**
 * Removes all Tween objects.
 *
 * @returns {undefined}
 * @private
 */
rune.tween.Tweens.prototype.m_disposeTweens = function() {
    var i = this.m_tweens.length;
    while (i--) {
        this.m_disposeTween(this.m_tweens[i]);
    }
};

/**
 * Removes a Tween object.
 *
 * @param {rune.tween.Tween} tween Tween object to remove.
 *
 * @throws {TypeError} If the specified object is not of the correct type.
 *
 * @returns {undefined}
 * @private
 */
rune.tween.Tweens.prototype.m_disposeTween = function(tween) {
    if (tween instanceof rune.tween.Tween) {
        tween.dispose();
        var i = this.m_tweens.indexOf(tween);
        this.m_tweens.splice(i, 1);
    } else throw new TypeError();
};