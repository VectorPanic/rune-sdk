//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Space class.
 * 
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Space class contains static methods for collision handling of display 
 * objects. The logic behind the class consists of a modified version of the 
 * collision logic used by Adam Saltsman's Flixel engine. Collision is limited 
 * to the object's hitbox and therefore ignores the size of the object's 
 * graphic representation. Note that all class content is static, so the class 
 * never needs to be instantiated.
 */
rune.physics.Space = function() {
    console.warn("This class is not meant to be instantiated.");
};

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Bit field indicating the orthogonal direction down.
 *
 * @const {number}
 * @default 0x1000
 */
rune.physics.Space.DOWN = 0x1000;

/**
 * Bit field indicating the orthogonal direction left.
 *
 * @const {number}
 * @default 0x0001
 */
rune.physics.Space.LEFT = 0x0001;

/**
 * Indicates no direction.
 *
 * @const {number}
 * @default 0x0000
 */
rune.physics.Space.NONE = 0x0000;

/**
 * Bit field indicating the orthogonal direction right.
 *
 * @const {number}
 * @default 0x0010
 */
rune.physics.Space.RIGHT = 0x0010;

/**
 * Bit field indicating the orthogonal direction up.
 *
 * @const {number}
 * @default 0x0100
 */
rune.physics.Space.UP = 0x0100;

/**
 * Bit field indicating any, or all orthogonal directions.
 *
 * @const {number}
 * @default 0x1111
 */
rune.physics.Space.ANY = rune.physics.Space.LEFT | rune.physics.Space.RIGHT | rune.physics.Space.UP | rune.physics.Space.DOWN;

//------------------------------------------------------------------------------
// Private static constants
//------------------------------------------------------------------------------

/**
 * Used to resolve collisions between two objects.
 *
 * @const {number}
 * @private
 */
rune.physics.Space.OVERLAP_BIAS = 2;

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Resolves collision between two objects based on their physical properties.
 * The objects are separated in both x and y directions.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 *
 * @returns {boolean} If the objects were separated.
 */
rune.physics.Space.separate = function(obj1, obj2) {
    var separatedX = rune.physics.Space.separateX(obj1, obj2);
    var separatedY = rune.physics.Space.separateY(obj1, obj2);

    return separatedX || separatedY;
};

/**
 * Resolves collision between two objects, but only in x direction. The y 
 * coordinates of the objects will not change.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 obj2 The second object.
 *
 * @returns {boolean} If the objects were separated.
 */
rune.physics.Space.separateX = function(obj1, obj2) {
    return rune.physics.Space.m_separateAxis(obj1, obj2, "x");
};

/**
 * Resolves collision between two objects, but only in y direction. The x 
 * coordinates of the objects will not change.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 *
 * @returns {boolean} If the objects were separated.
 */
rune.physics.Space.separateY = function(obj1, obj2) {
    return rune.physics.Space.m_separateAxis(obj1, obj2, "y");
};

//------------------------------------------------------------------------------
// Private static methods
//------------------------------------------------------------------------------

/**
 * Resolves collision along a single axis.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {string} axis Axis to resolve; either "x" or "y".
 *
 * @returns {boolean} If the objects were separated.
 * @private
 */
rune.physics.Space.m_separateAxis = function(obj1, obj2, axis) {
    var obj1immovable = obj1['immovable'];
    var obj2immovable = obj2['immovable'];

    if (obj1immovable && obj2immovable) {
        return false;
    }
    
    var axes = rune.physics.Space.m_getAxes(axis);
    var obj1delta = rune.physics.Space.m_getDelta(obj1, axes);
    var obj2delta = rune.physics.Space.m_getDelta(obj2, axes);
    var overlap = obj1delta != obj2delta ?
        rune.physics.Space.m_calcDynamicOverlap(obj1, obj2, axes, obj1delta, obj2delta) :
        rune.physics.Space.m_calcStaticOverlap(obj1, obj2, axes);
    
    if (overlap == 0) {
        return false;
    }
    
    rune.physics.Space.m_applySeparation(obj1, obj2, axes, overlap, obj1delta, obj2delta);
    
    return true;
};

/**
 * Returns axis metadata used by the generic collision helpers.
 *
 * @param {string} axis Axis to resolve; either "x" or "y".
 *
 * @returns {Object}
 * @private
 */
