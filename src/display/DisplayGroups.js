//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new DisplayGroups object.
 *
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The DisplayGroups class represents a manager for DisplayGroup objects. 
 * Groups created or added to the manager are updated automatically.
 */
rune.display.DisplayGroups = function() {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * List of the groups that the object handles.
     *
     * @type {Array.<rune.display.DisplayGroup>}
     * @protected
     * @ignore
     */
    this.m_groups = [];
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------
    
    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds an existing group object. Note that groups are only added if they do 
 * not already exist in the list.
 *
 * @param {rune.display.DisplayGroup} group Group to add.
 *
 * @returns {rune.display.DisplayGroup}
 */
rune.display.DisplayGroups.prototype.add = function(group) {
    var index = this.m_groups.indexOf(group);
    if (index === -1) {
        this.m_groups.push(group);
        group.init();
    }

    return group;
};

/**
 * Creates and adds a new group. A group must be linked to a display object 
 * container to which all group members are added. A reference to the newly 
 * created group is returned by the method.
 *
 * @param {rune.display.DisplayObjectContainer} target The group's target object, ie where new group members are added.
 *
 * @returns {rune.display.DisplayGroup}
 */
rune.display.DisplayGroups.prototype.create = function(target) {
    var group = new rune.display.DisplayGroup(target);
    return this.add(group);
};

/**
 * Removes an existing group. By default, groups are not destroyed when they 
 * are removed from the list. Use the dispose argument to enable 
 * auto-destruction when the group is removed. If the group is destroyed, a 
 * null reference is returned, otherwise a reference to the removed group.
 *
 * @param {rune.display.DisplayGroup} group Group to remove.
 * @param {boolean} [dispose=false] Whether the removed group should be destroyed.
 *
 * @returns {rune.display.DisplayGroup}
 */
rune.display.DisplayGroups.prototype.remove = function(group, dispose) {
    var index = this.m_groups.indexOf(group);
    if (index > -1) {
        this.m_groups.splice(index, 1);
        
        if (dispose === true) {
            group.dispose();
            group = null;
            
            return null;
        }
    }

    return group;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Destroy all groups in order to free memory allocated by the object.
 *
 * @returns {undefined}
 * @ignore
 */
rune.display.DisplayGroups.prototype.dispose = function() {
    this.m_disposeGroups();
};

/**
 * Updates all active groups.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.display.DisplayGroups.prototype.update = function(step) {
    this.m_updateGroups(step);
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
rune.display.DisplayGroups.prototype.m_construct = function() {
    this.m_constructGroups();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Create list for groups. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.display.DisplayGroups.prototype.m_constructGroups = function() {
    this.m_disposeGroups();
    if (this.m_groups == null) {
        this.m_groups = [];
    }
};

/**
 * Updates all active groups.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.display.DisplayGroups.prototype.m_updateGroups = function(step) {
    var groups = this.m_groups;
    for (var i = 0; i < groups.length; i++) {
        if (groups[i].active == true) {
            groups[i].preUpdate(step);
            groups[i].update(step);
            groups[i].postUpdate(step);
        }
    }
};

/**
 * Delete all groups.
 *
 * @returns {undefined}
 * @private
 */
rune.display.DisplayGroups.prototype.m_disposeGroups = function() {
    if (this.m_groups != null) {
        while (this.m_groups.length > 0) {
            this.m_groups[0].dispose();
            this.m_groups[0] = null;
            this.m_groups.splice(0, 1);
        }
        
        this.m_groups = null;
    }
};