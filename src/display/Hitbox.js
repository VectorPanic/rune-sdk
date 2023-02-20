//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Hitbox.
 * 
 * @constructor
 *
 * @param {rune.display.InteractiveObject} obj The owner of the hitbox.
 *
 * @class
 * @classdesc
 * 
 * Represents a bounding box for an interactive object. Useful when you want to 
 * limit collision detection to a specific part of an interactive object. The 
 * class is primarily intended to be used internally by Rune. For example, the 
 * DisplayObject class uses an instance of Hitbox to do all of its collision 
 * handling.
 *
 * @see rune.display.DisplayObject
 * @see rune.physics.Space
 */
rune.display.Hitbox = function(obj) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Used to activate debug mode, which illustrates the hitbox as a colored 
     * rectangle.
     *
     * @type {boolean}
     * @default false
     */
    this.debug = false;
    
    /**
     * The line color to use for the debug rectangle.
     *
     * @type {string}
     * @default rune.util.Palette.GREEN
     */
    this.debugColor = rune.util.Palette.GREEN;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Reference to the owner of the hitbox.
     *
     * @type {rune.display.InteractiveObject}
     * @protected
     * @ignore
     */
    this.m_interactiveObject = obj;
    
    /**
     * The height of the hitbox, in pixels.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_height = obj['height'];
    
    /**
     * The width of the hitbox, in pixels.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_width = obj['width'];
    
    /**
     * The horizontal coordinate of the hitbox.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_x = 0.0;

    /**
     * The vertical coordinate of the hitbox.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_y = 0.0;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The sum of the y and height properties.
 *
 * @member {number} bottom
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "bottom", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this['y'] + this['height'];
    }
});

/**
 * The location of the hitbox object's bottom-left corner, determined by the
 * values of the left and bottom properties.
 *
 * @member {rune.geom.Point} bottomLeft
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "bottomLeft", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return new rune.geom.Point(this['x'], this['y'] + this['height']);
    }
});

/**
 * The location of the hitbox object's bottom-right corner, determined by 
 * the values of the right and bottom properties.
 *
 * @member {rune.geom.Point} bottomRight
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "bottomRight", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return new rune.geom.Point(this['x'] + this['width'], this['y'] + this['height']);
    }
});

/**
 * The center point of the hitbox object.
 *
 * @member {rune.geom.Point} center
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "center", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return new rune.geom.Point(this['x'] + (this['width'] >> 1), this['y'] + (this['height'] >> 1));
    }
});

/**
 * The x coordinate of the center of the object.
 *
 * @member {number} centerX
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "centerX", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this['x'] + (this['width'] >> 1);
    }
});

/**
 * The y coordinate of the center of the object.
 *
 * @member {number} centerY
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "centerY", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this['y'] + (this['height'] >> 1);
    }
});

/**
 * The height of the hitbox, in pixels.
 *
 * @member {number} height
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "height", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this.m_height * this.m_interactiveObject['scaleY'];
    }
});

/**
 * The x coordinate of the top-left corner of the hitbox.
 *
 * @member {number} left
 * @memberof rune.display.Hitbox
 * @instance
 */
Object.defineProperty(rune.display.Hitbox.prototype, "left", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this['x'];
    }
});

/**
 * The previous x position of the hitbox.
 *
 * @member {number} previousX
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "previousX", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this.m_interactiveObject['previousX'] + (this.m_interactiveObject['scaleX'] * this.m_x);
    }
});

/**
 * The previous y position of the hitbox.
 *
 * @member {number} previousY
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "previousY", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this.m_interactiveObject['previousY'] + (this.m_interactiveObject['scaleY'] * this.m_y);
    }
});

/**
 * The sum of the x and width properties.
 *
 * @member {number} right
 * @memberof rune.display.Hitbox
 * @instance
 */
Object.defineProperty(rune.display.Hitbox.prototype, "right", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this['x'] + this['width'];
    }
});

/**
 * The y coordinate of the top-left corner of the hitbox.
 *
 * @member {number} top
 * @memberof rune.display.Hitbox
 * @instance
 */
Object.defineProperty(rune.display.Hitbox.prototype, "top", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this['y'];
    }
});

/**
 * The location of the hitbox object's top-left corner, determined by the x 
 * and y coordinates of the point.
 *
 * @member {number} topLeft
 * @memberof rune.display.Hitbox
 * @instance
 */
Object.defineProperty(rune.display.Hitbox.prototype, "topLeft", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return new rune.geom.Point(this['x'], this['y']);
    }
});

/**
 * The location of the hitbox object's top-right corner, determined by the x 
 * and y coordinates of the point.
 *
 * @member {number} topRight
 * @memberof rune.display.Hitbox
 * @instance
 */
Object.defineProperty(rune.display.Hitbox.prototype, "topRight", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return new rune.geom.Point(this['x'] + this['width'], this['y']);
    }
});

/**
 * The width of the hitbox, in pixels.
 *
 * @member {number} width
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "width", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this.m_width * this.m_interactiveObject['scaleX'];
    }
});

/**
 * The horizontal coordinate of the hitbox.
 *
 * @member {number} x
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "x", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this.m_interactiveObject['x'] + (this.m_interactiveObject['scaleX'] * this.m_x);
    }
});

/**
 * The vertical coordinate of the hitbox.
 *
 * @member {number} y
 * @memberof rune.display.Hitbox
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Hitbox.prototype, "y", {
    /**
     * @this rune.display.Hitbox
     * @ignore
     */
    get : function() {
        return this.m_interactiveObject['y'] + (this.m_interactiveObject['scaleY'] * this.m_y);
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Set the position and size of the hitbox. Note that x and y coordinates are 
 * relative to the interactive object that owns the hitbox.
 *
 * @param {number} x The x position of the hitbox
 * @param {number} y The y position of the hitbox
 * @param {number} width The width of the hitbox
 * @param {number} height The height of the hitbox
 *
 * @return {undefined}
 */
rune.display.Hitbox.prototype.set = function(x, y, width, height) {
    this.m_x = x;
    this.m_y = y;
    this.m_width = width;
    this.m_height = height;
};

/**
 * Returns a string representation of the hitbox. Useful for troubleshooting.
 *
 * @return {string}
 */
rune.geom.Rectangle.prototype.toString = function() {
    return "[{Rectangle (x=" + this['x'] + " y=" + this['y'] + " width=" + this['width'] + " height=" + this['height'] + ")}]";
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Destroys the current hitbox and clears it from memory.
 *
 * @return {undefined}
 * @ignore
 */
rune.display.Hitbox.prototype.dispose = function() {
    // NOTHING, ATM.
};