rune.physics.Space.m_getAxes = function(axis) {
    if (axis == "x") {
        return {
            axis: "x",
            previous: "previousX",
            size: "width",
            cross: "y",
            crossSize: "height",
            low: rune.physics.Space.LEFT,
            high: rune.physics.Space.RIGHT
        };
    }
    
    return {
        axis: "y",
        previous: "previousY",
        size: "height",
        cross: "x",
        crossSize: "width",
        low: rune.physics.Space.UP,
        high: rune.physics.Space.DOWN
    };
};

/**
 * Calculates an object's movement delta along an axis.
 *
 * @param {rune.display.InteractiveObject} obj Object to evaluate.
 * @param {Object} axes Axis metadata.
 *
 * @returns {number}
 * @private
 */
rune.physics.Space.m_getDelta = function(obj, axes) {
    return obj['hitbox'][axes.axis] - obj['hitbox'][axes.previous];
};

/**
 * Calculates overlap for objects with relative movement along an axis.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 * @param {number} obj1delta The first object's movement delta.
 * @param {number} obj2delta The second object's movement delta.
 *
 * @returns {number}
 * @private
 */
rune.physics.Space.m_calcDynamicOverlap = function(obj1, obj2, axes, obj1delta, obj2delta) {
    var obj1rect = rune.physics.Space.m_getSweptRect(obj1, axes, obj1delta);
    var obj2rect = rune.physics.Space.m_getSweptRect(obj2, axes, obj2delta);
    
    if (!rune.geom.Rectangle.intersects(
        obj1rect.x,
        obj1rect.y,
        obj1rect.width,
        obj1rect.height,
        obj2rect.x,
        obj2rect.y,
        obj2rect.width,
        obj2rect.height
    )) {
        return 0;
    }
    
    var maxOverlap = Math.abs(obj1delta) + Math.abs(obj2delta) + rune.physics.Space.OVERLAP_BIAS;
    var overlap = rune.physics.Space.m_getDirectionalOverlap(obj1, obj2, axes, obj1delta > obj2delta);
    
    if (Math.abs(overlap) > maxOverlap || !rune.physics.Space.m_canOverlap(obj1, obj2, axes, overlap)) {
        return 0;
    }
    
    rune.physics.Space.m_setTouching(obj1, obj2, axes, overlap);
    
    return overlap;
};

/**
 * Calculates overlap for objects with no relative movement along an axis.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 *
 * @returns {number}
 * @private
 */
rune.physics.Space.m_calcStaticOverlap = function(obj1, obj2, axes) {
    if (!rune.physics.Space.m_hitboxesOverlap(obj1, obj2)) {
        return 0;
    }
    
    var overlapHigh = rune.physics.Space.m_getDirectionalOverlap(obj1, obj2, axes, true);
    var overlapLow = rune.physics.Space.m_getDirectionalOverlap(obj1, obj2, axes, false);
    var cross = rune.physics.Space.m_getCrossOverlaps(obj1, obj2, axes);
    
    if (Math.min(overlapHigh, -overlapLow) > Math.min(cross.high, -cross.low)) {
        return 0;
    }
    
    var overlap = rune.physics.Space.m_getAllowedOverlap(obj1, obj2, axes, overlapHigh, overlapLow);
    rune.physics.Space.m_setTouching(obj1, obj2, axes, overlap);
    
    return overlap;
};

/**
 * Applies position and velocity changes for a resolved collision.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 * @param {number} overlap Collision overlap.
 * @param {number} obj1delta The first object's movement delta.
 * @param {number} obj2delta The second object's movement delta.
 *
 * @returns {undefined}
 * @private
 */
rune.physics.Space.m_applySeparation = function(obj1, obj2, axes, overlap, obj1delta, obj2delta) {
    var obj1v = obj1['velocity'][axes.axis];
    var obj2v = obj2['velocity'][axes.axis];
    var obj1immovable = obj1['immovable'];
    var obj2immovable = obj2['immovable'];
    
    if (!obj1immovable && !obj2immovable) {
        rune.physics.Space.m_applySharedSeparation(obj1, obj2, axes, overlap, obj1v, obj2v);
    } else if (!obj1immovable) {
        obj1[axes.axis] -= overlap;
        obj1['velocity'][axes.axis] = obj2v - obj1v * rune.physics.Space.m_getElasticity(obj1);
        rune.physics.Space.m_applySticky(obj2, obj1, axes, obj1delta > obj2delta);
    } else if (!obj2immovable) {
        obj2[axes.axis] += overlap;
        obj2['velocity'][axes.axis] = obj1v - obj2v * rune.physics.Space.m_getElasticity(obj2);
        rune.physics.Space.m_applySticky(obj1, obj2, axes, obj1delta < obj2delta);
    }
};

