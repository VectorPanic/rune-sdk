//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new InteractiveObject.
 *
 * @constructor
 * @extends rune.geom.Rectangle
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
 * The InteractiveObject class is the abstract base class for all display 
 * objects with which the user can interact, using the mouse, keyboard, or 
 * other user input device.
 */
rune.display.InteractiveObject = function(x, y, width, height) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * The mass of the object. This value is used to calculate the impact when 
     * the object collides with another object with mass.
     *
     * @type {number}
     * @default 1.0
     */
    this.mass = 1.0;
    
    /**
     * The elasticity of the object. Used to calculate the impact when two 
     * objects collide with each other. The greater the value, the more bouncy 
     * the object behaves.
     *
     * @type {number}
     * @default 0.0
     */
    this.elasticity = 0.0;
    
    /**
     * Used in collision handling. If an object is sticky, other objects 
     * placed on top of the object may follow its movement. This is useful 
     * when developing platform games as a player can, for example, ride on 
      moving platforms or other objects.
     *
     * @type {boolean}
     * @default false
     */
    this.sticky = false;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether the object should be automatically updated by its parent object. 
     * Inactive objects are still rendered. the default value is true.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_active = true;
    
    /**
     * Describes the type of collision to which the object responds.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_allowCollisions = rune.physics.Space.ANY;
    
    /**
     * Represents a boundary box used for collision detection.
     *
     * @type {rune.display.Hitbox}
     * @protected
     * @ignore
     */
    this.m_hitbox = null;
    
    /**
     * Whether the object may change position when it collides with another 
     * object.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_immovable = false;
    
    /**
     * Whether the object should be moved automatically when it is assigned 
     * velocity. Not all interactive objects need this functionality enabled.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_movable = false;
    
    /**
     * The object's x position from the previous update.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_previousX = x || 0.0;

    /**
     * The object's y position from the previous update.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_previousY = y || 0.0;
    
    /**
     * The object's current scale in the x and y directions.
     *
     * @type {rune.geom.Point}
     * @protected
     * @ignore
     */
    this.m_scale = new rune.geom.Point(1.0, 1.0);
    
    /**
     * A finite-state machine.
     *
     * @type {rune.state.States}
     * @protected
     * @ignore
     */
    this.m_states = null;
    
    /**
     * Indicates whether the object collides with another object.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_touching = rune.physics.Space.NONE;
    
    /**
     * Indicates whether the object collided with another object during the 
     * previous check.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_touched = rune.physics.Space.NONE;
    
    /**
     * The velocity of the object. This object is used to calculate the 
     * object's direction of travel and speed. Note that the object is only 
     * used when the movable property is set to true.
     *
     * @type {rune.physics.Velocity}
     * @protected
     * @ignore
     */
    this.m_velocity = new rune.physics.Velocity(0, 0);

	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.geom.Rectangle
	 */
	rune.geom.Rectangle.call(this, x, y, width, height);
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.InteractiveObject.prototype = Object.create(rune.geom.Rectangle.prototype);
rune.display.InteractiveObject.prototype.constructor = rune.display.InteractiveObject;

//------------------------------------------------------------------------------
// Override public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Indicates the height of the object, in pixels.
 *
 * @member {number} height
 * @memberof rune.display.InteractiveObject
 * @instance
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "height", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_height * this.m_scale.y;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        value = value / this.m_scale.y;
        this.m_height = value;
    }
});

