//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of CameraTargets.
 *
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * The CameraTargets class represents a subsystem that allows cameras to track 
 * one or more display objects.
 */
rune.camera.CameraTargets = function() {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * The position described as the target position of the camera.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_position = new rune.geom.Point();

    /**
     * List of DisplayObjects to follow. When there is more than one object, 
     * their common center point is calculated as the destination.
     *
     * @type {Array.<rune.display.DisplayObject>}
     * @private
     */
    this.m_targets = [];
};

//--------------------------------------------------------------------------
// Public prototype getter and setter methods
//--------------------------------------------------------------------------

/**
 * Number of display objects to follow.
 *
 * @member {number} length
 * @memberof rune.camera.CameraTargets
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.CameraTargets.prototype, "length", {
    /**
     * @this rune.camera.CameraTargets
     * @ignore
     */
    get : function() {
        return this.m_targets.length;
    }
});

/**
 * Destination point, ie. the position to which the camera should move.
 *
 * @member {number} position
 * @memberof rune.camera.CameraTargets
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.CameraTargets.prototype, "position", {
    /**
     * @this rune.camera.CameraTargets
     * @ignore
     */
    get : function() {
        this.m_position.x = 0;
        this.m_position.y = 0;
        for (var i = 0, l = this.m_targets.length; i < l; i++) {
            this.m_position.x += this.m_targets[i]['center'].x;
            this.m_position.y += this.m_targets[i]['center'].y;
        }
        
        this.m_position.x = Math.floor(this.m_position.x / this.m_targets.length);
        this.m_position.y = Math.floor(this.m_position.y / this.m_targets.length);
        
        return this.m_position;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Add a target to follow.
 * 
 * @param {rune.display.DisplayObject} target Target to follow.
 *
 * @return {undefined}
 */
rune.camera.CameraTargets.prototype.add = function(target) {
    var index = this.m_targets.indexOf(target);
    if (index === -1) this.m_targets.push(target);
};

/**
 * Clears all registered targets.
 * 
 * @return {undefined}
 */
rune.camera.CameraTargets.prototype.clear = function() {
    while (this.m_targets.length > 0) {
        this.m_targets.shift();
    }
};

/**
 * Removes a registered target.
 * 
 * @param {rune.display.DisplayObject} target Target to remove.
 *
 * @return {undefined}
 */
rune.camera.CameraTargets.prototype.remove = function(target) {
    var index = this.m_targets.indexOf(target);
    if (index > -1) this.m_targets.splice(index, 1);
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Removes the subsystem from memory. Note that instances can no longer be 
 * used after this method is called.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraTargets.prototype.dispose = function() {
    this.m_position = null;
    this.m_targets.length = 0;
    this.m_targets = null;
};