/**
 * Applies position and velocity changes when both objects can move.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 * @param {number} overlap Collision overlap.
 * @param {number} obj1v The first object's velocity.
 * @param {number} obj2v The second object's velocity.
 *
 * @returns {undefined}
 * @private
 */
rune.physics.Space.m_applySharedSeparation = function(obj1, obj2, axes, overlap, obj1v, obj2v) {
    overlap *= 0.5;
    obj1[axes.axis] -= overlap;
    obj2[axes.axis] += overlap;
    
    var obj1mass = rune.physics.Space.m_getMass(obj1);
    var obj2mass = rune.physics.Space.m_getMass(obj2);
    var obj1velocity = Math.sqrt((obj2v * obj2v * obj2mass) / obj1mass) * ((obj2v > 0) ? 1 : -1);
    var obj2velocity = Math.sqrt((obj1v * obj1v * obj1mass) / obj2mass) * ((obj1v > 0) ? 1 : -1);
    var average = (obj1velocity + obj2velocity) * 0.5;
    
    obj1velocity -= average;
    obj2velocity -= average;
    
    obj1['velocity'][axes.axis] = average + obj1velocity * rune.physics.Space.m_getElasticity(obj1);
    obj2['velocity'][axes.axis] = average + obj2velocity * rune.physics.Space.m_getElasticity(obj2);
};

/**
 * Returns a valid mass value for collision calculations.
 *
 * @param {rune.display.InteractiveObject} obj Object to evaluate.
 *
 * @returns {number}
 * @private
 */
rune.physics.Space.m_getMass = function(obj) {
    return obj['mass'] > 0 ? obj['mass'] : 1.0;
};

/**
 * Returns a valid elasticity value for collision calculations.
 *
 * @param {rune.display.InteractiveObject} obj Object to evaluate.
 *
 * @returns {number}
 * @private
 */
rune.physics.Space.m_getElasticity = function(obj) {
    var elasticity = Number(obj['elasticity']);
    
    if (elasticity > 1.0) {
        return 1.0;
    }
    
    return elasticity > 0.0 ? elasticity : 0.0;
};

/**
 * Moves a rider horizontally by the carrier's hitbox movement.
 *
 * @param {rune.display.InteractiveObject} carrier Sticky object.
 * @param {rune.display.InteractiveObject} rider Object on the carrier.
 *
 * @returns {undefined}
 * @private
 */
rune.physics.Space.m_applyStickyX = function(carrier, rider) {
    rider.x += carrier['hitbox']['x'] - carrier['hitbox']['previousX'];
};

/**
 * Applies sticky movement when a vertical collision supports it.
 *
 * @param {rune.display.InteractiveObject} carrier Sticky object.
 * @param {rune.display.InteractiveObject} rider Object on the carrier.
 * @param {Object} axes Axis metadata.
 * @param {boolean} canStick If the collision direction supports stickiness.
 *
 * @returns {undefined}
 * @private
 */
rune.physics.Space.m_applySticky = function(carrier, rider, axes, canStick) {
    if (axes.axis == "y" && canStick && carrier.active && carrier.sticky) {
        rune.physics.Space.m_applyStickyX(carrier, rider);
    }
};

/**
 * Creates a rectangle covering an object's swept movement.
 *
 * @param {rune.display.InteractiveObject} obj Object to evaluate.
 * @param {Object} axes Axis metadata.
 * @param {number} delta Movement delta.
 *
 * @returns {rune.geom.Rectangle}
 * @private
 */
