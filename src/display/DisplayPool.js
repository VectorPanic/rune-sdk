//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a display group that reuses its members.
 *
 * @constructor
 * @extends rune.display.DisplayGroup
 *
 * @param {rune.display.DisplayObjectContainer} container Container for all members.
 * @param {Function} factory Creates a new DisplayObject, with this pool as its scope.
 *
 * @throws {TypeError} If the factory is not a function.
 *
 * @class
 * @classdesc
 *
 * The DisplayPool class extends DisplayGroup with reusable members. acquire()
 * activates an available member or creates one through the factory. release()
 * hides and deactivates a member without removing it from the container.
 * Members added through addMember() or include() are considered in use until
 * released. Member lists contain both available and acquired objects; callers
 * must filter inactive members when performing collision tests.
 * The caller resets object-specific state before using an acquired member.
 */
rune.display.DisplayPool = function(container, factory) {
    if (typeof factory !== "function") throw new TypeError("A member factory is required.");

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Factory used when no members are available for reuse.
     *
     * @type {Function}
     * @private
     */
    this.m_factory = factory;

    /**
     * Released members available for reuse.
     *
     * @type {Array.<rune.display.DisplayObject>}
     * @private
     */
    this.m_available = [];

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Initializes the base DisplayGroup class.
     */
    rune.display.DisplayGroup.call(this, container);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.DisplayPool.prototype = Object.create(rune.display.DisplayGroup.prototype);
rune.display.DisplayPool.prototype.constructor = rune.display.DisplayPool;

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The number of released members available for reuse.
 *
 * @member {number} numAvailable
 * @memberof rune.display.DisplayPool
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.DisplayPool.prototype, "numAvailable", {
    /**
     * @this rune.display.DisplayPool
     * @ignore
     */
    get : function() {
        return this.m_available != null ? this.m_available.length : 0;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Obtains a member and makes it active and visible. If none is available, the
 * factory creates a DisplayObject that is added to the group and container.
 * The factory must return an object that does not already belong to a group.
 * Velocity, position and other object-specific state are not reset.
 *
 * @throws {Error} If the pool is disposed or has no container.
 * @throws {TypeError} If the factory does not return an ungrouped DisplayObject.
 *
 * @returns {rune.display.DisplayObject} The acquired member.
 */
rune.display.DisplayPool.prototype.acquire = function() {
    if (this.m_available == null || this.m_container == null) {
        throw new Error("DisplayPool is disposed or has no container.");
    }

    var member = this.m_available.pop();
    if (member == null) {
        member = this.m_factory.call(this);
        if (!(member instanceof rune.display.DisplayObject) || member['group'] != null) {
            throw new TypeError("The factory must return an ungrouped DisplayObject.");
        }
        this.addMember(member);
    }
    member['active'] = true;
    member['visible'] = true;
    return member;
};

/**
 * Hides and deactivates a member while keeping it in the group and container.
 * Duplicate releases, nonmembers and calls after disposal are ignored.
 * Object-specific state and the movable property are left unchanged.
 *
 * @param {rune.display.DisplayObject} member Member to make available for reuse.
 *
 * @returns {boolean} Whether the member was released.
 */
rune.display.DisplayPool.prototype.release = function(member) {
    if (this.m_available == null || !this.hasMember(member) ||
        this.m_available.indexOf(member) !== -1) {
        return false;
    }
    member['active'] = false;
    member['visible'] = false;
    this.m_available.push(member);
    return true;
};

//------------------------------------------------------------------------------
// Override public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Removes a member from the pool and container, including its availability.
 *
 * @override
 *
 * @param {rune.display.DisplayObject} member Member to remove.
 * @param {boolean} dispose Whether to destroy the removed member.
 *
 * @returns {rune.display.DisplayObject} The removed member, or null when disposed.
 */
rune.display.DisplayPool.prototype.removeMember = function(member, dispose) {
    this.m_removeAvailable(member);
    return rune.display.DisplayGroup.prototype.removeMember.call(this, member, dispose);
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Disposes all members, both acquired and available, and clears pool references.
 *
 * @override
 *
 * @returns {undefined}
 */
rune.display.DisplayPool.prototype.dispose = function() {
    rune.display.DisplayGroup.prototype.dispose.call(this);
    this.m_available = null;
    this.m_factory = null;
};

//------------------------------------------------------------------------------
// Override internal prototype methods
//------------------------------------------------------------------------------

/**
 * Removes membership and availability when a member leaves its container.
 *
 * @override
 *
 * @param {rune.display.DisplayObject} member Member to exclude.
 *
 * @returns {boolean} Whether the member was excluded.
 * @package
 * @ignore
 */
rune.display.DisplayPool.prototype.exclude = function(member) {
    this.m_removeAvailable(member);
    return rune.display.DisplayGroup.prototype.exclude.call(this, member);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Removes a member from the register of available objects.
 *
 * @param {rune.display.DisplayObject} member Member to remove from the register.
 *
 * @returns {undefined}
 * @private
 */
rune.display.DisplayPool.prototype.m_removeAvailable = function(member) {
    if (this.m_available != null) {
        var index = this.m_available.indexOf(member);
        if (index !== -1) this.m_available.splice(index, 1);
    }
};
