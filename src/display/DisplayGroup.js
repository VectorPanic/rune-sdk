//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the DisplayGroup class.
 *
 * @constructor
 *
 * @param {rune.display.DisplayObjectContainer} container Display object container object that will contain members.
 *
 * @class
 * @classdesc
 * 
 * The DisplayGroup class represents a collection (usually a subset) of display 
 * objects from one and the same display object container. The group offers 
 * easy access to the collection as you do not have to go through the entire 
 * display object container to find them. The contents of the group are 
 * automatically synchronized with the contents of the display object 
 * container, ie if an object is added to the group, it is also added as a 
 * child object to the container. A group also offers fast and easy collision 
 * handling of display objects that are part of the group, but the group is not 
 * limited to handling internal collisions; it is also possible to hit test 
 * against objects that are not group members.
 */
rune.display.DisplayGroup = function(container) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether the group is active (true) or not (false). Inactive groups are 
     * not automatically updated by the group manager.
     *
     * @type {boolean}
     * @default true
     */
    this.active = true;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Internal cache for the member's calculated area. This is calculated for 
     * each update when the object is active. If the object is inactive, the 
     * area is calculated on request, ie when the getArea() method is called.
     *
     * @type {rune.geom.Rectangle}
     * @protected
     * @ignore
     */
    this.m_area = new rune.geom.Rectangle();
    
    /**
     * The display object container that contains all group members.
     *
     * @type {rune.display.DisplayObjectContainer}
     * @protected
     * @ignore
     */
    this.m_container = container;
    
    /**
     * Register of group members. If an object is a member, it must be present 
     * as a child to the display object container.
     *
     * @type {Array.<rune.display.DisplayObject>}
     * @protected
     * @ignore
     */
    this.m_members = [];
    
    /**
     * Internal quad tree.
     *
     * @type {rune.display.Quadtree}
     * @protected
     * @ignore
     */
    this.m_quadtree = null;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the application's entry point class, ie. the main class of the 
 * application. Useful for accessing the application's subsystem.
 *
 * @member {rune.system.Main} application
 * @memberof rune.display.DisplayGroup
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayGroup.prototype, "application", {
    /**
     * @this rune.display.DisplayGroup
     * @ignore
     */
    get : function() {
        return rune.system.Application['instance'];
    }
});

/**
 * Reference to the current scene's camera system.
 *
 * @member {rune.camera.Cameras} cameras
 * @memberof rune.display.DisplayGroup
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayGroup.prototype, "cameras", {
    /**
     * @this rune.display.DisplayGroup
     * @ignore
     */
    get : function() {
        return this['application']['scenes']['selected']['cameras'];
    }
});

/**
 * Reference to the display object container to which the group is linked. When 
 * new members are added to the group, they are also added to the display 
 * object container's display list.
 *
 * @member {rune.display.DisplayObject} container
 * @memberof rune.display.DisplayGroup
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayGroup.prototype, "container", {
    /**
     * @this rune.display.DisplayGroup
     * @ignore
     */
    get : function() {
        return this.m_container;
    }
});

/**
 * Reference to the subsystem representing the keyboard input.
 *
 * @member {rune.input.Keyboard} keyboard
 * @memberof rune.display.DisplayGroup
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayGroup.prototype, "keyboard", {
    /**
     * @this rune.display.DisplayGroup
     * @ignore
     */
    get : function() {
        return rune.system.Application['instance']['inputs']['keyboard'];
    }
});

/**
 * The number of members included in the group. Note that this number is not 
 * necessarily the same as the number of children in the display object 
 * container to which the group is linked.
 *
 * @member {number} numMembers
 * @memberof rune.display.DisplayGroup
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayGroup.prototype, "numMembers", {
    /**
     * @this rune.display.DisplayGroup
     * @ignore
     */
    get : function() {
        return this.m_members.length;
    }
});

/**
 * Whether the group should use a quad tree to improve hit testing performance. 
 * Note that the quad tree can not guarantee noticeably better performance, but 
 * it should be evaluated when you experience performance problems with the 
 * quad tree disabled.
 *
 * @member {boolean} useQuadtree
 * @memberof rune.display.DisplayGroup
 * @instance
 */
