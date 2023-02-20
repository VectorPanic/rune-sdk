//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new CameraTint object.
 *
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * The CameraTint class represents a colored overlay that can be applied to 
 * Camera objects.
 */
rune.camera.CameraTint = function() {
	
	//--------------------------------------------------------------------------
	// Protected properties
	//--------------------------------------------------------------------------
	
	/**
	 * 24-bit tint color.
	 *
	 * @type {rune.color.Color24}
	 * @protected
	 * @ignore
	 */
	this.m_color = null;
	
	/**
	 * Tint color opacity.
	 *
	 * @type {number}
	 * @protected
	 * @ignore
	 */
	this.m_opacity = 0.0;
	
	//--------------------------------------------------------------------------
	// Constructor call
	//--------------------------------------------------------------------------
	
	/**
	 * Invokes secondary class constructor.
	 */
	this.m_construct();
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * 24-bit tint color.
 *
 * @member {rune.color.Color24} color
 * @memberof rune.camera.CameraTint
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.CameraTint.prototype, "color", {
	/**
	 * @this rune.camera.CameraTint
	 * @ignore
	 */
	get : function() {
		return this.m_color;
	},
});

/**
 * Tint color opacity. This value can vary between 0.0 and 1.0.
 *
 * @member {number} opacity
 * @memberof rune.camera.CameraTint
 * @instance
 */
Object.defineProperty(rune.camera.CameraTint.prototype, "opacity", {
	/**
	 * @this rune.camera.CameraTint
	 * @ignore
	 */
	get : function() {
		return this.m_opacity;
	},
	
	/**
	 * @this rune.camera.CameraTint
	 * @ignore
	 */
	set : function(value) {
		this.m_opacity = rune.util.Math.clamp(value, 0.0, 1.0);
	}
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Returns an RGBA representation of the object.
 *
 * @returns {string}
 */
rune.camera.CameraTint.prototype.toString = function() {
	var r = this.m_color['r']['value'];
	var g = this.m_color['g']['value'];
	var b = this.m_color['b']['value'];
	var a = this.m_opacity;
	
	return "rgba(" + r + "," + g + "," + b + "," + a +")";
}

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the object.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraTint.prototype.update = function(step) {
	// NOTHING, YET..
}

/**
 * Removes the object from memory.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraTint.prototype.dispose = function() {
	this.m_disposeColor();
}

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.camera.CameraTint.prototype.m_construct = function() {
	this.m_constructColor();
};

/**
 * Creates the color object.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.camera.CameraTint.prototype.m_constructColor = function() {
	this.m_disposeColor();
	if (this.m_color == null) {
		this.m_color = new rune.color.Color24();
	}
};

/**
 * Removes the color object.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.camera.CameraTint.prototype.m_disposeColor = function() {
	if (this.m_color instanceof rune.color.Color24) {
		this.m_color.dispose();
		this.m_color = null;
	}
};