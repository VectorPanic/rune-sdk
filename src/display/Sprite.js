//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Sprite class.
 *
 * @constructor
 * @extends rune.display.Graphic
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the rectangle.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [width=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [height=0.0] The height of the rectangle, in pixels.
 * @param {string} [resource=""] Name of the resource to be used as texture data. 
 *
 * @class
 * @classdesc
 * 
 * The Sprite class represents a graphic object with keyframe-based animation 
 * based on the object's texture data.
 */
rune.display.Sprite = function(x, y, width, height, resource) {
	
	//--------------------------------------------------------------------------
	// Protected properties
	//--------------------------------------------------------------------------
	
	/**
	 * Reference to the animation system that the object uses to calculate 
	 * which part of its texture data is to be rendered to the object's pixel 
	 * buffer.
	 *
	 * @type {rune.animation.Animations}
	 * @protected
	 * @ignore
	 */
	this.m_animations = null;
	
	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend Graphic.
	 */
	rune.display.Graphic.call(this, x, y, width, height, resource);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.Sprite.prototype = Object.create(rune.display.Graphic.prototype);
rune.display.Sprite.prototype.constructor = rune.display.Sprite;

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the object's internal animation system. Use this reference to 
 * add, or delete, animation sequences for this object.
 *
 * @member {rune.animation.Animations} animations
 * @memberof rune.display.Sprite
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Sprite.prototype, "animation", {
	/**
	 * @this rune.display.Sprite
	 * @ignore
	 */
	get : function() {
		return this.m_animations;
	}
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.Sprite.prototype.update = function(step) {
	rune.display.Graphic.prototype.update.call(this, step);
	this.m_updateAnimation(step);
};

/**
 * @inheritDoc
 */
rune.display.Sprite.prototype.dispose = function() {
	this.m_disposeAnimation();
	rune.display.Graphic.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.Sprite.prototype.m_construct = function() {
	rune.display.Graphic.prototype.m_construct.call(this);
	this.m_constructAnimations();
	this.m_movable = true;
};

/**
 * @inheritDoc
 */
rune.display.Sprite.prototype.m_renderTexture = function() {
	this.m_canvas.drawImage(
		this.m_texture['data'],
		0,
		0,
		this.m_canvas.width,
		this.m_canvas.height,
		this.m_animations['frame']['x'],
		this.m_animations['frame']['y'],
		this.m_canvas.width,
		this.m_canvas.height
	);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the animation subsystem.
 *
 * @throws {Error} If the system already exists.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Sprite.prototype.m_constructAnimations = function() {
	this.m_disposeAnimation();
	if (this.m_animations == null) {
		this.m_animations = new rune.animation.Animations(this);
	} else throw new Error();
};

/**
 * Updates the animation subsystem.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Sprite.prototype.m_updateAnimation = function(step) {
	if (this.m_animations != null) {
		this.m_animations.update(step)
	}
};

/**
 * Destroy the animation subsystem.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.Sprite.prototype.m_disposeAnimation = function() {
	if (this.m_animations != null) {
		this.m_animations.dispose();
		this.m_animations = null;
	}
};