Object.defineProperty(rune.display.DisplayGroup.prototype, "useQuadtree", {
    /**
     * @this rune.display.DisplayGroup
     * @ignore
     */
    get : function() {
        return (this.m_quadtree != null);
    },
    
    /**
     * @this rune.display.DisplayGroup
     * @ignore
     */
    set : function(value) {
        if (this.m_quadtree == null && value == true) {
            this.m_constructQuadtree();
        } else {
            this.m_disposeQuadtree();
        }
    },
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a member to the display group. Note that attempts to add existing 
 * members are denied. The method always returns a boolean that indicates 
 * whether the extension was successful (true) or not (false). When an item is 
 * added to a group, it is automatically removed from any other groups, and it 
 * is also removed from other display lists. This means that an object can only 
 * be a member of one group at a time and that it is always available in the 
 * group's container object view list as long as it is a member of that group.
 *
 * @param {rune.display.DisplayObject} member Prospect to add.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.addMember = function(member) {
    var index = this.m_members.indexOf(member);
    if (index === -1) {
        if (this.m_container.hasChild(member) == false) {
            this.m_container.addChild(member);
        }
        
        this.m_members.push(member);
        member.setGroup(this);
        
        return true;
    }
    
    return false;
};

/**
 * Executes a callback method for each member of the group. Reference to the 
 * current member and its member index are sent to the callback method as 
 * arguments.
 *
 * @param {Function} callback Call function.
 * @param {Object} scope Scope of execution.
 *
 * @returns {undefined}
 */
rune.display.DisplayGroup.prototype.forEachMember = function(callback, scope) {
    for (var i = 0; i < this.m_members.length; i++) {
        callback.call(scope, this.m_members[i], i);
    }
};

/**
 * Calculates the geometric area that the members of the group allocate. 
 * The method returns a rectangle object that encloses all members of the group.
 *
 * @param {rune.geom.Rectangle} [rect] Rectangle to overwrite, if nothing is specified, a new rectangle object is returned.
 *
 * @returns {rune.geom.Rectangle}
 * @private
 */
rune.display.DisplayGroup.prototype.getArea = function(rect) {
    if (this.active == true) {
        if (rect != null) {
            return rune.geom.Rectangle.copy(this.m_area, rect);
        } else {
            return this.m_area;
        }
    } else {
        return this.m_calculateArea(rect);
    }
};

/**
 * Retrieves a member object at a specific index. Note that the member index is 
 * not necessarily the same as the object's child index in the display object 
 * container.
 *
 * @param {number} index The index position of the member object.
 *
 * @throws {RangeError} Throws if the index does not exist in the member list.
 *
 * @returns {rune.display.DisplayObject} The member object at the specified index position.
 */
rune.display.DisplayGroup.prototype.getMemberAt = function(index) {
    if (index > -1 && index < this.m_members.length) {
        return this.m_members[index];
    } else throw new RangeError();
};

/**
 * Retrieves the list of all members. This method is primarily intended for 
 * internal use. Consider it read-only, as changes in the structure can cause 
 * problems for the group.
 *
 * @returns {Array.<rune.display.DisplayObject>}
 */
rune.display.DisplayGroup.prototype.getMembers = function() {
    return this.m_members;
};

/**
 * If the useQuadtree property is set to true, only member objects that are in 
 * close proximity to the argument object are returned; otherwise a list of all 
 * members is returned.
 *
 * @param {rune.display.DisplayObject} obj Main object.
 *
 * @return {Array.<rune.display.DisplayObject>}
 */
rune.display.DisplayGroup.prototype.getMembersCloseTo = function(obj) {
    if (this.m_quadtree != null) {
        var prospects = this.m_quadtree.retrieve(obj);
        var i = prospects.indexOf(obj);
        if (i > -1) {
            prospects.splice(i, 1);
        }
        
        return prospects;
    }
    
    return this.m_members;
};

/**
 * Returns whether an object is a member of the group (true) or not (false.)
 *
 * @param {rune.display.DisplayObject} prospect Main object.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.hasMember = function(prospect) {
    return (this.m_members.indexOf(prospect) > -1) ? true : false;
};

/**
 * Performs hit detection between an object and all members of the group. For 
 * each hit, a callback method is also executed, which attaches the two objects 
 * that collide as arguments to the method.
 *
 * @param {rune.display.DisplayObject|rune.display.DisplayGroup|rune.geom.Point|Array} obj Object to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean} Returns true if any hit was found, otherwise false.
 */
rune.display.DisplayGroup.prototype.hitTest = function(obj, callback, scope) {
    if      (obj instanceof rune.display.DisplayGroup)  return this.hitTestGroup(obj,  callback, scope);
    else if (obj instanceof rune.display.DisplayObject) return this.hitTestObject(obj, callback, scope);
    else if (obj instanceof rune.geom.Point)            return this.hitTestPoint(obj,  callback, scope);
    else if (obj instanceof Array)                      return this.hitTestContentOf(obj,  callback, scope);
    else                                                return false;
};

/**
 * Performs hit detection between an object and all members of the group. If a 
 * hit is detected, the objects are separated according to their physical 
 * properties. For each hit, a callback method is also executed, which attaches 
 * the two objects that collide as arguments to the method.
 *
 * @param {rune.display.DisplayObject|rune.display.DisplayGroup|Array} obj Object to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean} Returns true if any hit was found, otherwise false.
 */
rune.display.DisplayGroup.prototype.hitTestAndSeparate = function(obj, callback, scope) {
    if      (obj instanceof rune.display.DisplayGroup)  return this.hitTestAndSeparateGroup(obj,  callback, scope);
    else if (obj instanceof rune.display.DisplayObject) return this.hitTestAndSeparateObject(obj, callback, scope);
    else if (obj instanceof Array)                      return this.hitTestAndSeparateContentOf(obj, callback, scope);
    else                                                return false;
};

/**
 * Evaluates and handles collisions between group member hitboxes and the 
 * hitboxes of objects in an array.
 *
 * @param {Array} array The array to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.hitTestAndSeparateContentOf = function(array, callback, scope) {
    var collide = false;
    this.forEachMember(function(member) {
        for (var i = 0; i < array.length; i++) {
            if (member.hitTestAndSeparate(array[i], callback, scope)) {
                collide = true;
            }
        }
    }, this);
    
    return collide;
};

/**
 * Performs hit detection between members of this and another group. If a hit 
 * is detected, the objects are separated based on their physical properties. 
 * For each hit, a callback method is also executed, which attaches the two 
 * objects that collide as arguments to the method.
 *
 * @param {rune.display.DisplayGroup} group Group to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean} True if there was a collision, otherwise false.
 */
rune.display.DisplayGroup.prototype.hitTestAndSeparateGroup = function(group, callback, scope) {
    var a = this.getMembers();
    var b = null;
    var c = false;
    
    for (var x = 0; x < a.length; x++) {
        b = group.getMembersCloseTo(a[x]);
        for (var y = 0; y < b.length; y++) {
            if (a[x] != b[y]) {
                if (a[x].hitTestAndSeparateObject(b[y], callback, scope)) {
                    c = true;
                }
            }
        }
    }
    
    return c;
};

/**
 * Performs hit detection between members of this group and another display 
 * object. If a hit is detected, the objects are separated based on their 
 * physical properties. For each hit, a callback method is also executed, which 
 * attaches the two objects that collide as arguments to the method.
 *
 * @param {rune.display.DisplayObject} obj Object to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.hitTestAndSeparateObject = function(obj, callback, scope) {
    var members = this.getMembersCloseTo(obj);
    var collide = false;
    
    for (var i = 0; i < members.length; i++) {
        if (members[i].hitTestAndSeparateObject(obj, callback, scope)) {
            collide = true;
        }
    }
    
    return collide;
};

/**
 * Evaluates collision between the hitboxes of group members and the hitboxes 
 * of objects in an array.
 *
 * @param {Array} array The array to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.hitTestContentOf = function(array, callback, scope) {
    var collide = false;
    this.forEachMember(function(member) {
        for (var i = 0; i < array.length; i++) {
            if (member.hitTest(array[i], callback, scope)) {
                collide = true;
            }
        }
    }, this);
    
    return collide;
};

/**
 * Hit detect all members of the group against the members of (the same or) 
 * another group.
 *
 * @param {rune.display.DisplayGroup} group The group to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.hitTestGroup = function(group, callback, scope) {
    var a = this.getMembers();
    var b = null;
    var c = false;
    
    for (var x = 0; x < a.length; x++) {
        b = group.getMembersCloseTo(a[x]);
        for (var y = 0; y < b.length; y++) {
            if (a[x] != b[y]) {
                if (a[x].hitTestObject(b[y], callback, scope)) {
                    c = true;
                }
            }
        }
    }
    
    return c;
};

/**
 * Hit detect all members of the group against another display object.
 *
 * @param {rune.display.DisplayObject} obj The display object to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.hitTestObject = function(obj, callback, scope) {
    var members = this.getMembersCloseTo(obj);
    var collide = false;
    
    for (var i = 0; i < members.length; i++) {
        if (members[i].hitTestObject(obj, callback, scope)) {
            collide = true;
        }
    }
    
    return collide;
};

/**
 * Hit Detect all members of the group against a point. The method returns true 
 * if the point overlaps one of the group members, otherwise false is returned.
 *
 * @param {rune.geom.Point} point Point to test against.
 * @param {Function} [callback] Method that is called when a collision is detected.
 * @param {Object} [scope] Scope of execution of the callback method.
 *
 * @returns {boolean}
 */
rune.display.DisplayGroup.prototype.hitTestPoint = function(point, callback, scope) {
    var collide = false;
    var area = this.getArea();
    
    if (area && area.containsPoint(point)) {
        var members = this.getMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].hitTestPoint(point, callback, scope)) {
                collide = true;
            }
        }
    }
    
    return collide;
};

