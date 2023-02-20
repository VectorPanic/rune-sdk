//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new stage.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @class
 * @classdesc
 * 
 * The rune.display.Stage class represents a metaphorical stage, i.e. the 
 * visual output of the application. For a display object to be rendered, it 
 * must be placed on the stage, or included in the display list of another 
 * object that is placed on the stage. Note that all scenes have access to 
 * their own stage.
 */
rune.display.Stage = function() {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * ...
	 *
	 * @type {rune.tilemap.Tilemap}
	 * @private
	 */
	this.m_map = null;
	
	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend DisplayObjectContainer.
	 */
	rune.display.DisplayObjectContainer.call(this, 0, 0, Infinity, Infinity);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.Stage.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.display.Stage.prototype.constructor = rune.display.Stage;

//------------------------------------------------------------------------------
// Override public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Indicates the alpha transparency value of the stage. This value is always 
 * 1.0 and can not be changed. Attempting to change the value results in a 
 * runtime error.
 *
 * @member {number} alpha
 * @memberof rune.display.Stage
 * @instance
 */
Object.defineProperty(rune.display.Stage.prototype, "alpha", {
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	get : function() {
		return this.m_alpha;
	},
	
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	set : function(value) {
		throw new Error("Illegal operation");
	}
});

/**
 * @inheritDoc
 */
Object.defineProperty(rune.display.Stage.prototype, "rotation", {
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	get : function() {
		return this.m_rotation;
	},
	
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	set : function(value) {
		throw new Error("Illegal operation");
	}
});

/**
 * @inheritDoc
 */
Object.defineProperty(rune.display.Stage.prototype, "visible", {
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	get : function() {
		return this.m_visible;
	},
	
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	set : function(value) {
		throw new Error("Illegal operation");
	}
});

/**
 * @inheritDoc
 */
Object.defineProperty(rune.display.Stage.prototype, "x", {
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	get : function() {
		return this.m_x;
	},
	
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	set : function(value) {
		throw new Error("Illegal operation");
	}
});

/**
 * @inheritDoc
 */
Object.defineProperty(rune.display.Stage.prototype, "y", {
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	get : function() {
		return this.m_y;
	},
	
	/**
	 * @this rune.display.Stage
	 * @suppress {accessControls}
	 * @ignore
	 */
	set : function(value) {
		throw new Error("Illegal operation");
	}
});

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Each Scene has access to its own Tilemap object. Use this reference to load 
 * and manage maps and included Tiles.
 *
 * @member {rune.tilemap.Tilemap} map
 * @memberof rune.display.Stage
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Stage.prototype, "map", {
	/**
	 * @this rune.display.Stage
	 * @ignore
	 */
	get : function() {
		return this.m_map;
	}
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.Stage.prototype.render = function() {
	//DO NOTHING; THE CHILDREN OF THE STAGE SHOULD BE DRAWN BY CAMERAS, NOT THE STAGE ITSELF.
};

/**
 * @inheritDoc
 */
rune.display.Stage.prototype.dispose = function() {
	this.m_disposeTilemap();
	rune.display.DisplayObjectContainer.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.Stage.prototype.m_construct = function() {
	rune.display.DisplayObjectContainer.prototype.m_construct.call(this);
	this.m_constructTilemap();
};

/**
 * @inheritDoc
 */
rune.display.Stage.prototype.m_constructCanvas = function(w, h) {
	//DO NOTHING; STAGE SHOULD NOT HAVE ANY CANVAS OBJECT
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the tilemap manager.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Stage.prototype.m_constructTilemap = function() {
	this.m_disposeTilemap();
	if (this.m_map == null) {
		this.m_map = new rune.tilemap.Tilemap();
	}
};

/**
 * Removes the tilemap manager.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Stage.prototype.m_disposeTilemap = function() {
	if (this.m_map instanceof rune.tilemap.Tilemap) {
		this.m_map.dispose();
		this.m_map = null;
	}
};