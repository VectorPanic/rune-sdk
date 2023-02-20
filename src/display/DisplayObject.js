//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new DisplayObject.
 *
 * @constructor
 * @extends rune.display.InteractiveObject
 * @abstract
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the rectangle.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [width=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [height=0.0] The height of the rectangle, in pixels.
 *
 * @class
 * @classdesc
 * 
 * The DisplayObject class is the base class for all objects that can be placed 
 * on the display list. The display list manages all objects displayed in the 
 * Rune runtimes. Use the DisplayObjectContainer class to arrange the display 
 * objects in the display list. DisplayObjectContainer objects can have child 
 * display objects, while other display objects, such as BitmapFont objects, 
 * are "leaf" nodes that have only parents and siblings, no children.
 */
rune.display.DisplayObject = function(x, y, width, height) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * If debug mode is enabled, this color is used to visualize the geometric 
     * size of the display object. Note that it is the size of the entire 
     * display object and not just the object's hitbox.
     *
     * @type {string}
     * @default rune.util.Palette.WHITE
     */
    this.debugColor = rune.util.Palette.WHITE;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Indicates the alpha transparency value of the object specified. Valid 
     * values are 0 (fully transparent) to 1 (fully opaque). The default value 
     * is 1. Display objects with alpha set to 0 are active, even though they 
     * are invisible.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_alpha = 1.0;
    
    /**
     * The color of the display object background. The default value is "" 
     * (0x00000000).
     *
     * @type {string}
     * @protected
     * @ignore
     */
    this.m_backgroundColor = "";
    
    /**
     * Whether or not a cached version of the object's graphic state exists. 
     * If there is no cache, the object must be rendered.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_cached = false;
    
    /**
     * Used to draw and store the graphical representation (ie bitmap data) 
     * for display objects.
     *
     * @type {rune.display.Canvas}
     * @protected
     * @ignore
     */
    this.m_canvas = null;
    
    /**
     * Whether the display object should be in debug mode (true) or not (false).
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_debug = false;
    
    /**
     * Represents a subsystem for a flicker effect.
     *
     * @type {rune.display.Flicker}
     * @protected
     * @ignore
     */
    this.m_flicker = null;
    
    /**
     * Whether the object is flipped on the x axis.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_flippedX = false;
    
    /**
     * Whether the object is flipped on the y axis.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_flippedY = false;
    
    /**
     * The object's rendering frame describes the dimensions of the object's 
     * graphic representation.
     *
     * @type {rune.display.Frame}
     * @protected
     * @ignore
     */
    this.m_frame = new rune.display.Frame();
    
    /**
     * Reference to possible display group. The reference is null if the object 
     * is not part of a group.
     *
     * @type {rune.display.DisplayGroup}
     * @protected
     * @ignore
     */
    this.m_group = null;
    
    /**
     * Indicates the DisplayObjectContainer object that contains this display 
     * object. Use the parent property to specify a relative path to display 
     * objects that are above the current display object in the display list 
     * hierarchy.
     *
     * @type {rune.display.DisplayObjectContainer}
     * @protected
     * @ignore
     */
    this.m_parent = null;
    
    /**
     * The pivot point of the DisplayObject that it rotates around.
     *
     * @type {rune.geom.Point}
     * @protected
     * @ignore
     */
    this.m_pivot = new rune.geom.Point(0.5, 0.5);
    
    /**
     * Indicates the rotation of the DisplayObject instance, in degrees, from 
     * its original orientation.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_rotation = 0;
    
    /**
     * The object's current scale in the x and y directions.
     *
     * @type {rune.geom.Point}
     * @protected
     * @ignore
     */
    this.m_scale = new rune.geom.Point(1.0, 1.0);
    
    /**
     * Whether or not the display object is visible.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_visible = true;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.display.InteractiveObject.
     */
    rune.display.InteractiveObject.call(this, x, y, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.DisplayObject.prototype = Object.create(rune.display.InteractiveObject.prototype);
rune.display.DisplayObject.prototype.constructor = rune.display.DisplayObject;

//------------------------------------------------------------------------------
// Override public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Indicates the height of the object, in pixels.
 *
 * @member {number} height
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "height", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_height * this.m_scale.y;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        value = value / this.m_scale.y;
        if (this.m_height != value) {
            this.m_height  = value;
            
            this.m_canvas['height'] = value;
            this.breakCache();
        }
    }
});