rune.physics.Space.m_getSweptRect = function(obj, axes, delta) {
    var hitbox = obj['hitbox'];
    var deltaAbs = Math.abs(delta);
    
    if (axes.axis == "x") {
        return new rune.geom.Rectangle(
            hitbox['x'] - (delta > 0 ? delta : 0),
            hitbox['previousY'],
            hitbox['width'] + deltaAbs,
            hitbox['height']
        );
    }
    
    return new rune.geom.Rectangle(
        hitbox['x'],
        hitbox['y'] - (delta > 0 ? delta : 0),
        hitbox['width'],
        hitbox['height'] + deltaAbs
    );
};

/**
 * Calculates overlap in one direction along an axis.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 * @param {boolean} high If true, use the high direction; otherwise low.
 *
 * @returns {number}
 * @private
 */
rune.physics.Space.m_getDirectionalOverlap = function(obj1, obj2, axes, high) {
    if (high) {
        return obj1['hitbox'][axes.axis] + obj1['hitbox'][axes.size] - obj2['hitbox'][axes.axis];
    }
    
    return obj1['hitbox'][axes.axis] - obj2['hitbox'][axes.size] - obj2['hitbox'][axes.axis];
};

/**
 * Calculates overlap in both cross-axis directions.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 *
 * @returns {Object}
 * @private
 */
rune.physics.Space.m_getCrossOverlaps = function(obj1, obj2, axes) {
    return {
        high: obj1['hitbox'][axes.cross] + obj1['hitbox'][axes.crossSize] - obj2['hitbox'][axes.cross],
        low: obj1['hitbox'][axes.cross] - obj2['hitbox'][axes.crossSize] - obj2['hitbox'][axes.cross]
    };
};

/**
 * Selects the smallest overlap allowed by collision flags.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 * @param {number} overlapHigh High-direction overlap.
 * @param {number} overlapLow Low-direction overlap.
 *
 * @returns {number}
 * @private
 */
rune.physics.Space.m_getAllowedOverlap = function(obj1, obj2, axes, overlapHigh, overlapLow) {
    var canOverlapHigh = rune.physics.Space.m_canOverlap(obj1, obj2, axes, overlapHigh);
    var canOverlapLow = rune.physics.Space.m_canOverlap(obj1, obj2, axes, overlapLow);
    
    if (canOverlapHigh && canOverlapLow) {
        return overlapHigh <= -overlapLow ? overlapHigh : overlapLow;
    }
    
    if (canOverlapHigh) {
        return overlapHigh;
    }
    
    return canOverlapLow ? overlapLow : 0;
};

/**
 * Evaluates if an overlap direction is allowed by collision flags.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 * @param {number} overlap Collision overlap.
 *
 * @returns {boolean}
 * @private
 */
rune.physics.Space.m_canOverlap = function(obj1, obj2, axes, overlap) {
    if (overlap > 0) {
        return (obj1['allowCollisions'] & axes.high) > 0 && (obj2['allowCollisions'] & axes.low) > 0;
    }
    
    if (overlap < 0) {
        return (obj1['allowCollisions'] & axes.low) > 0 && (obj2['allowCollisions'] & axes.high) > 0;
    }
    
    return false;
};

/**
 * Marks objects as touching along an overlap direction.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 * @param {Object} axes Axis metadata.
 * @param {number} overlap Collision overlap.
 *
 * @returns {undefined}
 * @private
 */
rune.physics.Space.m_setTouching = function(obj1, obj2, axes, overlap) {
    if (overlap > 0) {
        obj1.touching |= axes.high;
        obj2.touching |= axes.low;
    } else if (overlap < 0) {
        obj1.touching |= axes.low;
        obj2.touching |= axes.high;
    }
};

/**
 * Evaluates whether two object hitboxes currently overlap.
 *
 * @param {rune.display.InteractiveObject} obj1 The first object.
 * @param {rune.display.InteractiveObject} obj2 The second object.
 *
 * @returns {boolean}
 * @private
 */
rune.physics.Space.m_hitboxesOverlap = function(obj1, obj2) {
    return (obj1['hitbox']['x'] + obj1['hitbox']['width'] > obj2['hitbox']['x']) &&
           (obj1['hitbox']['x'] < obj2['hitbox']['x'] + obj2['hitbox']['width']) &&
           (obj1['hitbox']['y'] + obj1['hitbox']['height'] > obj2['hitbox']['y']) &&
           (obj1['hitbox']['y'] < obj2['hitbox']['y'] + obj2['hitbox']['height']);
};