/**
 * Removes a member from the group. Note that the member will also be removed 
 * from the display object's display list. It is not possible to be a member 
 * of the group without being available in the container object's display list.
 *
 * @param {rune.display.DisplayObject} member Member to be removed.
 * @param {boolean} dispose Whether the member should be destroyed when it is removed.
 *
 * @returns {rune.display.DisplayObject}
 */
rune.display.DisplayGroup.prototype.removeMember = function(member, dispose) {
    var index = this.m_members.indexOf(member);
    if (index > -1) {
        
        this.m_members.splice(index, 1);
        
        if (member['parent'] == this.m_container) {
            this.m_container.removeChild(member, false);
        }
        
        if (dispose == true) {
            member.dispose();
            member = null;
        }
    }
    
    return (dispose) ? null : member;
};

/**
 * Removes all members from the group.
 *
 * @param {boolean} dispose Whether the members should be destroyed when they are removed.
 *
 * @returns {undefined}
 */
rune.display.DisplayGroup.prototype.removeMembers = function(dispose) {
    while (this.m_members.length > 0) {
        this.removeMember(this.getMemberAt(0), dispose);
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * This method is automatically called once by the group manager when the group 
 * is created, or added. The method is public but should be considered 
 * internal. External calls should only be made if 1. The group is disabled, or 
 * 2. If the group is not added to a manager.
 *
 * @returns {undefined}
 */
rune.display.DisplayGroup.prototype.init = function() {
    //@note: Override from sub class.
};

/**
 * This method is called just before the group's update method and performs 
 * processes that must be completed before the group's main update process 
 * begins. Avoid overriding and modifying this method.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
rune.display.DisplayGroup.prototype.preUpdate = function(step) {
    this.m_updateArea(step);
    this.m_updateQuadtree(step);
};

/**
 * This method represents the group's main update process. The method can be 
 * overridden in order to add custom logic.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
rune.display.DisplayGroup.prototype.update = function(step) {
    //@note: Override from sub class.
};

/**
 * This method is called automatically after the group's main update method is 
 * completed. The method can be overridden and used to complete closing 
 * processes just before the next update.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
rune.display.DisplayGroup.prototype.postUpdate = function(step) {
    //@note: Override from sub class.
};

/**
 * This method is called automatically just before the group is destroyed. 
 * Override the method for creating your own deallocation code, ie code that 
 * deletes objects created by the group.
 *
 * @returns {undefined}
 */
rune.display.DisplayGroup.prototype.dispose = function() {
    this.removeMembers(true);
    this.m_disposeQuadtree();
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Adds a new member to the group without adding it to the group container 
 * display list. Note that this method is internal and should therefore only 
 * be used by classes and objects within the display package.
 *
 * @param {rune.display.DisplayObject} member Display objects to add.
 *
 * @returns {boolean}
 * @package
 * @ignore
 */
rune.display.DisplayGroup.prototype.include = function(member) {
    var index = this.m_members.indexOf(member);
    if (index === -1) {
        this.m_members.push(member);
        member.setGroup(this);
        
        return true;
    }
    
    return false;
};

/**
 * Deletes a member from the group without removing it from the display list of 
 * the group's container object. Note that this method is internal and should 
 * therefore only be used by classes and objects within the display package.
 *
 * @param {rune.display.DisplayObject} member Display objects to remove.
 *
 * @returns {boolean}
 * @package
 * @ignore
 */
rune.display.DisplayGroup.prototype.exclude = function(member) {
    var index = this.m_members.indexOf(member);
    if (index > -1) {
        this.m_members.splice(index, 1);
        member.setGroup(null);
        
        return true;
    }
    
    return false;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the group's internal quad tree.
 *
 * @throws {Error} If the object already exists.
 *
 * @returns {undefined}
 * @private
 */
rune.display.DisplayGroup.prototype.m_constructQuadtree = function() {
    this.m_disposeQuadtree();
    if (this.m_quadtree == null) {
        this.m_quadtree = new rune.display.Quadtree();
    } else throw new Error();
};

/**
 * Updates the group's internal quad tree.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.display.DisplayGroup.prototype.m_updateQuadtree = function(step) {
    if (this.active == true && this.m_quadtree != null) {
        var rect = this.getArea();
        
        this.m_quadtree.clear();
        
        this.m_quadtree.x = rect.x;
        this.m_quadtree.y = rect.y;
        this.m_quadtree.width  = rect.width;
        this.m_quadtree.height = rect.height;
                
        var m = this.m_members;
        var i = m.length;
        
        while (i--) {
            this.m_quadtree.insert(m[i]);
        }  
    } 
};

/**
 * Updates the member area.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.display.DisplayGroup.prototype.m_updateArea = function(step) {
    if (this.active == true) {
        this.m_area = this.m_calculateArea(this.m_area);  
    }
};

/**
 * Destroy the internal quad tree.
 *
 * @returns {undefined}
 * @private
 */
rune.display.DisplayGroup.prototype.m_disposeQuadtree = function() {
    if (this.m_quadtree instanceof rune.display.Quadtree) {
        this.m_quadtree.clear();
        this.m_quadtree = null;
    }
};

/**
 * Calculates the member area, ie the rectangular area within all group members can fit.
 *
 * @param {rune.geom.Rectangle} [rect] Rectangle to overwrite, if nothing is specified, a new rectangle object is returned.
 *
 * @returns {rune.geom.Rectangle}
 * @private
 */
rune.display.DisplayGroup.prototype.m_calculateArea = function(rect) {
    //@todo Does not work correctly within negative coordinates
    rect = rect || new rune.geom.Rectangle();
    
    var min = new rune.geom.Point(Number.MAX_VALUE, Number.MAX_VALUE);
    var max = new rune.geom.Point(Number.MIN_VALUE, Number.MIN_VALUE);
    
    var i = this.m_members.length;
    if (i > 0) {
        while (i--) {
            min['x'] = Math.min(min['x'], this.m_members[i]['left']);
            min['y'] = Math.min(min['y'], this.m_members[i]['top']);
            max['x'] = Math.max(max['x'], this.m_members[i]['right']);
            max['y'] = Math.max(max['y'], this.m_members[i]['bottom']);
        }
    } else {
        min['x'] = 0;
        min['y'] = 0;
        max['x'] = 0;
        max['y'] = 0;
    }
    
    rect['x'] = min['x'];
    rect['y'] = min['y'];
    rect['width']  = Math.abs(max['x'] - min['x']);
    rect['height'] = Math.abs(max['y'] - min['y']);
    
    return rect;
};