/**
 * Indicates the width of the object, in pixels.
 *
 * @member {number} width
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "width", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_width * this.m_scale.x;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        value = value / this.m_scale.x;
        if (this.m_width != value) {
            this.m_width  = value;
            
            this.m_canvas['width'] = value;
            this.breakCache();
        }
    }
});

/**
 * Indicates the x coordinate of the DisplayObject instance relative to the 
 * local coordinates of the parent DisplayObjectContainer.
 *
 * @member {number} x
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "x", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_x;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        this.m_previousX = this.m_x;
        if (this.m_x != value) {
            this.m_x =  value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * Indicates the y coordinate of the DisplayObject instance relative to the 
 * local coordinates of the parent DisplayObjectContainer.
 *
 * @member {number} y
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "y", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_y;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        this.m_previousY = this.m_y;
        if (this.m_y != value) {
            this.m_y =  value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Indicates the alpha transparency value of the object specified. Valid 
 * values are 0 (fully transparent) to 1 (fully opaque). The default value 
 * is 1. Display objects with alpha set to 0 are active, even though they 
 * are invisible.
 *
 * @member {number} alpha
 * @memberof rune.display.DisplayObject
 * @instance
 * @default 1.0
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "alpha", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_alpha;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        value = rune.util.Math.clamp(value, 0.0, 1.0);
        if (this.m_alpha != value) {
            this.m_alpha  = value;
            if (this.m_parent != null) {
                this.m_parent.breakCache();
            }
        }
    }
});

/**
 * The color of the display object background. The default value is "" 
 * (0x00000000).
 *
 * @member {DOMString} backgroundColor
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "backgroundColor", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_backgroundColor;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        if (this.m_backgroundColor != value) {
            this.m_backgroundColor  = value;
            
            this.breakCache();
        }
    }
});

/**
 * Whether or not a cached version of the object's graphic state exists. 
 * If there is no cache, the object must be rendered.
 *
 * @member {boolean} cached
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "cached", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_cached;
    }
});

/**
 * Used to draw and store the graphical representation (ie bitmap data) 
 * for display objects.
 *
 * @member {rune.display.Canvas} canvas
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "canvas", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_canvas;
    }
});

/**
 * Whether the display object should be in debug mode (true) or not (false).
 *
 * @member {boolean} debug
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "debug", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_debug;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        if (this.m_debug != value) {
            this.m_debug  = value;
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }   
        }
    }
});

/**
 * A subsystem for flicker effects. Use this reference to start and stop 
 * flicker effects on the current display object.
 *
 * @member {rune.display.Flicker} flicker
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "flicker", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_flicker;
    }
});

/**
 * Whether the object is flipped on the x axis.
 *
 * @member {boolean} flippedX
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "flippedX", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_flippedX;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        if (this.m_flippedX != value) {
            this.m_flippedX  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * Whether the object is flipped on the y axis.
 *
 * @member {boolean} flippedY
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "flippedY", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_flippedY;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        if (this.m_flippedY != value) {
            this.m_flippedY  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * Returns the object's absolute x position, ie coordinates that are relative 
 * to the stage's coordinate system and not the object's parent. Useful when 
 * you want to know the position of an object regardless of its place in the 
 * display list.
 *
 * @member {number} globalX
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "globalX", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.x + ((this.m_parent != null) ? this.m_parent['globalX'] : 0);
    }
});

/**
 * Returns the object's absolute y position, ie coordinates that are relative 
 * to the stage's coordinate system and not the object's parent. Useful when 
 * you want to know the position of an object regardless of its place in the 
 * display list.
 *
 * @member {number} globalY
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "globalY", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.y + ((this.m_parent != null) ? this.m_parent['globalY'] : 0);
    }
});

/**
 * Reference to possible display group. The reference is null if the object is 
 * not part of a group.
 *
 * @member {number} group
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "group", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_group;
    }
});

/**
 * Indicates whether the display object is rendered or not. A visible object 
 * may still be invisible due to other factors such as flicker effects.
 *
 * @member {boolean} hidden
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "hidden", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return (!this['visible'] || !this.m_flicker['visible']);
    }
});

/**
 * Indicates the DisplayObjectContainer object that contains this display 
 * object. Use the parent property to specify a relative path to display 
 * objects that are above the current display object in the display list 
 * hierarchy.
 *
 * @member {rune.display.DisplayObjectContainer} parent
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "parent", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_parent;
    }
});

/**
 * The local x coordinate of the object's pivot point.
 *
 * @member {number} pivotX
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "pivotX", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this['width'] * this.m_pivot.x;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        value = value / this['width'];
        value = rune.util.Math.clamp(value, 0, 1.0);
        
        if (this.m_pivot.x != value) {
            this.m_pivot.x  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * The local y coordinate of the object's pivot point.
 *
 * @member {number} pivotY
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "pivotY", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this['height'] * this.m_pivot.y;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        value = value / this['height'];
        value = rune.util.Math.clamp(value, 0, 1.0);
        
        if (this.m_pivot.y != value) {
            this.m_pivot.y  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * Indicates the rotation of the DisplayObject instance, in degrees, from its 
 * original orientation.
 *
 * @member {number} rotation
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "rotation", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_rotation;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        if (this.m_rotation != value) {
            this.m_rotation  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * Indicates the horizontal scale (percentage) of the object as applied from 
 * the registration point (0,0).
 *
 * @member {number} scaleX
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "scaleX", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_scale.x;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        value = rune.util.Math.clamp(value, 0, Infinity);
        if (this.m_scale.x != value) {
            this.m_scale.x  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * Indicates the vertical scale (percentage) of an object as applied from the 
 * registration point of the object (0,0).
 *
 * @member {number} scaleY
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "scaleY", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_scale.y;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        value = rune.util.Math.clamp(value, 0, Infinity);
        if (this.m_scale.y != value) {
            this.m_scale.y  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

/**
 * Returns the current stage. This reference returns null if the object is not 
 * part of the display list, ie has not been added with addChild.
 *
 * @member {rune.display.Stage} stage
 * @memberof rune.display.DisplayObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "stage", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        if (this.m_parent != null) {
            if (this.m_parent instanceof rune.display.Stage) {
                return this.m_parent;
            } else return this.m_parent['stage'];
        }
        
        return null;
    }
});

/**
 * The height of the display object regardless of scale.
 *
 * @member {number} unscaledHeight
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "unscaledHeight", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_height;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        if (this.m_height != value) {
            this.m_height  = value;
            
            this.m_canvas.height = this.m_height;
            
            this.breakCache();
        }
    }
});

/**
 * The width of the display object regardless of scale.
 *
 * @member {number} unscaledWidth
 * @memberof rune.display.DisplayObject
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "unscaledWidth", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_width;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        if (this.m_width != value) {
            this.m_width  = value;
            
            this.m_canvas.width = this.m_width;
            
            this.breakCache();
        }
    }
});

/**
 * Whether or not the display object is visible.
 *
 * @member {boolean} visible
 * @memberof rune.display.DisplayObject
 * @default true
 * @instance
 */