/**
 * Indicates the width of the object, in pixels.
 *
 * @member {number} width
 * @memberof rune.display.InteractiveObject
 * @instance
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "width", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_width * this.m_scale.x;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        value = value / this.m_scale.x;
        this.m_width = value;
    }
});

//------------------------------------------------------------------------------
// Public getter and setter methods (API)
//------------------------------------------------------------------------------

/**
 * Whether the object should be automatically updated by its parent object. 
 * Inactive objects are still rendered. the default value is true.
 *
 * @member {boolean} active
 * @memberof rune.display.InteractiveObject
 * @instance
 * @default true
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "active", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_active;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    set : function(value) {
        this.m_active = value;
    }
});

/**
 * Describes the type of collision to which the object responds.
 *
 * @member {number} allowCollisions
 * @memberof rune.display.InteractiveObject
 * @instance
 * @default rune.physics.Space.ANY
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "allowCollisions", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_allowCollisions;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    set : function(value) {
        this.m_allowCollisions = value;
    }
});

/**
 * Reference to the application's entry point class, ie. the main class of the 
 * application. Useful for accessing the application's subsystem.
 *
 * @member {rune.system.Application} application
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "application", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return rune.system.Application['instance'];
    }
});

/**
 * Reference to the application's subsystem for connected gamepad devices.
 *
 * @member {rune.input.Gamepads} gamepads
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "gamepads", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return rune.system.Application['instance']['inputs']['gamepads'];
    }
});

/**
 * Represents a boundary box used for collision detection. Use the object's 
 * set() method to specify position and size. By default, it is positioned at 
 * 0, 0 and has the same size as the interactive object.
 *
 * @member {rune.display.Hitbox} hitbox
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "hitbox", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_hitbox;
    }
});

/**
 * Whether the object may change position when it collides with another 
 * object.
 *
 * @member {boolean} immovable
 * @memberof rune.display.InteractiveObject
 * @instance
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "immovable", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_immovable;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    set : function(value) {
        this.m_immovable = value;
    }
});

/**
 * Reference to the keyboard manager. Use this reference to read the state of 
 * any keyboard key.
 *
 * @member {rune.input.Keyboard} keyboard
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "keyboard", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return rune.system.Application['instance']['inputs']['keyboard'];
    }
});

/**
 * Whether the object may change position when it collides with another 
 * object.
 *
 * @member {boolean} immovable
 * @memberof rune.display.InteractiveObject
 * @instance
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "movable", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_movable;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    set : function(value) {
        this.m_movable = value;
    }
});

/**
 * Indicates the horizontal scale (percentage) of the object as applied from 
 * the upper left corner. 1.0 is 100% scale.
 *
 * @member {number} scaleX
 * @memberof rune.display.InteractiveObject
 * @instance
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "scaleX", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_scale.x;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    set : function(value) {
        value = rune.util.Math.clamp(value, 0, Infinity);
        this.m_scale.x = value;
    }
});

/**
 * Indicates the vertical scale (percentage) of an object as applied from the 
 * upper left corner. 1.0 is 100% scale.
 *
 * @member {number} scaleY
 * @memberof rune.display.InteractiveObject
 * @instance
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "scaleY", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_scale.y;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    set : function(value) {
        value = rune.util.Math.clamp(value, 0, Infinity);
        this.m_scale.y = value;
    }
});

/**
 * A finite-state machine. Use this reference to apply isolated behavioral 
 * states to the object.
 *
 * @member {rune.state.States} states
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "states", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_states;
    }
});

/**
 * Whether the object touched another object in the previous update. See 
 * [touching]{@link rune.display.InteractiveObject#touching} for more 
 * information.
 *
 * @see rune.physics.Space
 *
 * @member {number} touched
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "touched", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_touched;
    }
});

/**
 * Whether the object touches another object and in such cases in which 
 * directions. The value is represented by a bit field and thus several 
 * directions can be true at the same time.
 *
 * @see rune.physics.Space
 *
 * @member {number} touching
 * @memberof rune.display.InteractiveObject
 * @instance
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "touching", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_touching;
    },
    
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    set : function(value) {
        this.m_touching = value;
    }
});

/**
 * The velocity of the object. This object is used to calculate the object's 
 * direction of travel, as well as its speed. Note that the object is only 
 * used when the movable property is set to true.
 *
 * @member {rune.physics.Velocity} velocity
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "velocity", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_velocity;
    }
});

//------------------------------------------------------------------------------
// Public getter and setter methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * The object's x position from the previous update. This value is used to 
 * calculate motion in the event of a collision.
 *
 * @member {number} previousX
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 * @ignore
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "previousX", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_previousX;
    }
});

/**
 * The object's y position from the previous update. This value is used to 
 * calculate motion in the event of a collision.
 *
 * @member {number} previousY
 * @memberof rune.display.InteractiveObject
 * @instance
 * @readonly
 * @ignore
 */
