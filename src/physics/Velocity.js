//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Velocity object.
 * 
 * @constructor
 * @extends rune.geom.Vector2D
 *
 * @param {number} x Velocity in x direction.
 * @param {number} y Velocity in y direction.
 *
 * @class
 * @classdesc
 * 
 * The Velocity class represents motion in two dimensions (x and y).
 */
rune.physics.Velocity = function(x, y) {

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.geom.Vector2D.
     */
    rune.geom.Vector2D.call(this, x, y);

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Acceleration acts as gravity; it is a constant force that can affect the 
     * object in the x and / or y direction. If acceleration is set, the object 
     * is moved by the force of acceleration for each update.
     *
     * @type {rune.geom.Vector2D}
     * @default new rune.geom.Vector2D(0, 0)
     */
    this.acceleration = new rune.geom.Vector2D(0, 0);

    /**
     * The object's rotation speed, stated in degrees per tick / frame.
     *
     * @type {number}
     * @default 0.0
     */
    this.angular = 0.0;

    /**
     * Constant force that affects the object's rotation, this property 
     * basically acts as gravity for rotation. If the property is set, the 
     * object is forced to rotate.
     *
     * @type {number}
     * @default 0.0
     */
    this.angularAcceleration = 0.0;

    /**
     * Force that counteracts the rotational velocity when the rotation lacks 
     * acceleration, ie force that slows down the rotation.
     *
     * @type {number}
     * @default 0.0
     */
    this.angularDrag = 0.0;

    /**
     * Limits rotation to a maximum speed.
     *
     * @type {number}
     * @default 100
     */
    this.angularMax = 100;

    /**
     * Power that counteracts the velocity of the object. This force is applied 
     * only when the object is not accelerating. If set, the object loses its 
     * velocity over time.
     *
     * @type {rune.geom.Vector2D}
     * @default new rune.geom.Vector2D(0, 0)
     */
    this.drag = new rune.geom.Vector2D(0, 0);

    /**
     * Limits the velocity of the object in the x and y direction to a maximum 
     * value.
     *
     * @type {rune.geom.Vector2D}
     * @default new rune.geom.Vector2D(100, 100)
     */
    this.max = new rune.geom.Vector2D(100, 100);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.physics.Velocity.prototype = Object.create(rune.geom.Vector2D.prototype);
rune.physics.Velocity.prototype.constructor = rune.physics.Velocity;

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates the velocity in x, y and rotation.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.physics.Velocity.prototype.update = function(step) {
    this.m_updateMotion(step);
    this.m_updateAngularMotion(step);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the velocity in the x and y direction.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.physics.Velocity.prototype.m_updateMotion = function(step) {
    this.x = this.m_calcVelocity(this.x, this.acceleration.x, this.drag.x, this.max.x);
    this.y = this.m_calcVelocity(this.y, this.acceleration.y, this.drag.y, this.max.y);
};

/**
 * Updates the velocity for rotation.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.physics.Velocity.prototype.m_updateAngularMotion = function(step) {
    this.angular = this.m_calcVelocity(this.angular, this.angularAcceleration, this.angularDrag, this.angularMax);
};

/**
 * Calculates new velocity.
 *
 * @param {number} velocity Previous velocity.
 * @param {number} [acceleration=0] Acceleration speed.
 * @param {number} [drag=0] Deceleration amount.
 * @param {number} [max=10000] Maximum speed.
 *
 * @returns {number}
 * @private
 */
rune.physics.Velocity.prototype.m_calcVelocity = function(velocity, acceleration, drag, max) {
    var scale = rune.system.Application['instance']['time']['scale'];
    acceleration = acceleration * scale || 0;
    drag = drag * scale || 0;
    max = max || 10000;
    
    if (acceleration != 0) {
        velocity += acceleration;
    } else if (drag != 0) {
        if (velocity - drag > 0) {
            velocity = velocity - drag;
        } else if (velocity + drag < 0) {
            velocity += drag;
        } else {
            velocity = 0.0;
        }
    }
    
    return rune.util.Math.clamp(velocity, -max, max);
};