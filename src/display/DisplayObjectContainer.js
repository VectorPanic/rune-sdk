//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new DisplayObjectContainer.
 *
 * @constructor
 * @extends rune.display.Artboard
 *
 * @param {number} [x=0.0] The x coordinate of the top-left corner of the rectangle.
 * @param {number} [y=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [width=0.0] The y coordinate of the top-left corner of the rectangle.
 * @param {number} [height=0.0] The height of the rectangle, in pixels.
 *
 * @class
 * @classdesc
 * 
 * The DisplayObjectContainer class is the base class for all objects that can 
 * serve as display object containers on the display list. The display list 
 * manages all objects displayed in the Rune runtimes. Use the 
 * DisplayObjectContainer class to arrange the display objects in the display 
 * list. Each DisplayObjectContainer object has its own child list for 
 * organizing the z-order of the objects. The z-order is the front-to-back 
 * order that determines which object is drawn in front, which is behind, 
 * and so on.
 */
rune.display.DisplayObjectContainer = function(x, y, width, height) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Refers to a function object that forms the basis for sorting child 
     * objects. When set, all children are sorted for each tick (update). Note 
     * that automatic sorting can be problematic when you want to preserve a 
     * specific display list structure.
     *
     * @type {Function}
     * @default null
     */
    this.sort = null;
    
    /**
     * Scale for how time is calculated within the DisplayObjectContainer 
     * object.
     *
     * @type {number}
     * @default 1.0
     */
    this.timeScale = 1.0;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * List of current children.
     *
     * @type {Array.<rune.display.DisplayObject>}
     * @protected
     * @ignore
     */
    this.m_children = [];
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.display.Artboard.
     */
    rune.display.Artboard.call(this, x, y, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.DisplayObjectContainer.prototype = Object.create(rune.display.Artboard.prototype);
rune.display.DisplayObjectContainer.prototype.constructor = rune.display.DisplayObjectContainer;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Returns the number of children of this object.
 *
 * @member {number} numChildren
 * @memberof rune.display.DisplayObjectContainer
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayObjectContainer.prototype, "numChildren", {
    /**
     * @this rune.display.DisplayObjectContainer
     * @ignore
     */
    get : function() {
        return this.m_children.length;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a child DisplayObject instance to this DisplayObjectContainer instance. 
 * The child is added to the front (top) of all other children in this 
 * DisplayObjectContainer instance. To add a child to a specific index 
 * position, use the addChildAt() method.
 *
 * @param {rune.display.DisplayObject} child The DisplayObject instance to add as a child of this DisplayObjectContainer instance.
 *
 * @throws {Error} Throws if the child is the same as the parent.
 * @throws {TypeError} Throws if the child is not of type DisplayObject.
 *
 * @returns {rune.display.DisplayObject} The DisplayObject instance that you pass in the child parameter.
 */
rune.display.DisplayObjectContainer.prototype.addChild = function(child) {
    if (child instanceof rune.display.DisplayObject) {
        if (child != this) {
            if (child['parent'] != null) {
                var group = child['group'];
                child['parent'].removeChild(child, false);
                
                if (group != null && group['container'] == this) {
                    group.include(child);
                }
            }
            
            this.addChildAt(child, this['numChildren']);
        } else throw new Error();
    } else throw new TypeError();
    
    return child;
};

/**
 * Adds a child DisplayObject instance to this DisplayObjectContainer instance. 
 * The child is added at the index position specified. An index of 0 represents 
 * the back (bottom) of the display list for this DisplayObjectContainer object.
 *
 * @param {rune.display.DisplayObject} child The DisplayObject instance to add as a child of this DisplayObjectContainer instance.
 * @param {number} index The index position to which the child is added. If you specify a currently occupied index position, the child object that exists at that position and all higher positions are moved up one position in the child list.
 *
 * @throws {Error} Throws if the child is the same as the parent.
 * @throws {RangeError} Throws if the index position does not exist in the child list.
 * @throws {TypeError} Throws if the child is not of type DisplayObject.
 *
 * @returns {rune.display.DisplayObject} The DisplayObject instance that you pass in the child parameter.
 */
rune.display.DisplayObjectContainer.prototype.addChildAt = function(child, index) {
    if (child instanceof rune.display.DisplayObject) {
        var group = child['group'];
        if (child['parent'] != null) {
            child['parent'].removeChild(child, false);
        }
        
        if (index > -1 && index <= this.m_children.length) {
            if (child != this) {
                this.m_children.splice(index, 0, child);
                
                if (group != null && group['container'] == this) {
                    group.include(child);
                }
                
                child.setParent(this);
                child.init();
                
                this.breakCache();
            } else throw new Error();
        } else throw new RangeError();
    } else throw new TypeError();
    
    return child;
};

/**
 * Calls a function for each child in the display object container.
 *
 * @param {Function} callback Call function.
 * @param {Object} scope Scope of execution.
 *
 * @returns {undefined}
 */
rune.display.DisplayObjectContainer.prototype.forEachChild = function(callback, scope) {
    for (var i = 0; i < this.m_children.length; i++) {
        callback.call(scope, this.m_children[i], i);
    }
};

/**
 * Returns the child display object instance that exists at the specified index.
 *
 * @param {number} index The index position of the child object.
 *
 * @throws {RangeError} Throws if the index does not exist in the child list.
 *
 * @returns {rune.display.DisplayObject} The child display object at the specified index position.
 */
rune.display.DisplayObjectContainer.prototype.getChildAt = function(index) {
    if (index > -1 && index < this.m_children.length) {
        return this.m_children[index];
    } else throw new RangeError();
};

/**
 * Returns the index position of a child DisplayObject instance.
 *
 * @param {rune.display.DisplayObject} child The DisplayObject instance to identify.
 *
 * @returns {number} The index position of the child display object to identify.
 */
rune.display.DisplayObjectContainer.prototype.getChildIndex = function(child) {
    return this.m_children.indexOf(child);
};

/**
 * Returns a list of all child objects. Note that this method is primarily 
 * intended for internal use.
 *
 * @returns {Array.<rune.display.DisplayObject>}
 */
rune.display.DisplayObjectContainer.prototype.getChildren = function() {
    return this.m_children;
};

/**
 * Checks whether a display object is a child of the DisplayObjectContainer 
 * instance.
 *
 * @param {rune.display.DisplayObject} child Child objects to check.
 *
 * @return {boolean}
 */
rune.display.DisplayObjectContainer.prototype.hasChild = function(child) {
    return (child) ? (this === child['parent']) : false;
};

/**
 * Removes the specified child DisplayObject instance from the child list of 
 * the DisplayObjectContainer instance. The parent property of the removed 
 * child is set to null , and the object is garbage collected if no other 
 * references to the child exist. The index positions of any display objects 
 * above the child in the DisplayObjectContainer are decreased by 1.
 *
 * @param {rune.display.DisplayObject} child The DisplayObject instance to remove.
 * @param {boolean} [dispose=false] If the child object is to be destroyed when it is removed.
 *
 * @returns {rune.display.DisplayObject}
 */
rune.display.DisplayObjectContainer.prototype.removeChild = function(child, dispose) {
    var i = this.m_children.indexOf(child);
    if (i != -1) {
        
        child.fini();
        child.setParent(null);
        
        if (child['group'] != null) {
            child['group'].exclude(child);
        }
        
        this.m_children.splice(i, 1);
        
        if (dispose == true) {
            child.dispose();
            child = null;
        }
        
        this.breakCache();
    }
    
    return (dispose) ? null : child;
};

/**
 * Removes a child DisplayObject from the specified index position in the child 
 * list of the DisplayObjectContainer.
 *
 * @param {number} index The child index of the DisplayObject to remove.
 * @param {boolean} [dispose=false] If the child object is to be destroyed when it is removed.
 *
 * @returns {rune.display.DisplayObject}
 */
rune.display.DisplayObjectContainer.prototype.removeChildAt = function(index, dispose) {
    var child = this.getChildAt(index);
    if (child) {
        child = this.removeChild(child, dispose);
    }
    
    return child;
};

/**
 * Removes all child DisplayObject instances from the child list of the 
 * DisplayObjectContainer instance. The parent property of the removed 
 * children is set to null.
 *
 * @param {boolean} [dispose=false] Whether the children's dispose process should be activated when they are removed.
 *
 * @returns {undefined}
 */
rune.display.DisplayObjectContainer.prototype.removeChildren = function(dispose) {
    while (this.m_children.length > 0) {
        this.removeChild(this.getChildAt(0), dispose);
    }
};

/**
 * Changes the position of an existing child in the display object container. 
 * This affects the layering of child objects.
 *
 * @param {rune.display.DisplayObject} child The child DisplayObject instance for which you want to change the index number.
 * @param {number} index The resulting index number for the child display object.
 *
 * @throws {RangeError} Throws if the index does not exist in the child list.
 * @throws {Error} Throws if the child parameter is not a child of this object.
 *
 * @returns {boolean}
 */
rune.display.DisplayObjectContainer.prototype.setChildIndex = function(child, index) {
    var sibling = this.getChildAt(index);
    if (this.getChildIndex(child) > -1) {
        return this.swapChildren(child, sibling);
    } else throw new Error();
};

/**
 * Sorts the instance's child objects based on the specified function. Any 
 * kind of sorting breaks the instance's pixel buffer cache.
 *
 * @param {Function} func Sort function
 *
 * @throws {TypeError} if the specified argument is not of type Function.
 *
 * @returns {undefined}
 */
rune.display.DisplayObjectContainer.prototype.sortChildren = function(func) {
    if (typeof func === "function") {
        this.m_children.sort(func);
        this.breakCache();
    } else throw new TypeError();
};

/**
 * Swaps the z-order (front-to-back order) of the two specified child objects. 
 * All other child objects in the display object container remain in the same 
 * index positions.
 *
 * @param {rune.display.DisplayObject} a The first child object.
 * @param {rune.display.DisplayObject} b The second child object.
 *
 * @returns {boolean}
 */
rune.display.DisplayObjectContainer.prototype.swapChildren = function(a, b) {
    var ai = this.getChildIndex(a);
    var bi = this.getChildIndex(b);

    if ((ai !== -1) && (bi !== -1)) {
        var tz = a.z;
        
        a.z = b.z;
        b.z = tz;
        
        this.m_children[ai] = b;
        this.m_children[bi] = a;
        
        this.breakCache();
        
        return true;
    }

    return false;
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.DisplayObjectContainer.prototype.update = function(step) {
    rune.display.Artboard.prototype.update.call(this, step);
    this.m_updateChildren(step);
};

/**
 * @inheritDoc
 */
rune.display.DisplayObjectContainer.prototype.render = function() {
    if (this.m_cached == false) {
        this.m_renderBackgroundColor();
        this.m_renderChildren();
        this.m_renderGraphics();
        this.m_renderStates();
        
        this.restoreCache();
    }
};

/**
 * @inheritDoc
 */
rune.display.DisplayObjectContainer.prototype.dispose = function() {
    this.m_disposeChildren();
    rune.display.Artboard.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Protected prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates the internal logic for all child objects.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObjectContainer.prototype.m_updateChildren = function(step) {
    var c = this.m_children;
    var i = c.length;
    
    if (this.sort != null) {
        this.sortChildren(this.sort);
    }
    
    while (i--) {
        this.m_updateChild(c[i], step);
    }
};

/**
 * Updates the internal logic for a specific child object.
 *
 * @param {rune.display.DisplayObject} child The child object to update.
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.display.DisplayObjectContainer.prototype.m_updateChild = function(child, step) {
    if (child != null) {
        if (child["active"] == true) {
            var s = step * this.timeScale;
            child.preUpdate(s);
            child.update(s);
            child.postUpdate(s);
        }
    }
};

/**
 * Draws all the child objects in the DisplayObjectContainer instance.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObjectContainer.prototype.m_renderChildren = function() {
    var children = this.m_children;
    for (var i = 0, l = children.length; i < l; i++) {
        this.m_renderChild(children[i]);
    } 
};

/**
 * Draws a specific child object.
 *
 * @param {rune.display.DisplayObject} child The child object to draw.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObjectContainer.prototype.m_renderChild = function(child) {
    if (child['visible'] == true) {
        this.m_canvas.renderDisplayObject(child);   
    }
    
    this.m_renderChildDebug(child);
};

/**
 * Draws a specific child object.
 *
 * @param {rune.display.DisplayObject} child The child object to draw.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObjectContainer.prototype.m_renderChildDebug = function(child) {
    if (child['debug'] == true) {
        this.m_canvas.drawRect(
            child['x'],
            child['y'],
            child['width'],
            child['height'],
            child.debugColor,
            1
        );   
    }
    
    if (child['hitbox'].debug == true) {
        this.m_canvas.drawRect(
            child['hitbox']['x'],
            child['hitbox']['y'],
            child['hitbox']['width'],
            child['hitbox']['height'],
            child['hitbox'].debugColor,
            1
        );   
    }
};

/**
 * Removes all child objects.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayObjectContainer.prototype.m_disposeChildren = function() {
    this.removeChildren(true);
    this.m_children = null;
};