Object.defineProperty(rune.display.DisplayObject.prototype, "visible", {
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    get : function() {
        return this.m_visible;
    },
    
    /**
     * @this rune.display.DisplayObject
     * @ignore
     */
    set : function(value) {
        if (this.m_visible != value) {
            this.m_visible  = value;
            
            if (this['parent'] != null) {
                this['parent'].breakCache();
            }
        }
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.DisplayObject.prototype.update = function(step) {
    rune.display.InteractiveObject.prototype.update.call(this, step);
    this.m_updateFlicker(step);
};

/**
 * @inheritDoc
 */
rune.display.DisplayObject.prototype.dispose = function() {
    this.m_disposeParent();
    this.m_disposeFlicker();
    this.m_disposeCanvas();
    rune.display.InteractiveObject.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Creates a Rectangle object that represents the display object with absolute 
 * coordinates, ie coordinates that are relative to the stage and not the 
 * parent of the display object. This is useful if, for example, you want to 
 * collision test two display objects that exist in different branches of the 
 * display list. Note that this method is based on the visual representation of 
 * the display object and not the size of its hitbox.
 *
 * @param {rune.geom.Rectangle} [rect] Rectangle to overwrite, if none is specified, a new Rectangle object is created.
 *
 * @returns {rune.geom.Rectangle}
 */
rune.display.DisplayObject.prototype.getGlobalRect = function(rect) {
    rect = rect || new rune.geom.Rectangle();
    
    var parent = null;
    if (this.m_parent != null) {
        parent = this.m_parent.getGlobalRect();
    }
    
    rect['x'] = this['x'] + ((parent) ? parent['x'] : 0);
    rect['y'] = this['y'] + ((parent) ? parent['y'] : 0);
    rect['width']  = this['width'];
    rect['height'] = this['height'];
    
    return rect;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Method that is called automatically when the display object is added to the 
 * display list hierarchy, ie. when the object becomes a child of a parent 
 * object. This method should never be called manually.
 *
 * @returns {undefined}
 */
rune.display.DisplayObject.prototype.init = function() {
    
};

/**
 * Method responsible for rendering the pixel buffer of the display object. 
 * The method can be overridden when "special" rendering is needed.
 *
 * @returns {undefined}
 * @ignore
 */
rune.display.DisplayObject.prototype.render = function() {
    if (this.m_cached == false) {
        this.m_renderBackgroundColor();
        this.m_renderStates();
        
        this.restoreCache();
    }
};

/**
 * Method that is called automatically when the object is removed from the 
 * current display list hierarchy, ie. then its parent becomes null. The 
 * method should never perform, or activate any deallocation process 
 * (use the DISPOSE method for that purpose). This method should never be 
 * called manually.
 *
 * @returns {undefined}
 */
rune.display.DisplayObject.prototype.fini = function() {
    
};

//------------------------------------------------------------------------------
// Internal prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Breaks the cache for this, and all parent objects within the current display 
 * list hierarchy. This process can not be undone. Note that the method is 
 * internal, but there may be times when calls outside the display package may 
 * be justified.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.DisplayObject.prototype.breakCache = function() {
    this.m_cached = false;
    if (this.m_parent != null) {
        this.m_parent.breakCache();
    }
};

/**
 * Returns an object that describes the display object's size and position at 
 * the time of rendering. Note that the method is internal and thus only for 
 * internal use.
 *
 * @return {rune.display.Frame}
 * @package
 * @ignore
 */
rune.display.DisplayObject.prototype.getRenderFrame = function() {
    this.m_frame['x'] = this.m_x;
    this.m_frame['y'] = this.m_y;
    this.m_frame['width']  = this.m_canvas['width']  * this['scaleX'];
    this.m_frame['height'] = this.m_canvas['height'] * this['scaleY'];
    this.m_frame['clipping']['x'] = 0;
    this.m_frame['clipping']['y'] = 0;
    this.m_frame['clipping']['width']  = this.m_canvas['width'];
    this.m_frame['clipping']['height'] = this.m_canvas['height'];
    
    return this.m_frame;
    
    /*
    return new rune.display.Frame(
        this.m_x,
        this.m_y,
        this.m_canvas['width']  * this['scaleX'],
        this.m_canvas['height'] * this['scaleY'],
        0, 
        0,
        this.m_canvas['width'],
        this.m_canvas['height']
    );
    */
};

/**
 * Resets the cache of the current object, but not the remaining parent objects 
 * within the current display list hierarchy. Note that the method is internal, 
 * but there may be times when calls outside the display package may be 
 * justified.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.DisplayObject.prototype.restoreCache = function() {
    this.m_cached = true;
};

/**
 * Sets a reference to the group that the object belongs to. Note that this is 
 * an internal method and only intended for internal use.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.DisplayObject.prototype.setGroup = function(group) {
    this.m_group = group;
};

/**
 * Sets a reference to the object's parent object. Note that this is an 
 * internal method and only for internal use.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.display.DisplayObject.prototype.setParent = function(parent) {
    this.m_parent = parent;
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObject.prototype.m_construct = function() {
    this.m_constructCanvas();
    this.m_constructHitbox();
    this.m_constructFlicker();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Creates a new canvas. 
 *
 * @param {number} [w] The width of the canvas.
 * @param {number} [h] The height of the canvas.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObject.prototype.m_constructCanvas = function(w, h) {
    this.m_disposeCanvas();
    if (this.m_canvas == null) {
        this.m_canvas = new rune.display.Canvas(
            w || this.m_width, 
            h || this.m_height
        );
    }
};

/**
 * Creates the subsystem for flicker effects.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObject.prototype.m_constructFlicker = function() {
    this.m_disposeFlicker();
    if (this.m_flicker == null) {
        this.m_flicker = new rune.display.Flicker(this);
    }
};

/**
 * Updates the flicker effects subsystem.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObject.prototype.m_updateFlicker = function(step) {
    if (this.m_flicker != null) {
        this.m_flicker.update(step);
    }
};

/**
 * Clears the object's pixel buffer (Canvas).
 *
 * @return {undefined}
 * @ignore
 */
rune.display.DisplayObject.prototype.m_renderBackgroundColor = function() {
    if (this.m_canvas != null) {
        if (this.m_backgroundColor != "") this.m_canvas.drawFill(this.m_backgroundColor);
        else this.m_canvas.clear();
    }
};

/**
 * Removes the current object from its parent object.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObject.prototype.m_disposeParent = function() {
    if (this.m_parent != null) {
        this.m_parent.removeChild(this, false);
        this.m_parent = null;
    }
};

/**
 * Destroys the flicker effects subsystem.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObject.prototype.m_disposeFlicker = function() {
    if (this.m_flicker != null) {
        this.m_flicker.dispose();
        this.m_flicker = null;
    }
};

/**
 * Removes the current canvas.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObject.prototype.m_disposeCanvas = function() {
    if (this.m_canvas != null) {
        this.m_canvas.dispose();
        this.m_canvas = null;
    }
};