Object.defineProperty(rune.display.InteractiveObject.prototype, "previousY", {
    /**
     * @this rune.display.InteractiveObject
     * @ignore
     */
    get : function() {
        return this.m_previousY;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Evaluates whether the object's hitbox overlaps or intersects with the 
 * parameter object's hitbox.
 *
 * @param {rune.display.Stage|rune.display.InteractiveObject|rune.display.DisplayGroup|rune.tilemap.TilemapLayer|rune.geom.Point|Array} obj The object to be evaluated.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.hitTest = function(obj, callback, scope) {
    if      (obj instanceof rune.display.Stage)             return this.hitTestChildrenOf(obj, callback, scope);
    else if (obj instanceof rune.display.InteractiveObject) return this.hitTestObject(obj, callback, scope);
    else if (obj instanceof rune.display.DisplayGroup)      return this.hitTestGroup(obj, callback, scope);
    else if (obj instanceof rune.tilemap.TilemapLayer)      return this.hitTestTilemapLayer(obj, callback, scope);
    else if (obj instanceof rune.geom.Point)                return this.hitTestPoint(obj, callback, scope);
    else if (obj instanceof Array)                          return this.hitTestContentOf(obj, callback, scope);
    else                                                    return false;
};

/**
 * Evaluates the bounding box of the interactive object to see if it overlaps 
 * or intersects the bounding box of any of the container object's children. 
 * The method returns true if this happens to any of the children. The callback 
 * method is activated for each child that is overlapped.
 *
 * @param {rune.display.DisplayObjectContainer} parent Container object whose children are to be checked.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @throws {Error} If the specified argument is not of type DisplayObjectContainer.
 *
 * @returns {boolean} If any of the container object's children are overlapped by this object, true is returned, otherwise false.
 */
rune.display.InteractiveObject.prototype.hitTestChildrenOf = function(parent, callback, scope) {
    if (parent instanceof rune.display.DisplayObjectContainer) {
        var children = parent.getChildren();
        var output = false;
        var i = children.length;
        while (i--) {
            if (this != children[i]) {
                if (this.hitTestObject(children[i], callback, scope)) {
                    output = true;
                }   
            }
        }   
    } else throw new Error();
    
    return output;
};

/**
 * Evaluates whether the object's hitbox overlaps or intersects the 
 * hitbox of any other object in the specified list. The list can 
 * contain a mixture of data types, provided that each data type is 
 * supported by the hitTest method.
 *
 * @param {Array} array Container object whose children are to be checked.
 * @param {Function} [callback] Executed for each detected collision.
 * @param {Object} [scope] Scope of execution for the callback method.
 *
 * @throws {Error} If the specified argument is not of type DisplayObjectContainer.
 *
 * @returns {boolean} If any of the container object's children are overlapped by this object, true is returned, otherwise false.
 */
rune.display.InteractiveObject.prototype.hitTestContentOf = function(array, callback, scope) {
    var result = false;
    for (var i = 0; i < array.length; i++) {
        if (this.hitTest(array[i], callback, scope)) {
            result = true;
        }
    }
    
    return result;
};

/**
 * Evaluates the bounding box of the interactive object to see if it overlaps 
 * or intersects with the bounding box of the obj interactive object.
 *
 * @param {rune.display.InteractiveObject} obj The interactive object to test against.
 * @param {Function} [callback] Executed in case of collision.
 * @param {Object} [scope] Scope of execution for callback method.
 *
 * @returns {boolean} true if the bounding boxes of the interactive objects intersect; false if not.
 */
rune.display.InteractiveObject.prototype.hitTestObject = function(obj, callback, scope) {
    if (obj != null && obj['hitbox'] != null && this['hitbox'] != null) {
        if (rune.geom.Rectangle.intersects(
            this['hitbox']['x'],
            this['hitbox']['y'],
            this['hitbox']['width'],
            this['hitbox']['height'],
            obj['hitbox']['x'],
            obj['hitbox']['y'],
            obj['hitbox']['width'],
            obj['hitbox']['height']
        )) {
            if (typeof callback === "function") {
                callback.call(scope || this, this, obj);
            }
            
            return true;
        }   
    }
    
    return false;
};

/**
 * Evaluates whether the object's hitbox overlaps or intersects the hitbox of 
 * any member of a group. The evaluation is carried out against all members of 
 * the group. The method returns true if there was an overlap, false otherwise.
 *
 * @param {rune.display.DisplayGroup} group Group to evaluate.
 * @param {Function} [callback] Executed automatically in case of overlap.
 * @param {Object} [scope] Scope within the callback method must be executed.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.hitTestGroup = function(group, callback, scope) {
    var result = false;
    group.forEachMember(function(member) {
        if (this.hitTestObject(member, callback, scope)) {
            result = true;
        }
    }, this);
    
    return result;
};

/**
 * Evaluates whether the object's hitbox overlaps or intersects a solid tile 
 * within a tilemap layer.
 *
 * @param {rune.tilemap.TilemapLayer} layer Layer to evaluate.
 * @param {Function} [callback] Executed automatically in case of overlap.
 * @param {Object} [scope] Scope within the callback method must be executed.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.hitTestTilemapLayer = function(layer, callback, scope) {
    return layer.hitTest(this, callback, scope);
};

/**
 * Evaluates and resolves collision between the object's hitbox and the given 
 * argument object.
 *
 * @param {rune.display.Stage|rune.display.InteractiveObject|rune.display.DisplayGroup|rune.tilemap.TilemapLayer|Array} obj The object to be evaluated.
 * @param {Function} [callback] Executed automatically in case of overlap.
 * @param {Object} [scope] Scope within the callback method must be executed.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.hitTestAndSeparate = function(obj, callback, scope) {
    if      (obj instanceof rune.display.Stage)             return this.hitTestAndSeparateChildrenOf(obj, callback, scope);
    else if (obj instanceof rune.display.InteractiveObject) return this.hitTestAndSeparateObject(obj, callback, scope);
    else if (obj instanceof rune.display.DisplayGroup)      return this.hitTestAndSeparateGroup(obj, callback, scope);
    else if (obj instanceof rune.tilemap.TilemapLayer)      return this.hitTestAndSeparateTilemapLayer(obj, callback, scope);
    else if (obj instanceof Array)                          return this.hitTestAndSeparateContentOf(obj, callback, scope);
    else                                                    return false;
};

/**
 * Evaluates and resolves collision between this object's hitbox and the 
 * hitbox of all children of the specified argument object. Note that this 
 * method does not include the actual argument object, only its children.
 *
 * @param {rune.display.DisplayObjectContainer} parent The container object to be evaluated.
 * @param {Function} [callback] Executed automatically in case of overlap.
 * @param {Object} [scope] Scope within the callback method must be executed.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.hitTestAndSeparateChildrenOf = function(parent, callback, scope) {
    var result = false;
    parent.forEachChild(function(child) {
        if (this.hitTestAndSeparateObject(child, callback, scope)) {
            result = true;
        }
    }, this);
    
    return result;
};

/**
 * Evaluates and resolves hitbox-based collision between the object 
 * and other objects in a list structure (array).
 *
 * @param {Array} array The array object to be evaluated.
 * @param {Function} [callback] Executed automatically in case of overlap.
 * @param {Object} [scope] Scope within the callback method must be executed.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.hitTestAndSeparateContentOf = function(array, callback, scope) {
    var result = false;
    for (var i = 0; i < array.length; i++) {
        if (this.hitTestAndSeparate(array[i], callback, scope)) {
            result = true;
        }
    }
    
    return result;
};

/**
 * Evaluates whether the object's bounding box overlaps a bounding box of 
 * another object and in the event of a collision, the objects are separated 
 * in order to resolve the collision.
 *
 * @param {rune.display.InteractiveObject} obj The interactive object to test against.
 * @param {Function} [callback=null] Executed in case of collision.
 * @param {Object} [scope=this] Scope of execution for callback method.
 *
 * @returns {boolean} True if there was a collision, otherwise false.
 */
rune.display.InteractiveObject.prototype.hitTestAndSeparateObject = function(obj, callback, scope) {
    if (this.hitTestObject(obj)) {
        if (rune.physics.Space.separate(this, obj)) {
            if (typeof callback === "function") {
                callback.call(scope || this, this, obj);
            }
        }
        
        return true;
    }
    
    return false;
};

/**
 * Evaluates whether this object's hitbox overlaps or intersects any hitbox of 
 * the members of the specified group object.
 *
 * @param {rune.display.DisplayGroup} group Group to evaluate.
 * @param {Function} [callback=null] Executed in case of collision.
 * @param {Object} [scope=this] Scope of execution for callback method.
 *
 * @returns {boolean} True if there was a collision, otherwise false.
 */
rune.display.InteractiveObject.prototype.hitTestAndSeparateGroup = function(group, callback, scope) {
    var result = false;
    group.forEachMember(function(member) {
        if (this.hitTestAndSeparateObject(member, callback, scope)) {
            result = true;
        }
    }, this);
    
    return result;
};

/**
 * Evaluates, and resolves, collision between this object's hitbox and any 
 * solid tile within the specified tilemap layer.
 *
 * @param {rune.tilemap.TilemapLayer} layer Layer to evaluate.
 * @param {Function} [callback=null] Executed in case of collision.
 * @param {Object} [scope=this] Scope of execution for callback method.
 *
 * @returns {boolean} True if there was a collision, otherwise false.
 */
rune.display.InteractiveObject.prototype.hitTestAndSeparateTilemapLayer = function(layer, callback, scope) {
    return layer.hitTestAndSeparate(this, callback, scope);
};

/**
 * Evaluates the bounding box of the interactive object to see if it overlaps 
 * or intersects with a point object.
 *
 * @param {rune.geom.Point} point The point object to test against.
 * @param {Function} [callback] Executed in case of collision.
 * @param {Object} [scope] Scope of execution for callback method.
 *
 * @returns {boolean} true if the display object overlaps or intersects with the specified point; false otherwise.
 */
rune.display.InteractiveObject.prototype.hitTestPoint = function(point, callback, scope) {
    if (rune.geom.Rectangle.containsPoint(
        this['hitbox']['x'],
        this['hitbox']['y'],
        this['hitbox']['width'],
        this['hitbox']['height'],
        point['x'] || 0.0,
        point['y'] || 0.0
    )) {
        if (typeof callback === "function") {
            callback.call(scope || this, this, point);
        }
        
        return true;
    }
    
    return false;
};

/**
 * Test whether the object touches another object in one or more directions. 
 * The test does not tell what the object touches, only whether it does so 
 * (true) or not (false).
 *
 * @param {number} direction Bit field with directions to check.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.isTouching = function(direction) {
    return (this.m_touching & direction) > rune.physics.Space.NONE;
};

/**
 * Tests if the object touched other objects during the previous update.
 *
 * @param {number} direction Bit field with directions to check.
 *
 * @returns {boolean}
 */
rune.display.InteractiveObject.prototype.justTouched = function(direction) {
    return ((this.m_touching & direction) >  rune.physics.Space.NONE) && 
           ((this.m_touched  & direction) <= rune.physics.Space.NONE);
};

/**
 * Moves an object to the specified position (x and y coordinates). This method 
 * can be used when an object needs to be moved without physical limitations.
 *
 * @param {number} x X coordinate to move to.
 * @param {number} y Y coordinate to move to.
 *
 * @returns {undefined}
 */
rune.display.InteractiveObject.prototype.moveTo = function(x, y) {
    this.m_x = x;
    this.m_previousX = this.m_x;
    
    this.m_y = y;
    this.m_previousY = this.m_y;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * This method is activated before the object's main update loop and ensures 
 * that the object is ready for the update. The purpose is to protect certain 
 * processes from being disabled when overriding the main update loop. This 
 * method can also be overridden, but it should be done with caution.
 *
 * @param {number} step Fixed time step.
 *
 * @returns {undefined}
 */
rune.display.InteractiveObject.prototype.preUpdate = function(step) {
    this.m_updatePreviousPosition(step);
};

/**
 * Override this method to update your interactive object's position and 
 * appearance.
 *
 * @param {number} step Fixed time step.
 *
 * @returns {undefined}
 */
rune.display.InteractiveObject.prototype.update = function(step) {
    this.m_updateStates(step);
};

/**
 * This method is activated immediately after the object's main update loop is 
 * completed. The method performs certain processes that sum up the current 
 * update, but also has the purpose of protecting these processes from being 
 * deactivated when the update method is overridden.
 *
 * @param {number} step Fixed time step.
 *
 * @returns {undefined}
 */
rune.display.InteractiveObject.prototype.postUpdate = function(step) {
    this.m_updateVelocity(step);
};

/**
 * Process that prepares the object for removal. All internal processes are 
 * stopped and allocated memory will be cleared by the garbage collector at 
 * the next sweep.
 *
 * @returns {undefined}
 */
rune.display.InteractiveObject.prototype.dispose = function() {
    this.m_disposeHitbox();
    this.m_disposeStates();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_construct = function() {
    this.m_constructStates();
    this.m_constructHitbox();
};

/**
 * Creates the object's finite-state machine.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_constructStates = function() {
    this.m_disposeStates();
    if (this.m_states == null) {
        this.m_states = new rune.state.States(this);
    } else throw new Error();
};

/**
 * Creates the object that represents the bounding box of the interactive 
 * object.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_constructHitbox = function() {
    this.m_disposeHitbox();
    if (this.m_hitbox == null) {
        this.m_hitbox = new rune.display.Hitbox(this);
    }
};

/**
 * Saves the position of the object as the previous position. This is a simple 
 * process, but important for the collision to work properly.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_updatePreviousPosition = function(step) {
    this.m_previousX = this.x;
    this.m_previousY = this.y;
};

/**
 * Updates the object's finite-state machine.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_updateStates = function(step) {
    if (this.m_states != null) {
        this.m_states.update(step);
    }
};

/**
 * Updates the velocity of the object.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_updateVelocity = function(step) {
    if (this['movable'] === true && this.m_velocity != null) {
        this.m_velocity.update(step);
        
        //@note: To make velocity equal between different framerates.
        var s = rune.system.Application['instance']['time']['scale'];
        
        this['x'] += this.m_velocity['x'] * s;
        this['y'] += this.m_velocity['y'] * s;
        this['rotation'] += this.m_velocity.angular * s;
    }
    
    this.m_touched   = this.m_touching;
    this.m_touching  = rune.physics.Space.NONE;
};

/**
 * Executes any rendering operations from the current state.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_renderStates = function() {
    if (this.m_states != null) {
        this.m_states.render();
    }
};

/**
 * Removes the object that represents the interactive object's boundary box.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_disposeHitbox = function() {
    if (this.m_hitbox != null) {
        this.m_hitbox.dispose();
        this.m_hitbox = null;
    }
};

/**
 * Destroys the object's finite-state machine.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.InteractiveObject.prototype.m_disposeStates = function() {
    if (this.m_states != null) {
        this.m_states.dispose();
        this.m_states = null;
    }
};