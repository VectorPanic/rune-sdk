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
}

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
    var obj1immovable = obj1['immovable'];
    var obj2immovable = obj2['immovable'];

    if (obj1immovable && obj2immovable) {
        return false;
    }

    var overlap = 0;
    var obj1delta = obj1['hitbox']['x'] - obj1['hitbox']['previousX'];
    var obj2delta = obj2['hitbox']['x'] - obj2['hitbox']['previousX'];
    
    if (obj1delta != obj2delta) {
        
        var obj1deltaAbs = Math.abs(obj1delta);
        var obj2deltaAbs = Math.abs(obj2delta);
        
        var obj1rect = new rune.geom.Rectangle(obj1['hitbox']['x'] - ((obj1delta > 0) ? obj1delta : 0), obj1['hitbox']['previousY'], obj1['hitbox']['width'] + ((obj1delta > 0) ? obj1delta : -obj1delta), obj1['hitbox']['height']);
        var obj2rect = new rune.geom.Rectangle(obj2['hitbox']['x'] - ((obj2delta > 0) ? obj2delta : 0), obj2['hitbox']['previousY'], obj2['hitbox']['width'] + ((obj2delta > 0) ? obj2delta : -obj2delta), obj2['hitbox']['height']);
        
        if ((obj1rect.x + obj1rect.width > obj2rect.x) && (obj1rect.x < obj2rect.x + obj2rect.width) && (obj1rect.y + obj1rect.height > obj2rect.y) && (obj1rect.y < obj2rect.y + obj2rect.height)) {
            
            var maxOverlap = obj1deltaAbs + obj2deltaAbs + rune.physics.Space.OVERLAP_BIAS;
            var LEFT  = rune.physics.Space.LEFT;
            var RIGHT = rune.physics.Space.RIGHT;
            
            if (obj1delta > obj2delta) {
                overlap = obj1['hitbox']['x'] + obj1['hitbox']['width'] - obj2['hitbox']['x'];
                if ((overlap > maxOverlap) || !(obj1['allowCollisions'] & RIGHT) || !(obj2['allowCollisions'] & LEFT)) {
                    overlap = 0;
                } else {
                    obj1.touching |= RIGHT;
                    obj2.touching |= LEFT;
                }
            } else if (obj1delta < obj2delta) {
                overlap = obj1['hitbox']['x'] - obj2['hitbox']['width'] - obj2['hitbox']['x'];
                if ((-overlap > maxOverlap) || !(obj1['allowCollisions'] & LEFT) || !(obj2['allowCollisions'] & RIGHT)) {
                    overlap = 0;
                } else {
                    obj1.touching |= LEFT;
                    obj2.touching |= RIGHT;
                }
            }
        }
    }

    if (overlap != 0) {
        var obj1v = obj1['velocity']['x'];
        var obj2v = obj2['velocity']['x'];
        
        if (!obj1immovable && !obj2immovable) {
            
            overlap *= 0.5;
            obj1.x = obj1.x - overlap;
            obj2.x += overlap;
            
            var obj1velocity = Math.sqrt((obj2v * obj2v * obj2.mass) / obj1.mass) * ((obj2v > 0) ? 1 : -1);
            var obj2velocity = Math.sqrt((obj1v * obj1v * obj1.mass) / obj2.mass) * ((obj1v > 0) ? 1 : -1);
            var average = (obj1velocity + obj2velocity) * 0.5;
            
            obj1velocity -= average;
            obj2velocity -= average;
            
            obj1['velocity']['x'] = average + obj1velocity * obj1.elasticity;
            obj2['velocity']['x'] = average + obj2velocity * obj2.elasticity;
            
        } else if (!obj1immovable) {
            obj1.x = obj1.x - overlap;
            obj1['velocity']['x'] = obj2v - obj1v * obj1.elasticity;
        } else if (!obj2immovable) {
            obj2.x += overlap;
            obj2['velocity']['x'] = obj1v - obj2v * obj2.elasticity;
        }
        
        return true;
        
    } else {
        return false;
    }
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
    var obj1immovable = obj1['immovable'];
    var obj2immovable = obj2['immovable'];

    if (obj1immovable && obj2immovable) {
        return false;
    }
    
    var overlap = 0;
    var obj1delta = obj1['hitbox']['y'] - obj1['hitbox']['previousY'];
    var obj2delta = obj2['hitbox']['y'] - obj2['hitbox']['previousY'];
    
    if (obj1delta != obj2delta) {
        
        var obj1deltaAbs = Math.abs(obj1delta);
        var obj2deltaAbs = Math.abs(obj2delta);
        
        var obj1rect = new rune.geom.Rectangle(obj1['hitbox']['x'], obj1['hitbox']['y'] - ((obj1delta > 0) ? obj1delta : 0), obj1['hitbox']['width'], obj1['hitbox']['height'] + obj1deltaAbs);
        var obj2rect = new rune.geom.Rectangle(obj2['hitbox']['x'], obj2['hitbox']['y'] - ((obj2delta > 0) ? obj2delta : 0), obj2['hitbox']['width'], obj2['hitbox']['height'] + obj2deltaAbs);
        
        if ((obj1rect.x + obj1rect.width > obj2rect.x) && (obj1rect.x < obj2rect.x + obj2rect.width) && (obj1rect.y + obj1rect.height > obj2rect.y) && (obj1rect.y < obj2rect.y + obj2rect.height)) {
            
            var maxOverlap = obj1deltaAbs + obj2deltaAbs + rune.physics.Space.OVERLAP_BIAS;
            var UP   = rune.physics.Space.UP;
            var DOWN = rune.physics.Space.DOWN;
            
            if (obj1delta > obj2delta) {
                overlap = obj1['hitbox']['y'] + obj1['hitbox']['height'] - obj2['hitbox']['y'];
                if ((overlap > maxOverlap) || !(obj1['allowCollisions'] & DOWN) || !(obj2['allowCollisions'] & UP)) {
                    overlap = 0;
                } else {
                    obj1.touching |= DOWN;
                    obj2.touching |= UP;
                }
            } else if (obj1delta < obj2delta) {
                overlap = obj1['hitbox']['y'] - obj2['hitbox']['height'] - obj2['hitbox']['y'];
                if ((-overlap > maxOverlap) || !(obj1['allowCollisions'] & UP) || !(obj2['allowCollisions'] & DOWN)) {
                    overlap = 0;
                } else {
                    obj1.touching |= UP;
                    obj2.touching |= DOWN;
                }
            }
        }
    }
    
    if (overlap != 0) {
        var obj1v = obj1['velocity']['y'];
        var obj2v = obj2['velocity']['y'];
            
        if (!obj1immovable && !obj2immovable) {
            overlap *= 0.5;
            obj1.y = obj1.y - overlap;
            obj2.y += overlap;
            
            var obj1velocity = Math.sqrt((obj2v * obj2v * obj2.mass) / obj1.mass) * ((obj2v > 0) ? 1 : -1);
            var obj2velocity = Math.sqrt((obj1v * obj1v * obj1.mass) / obj2.mass) * ((obj1v > 0) ? 1 : -1);
            var average = (obj1velocity + obj2velocity) * 0.5;
            
            obj1velocity -= average;
            obj2velocity -= average;
            
            obj1['velocity']['y'] = average + obj1velocity * obj1.elasticity;
            obj2['velocity']['y'] = average + obj2velocity * obj2.elasticity;
            
        } else if (!obj1immovable) {
            obj1.y = obj1.y - overlap;
            obj1['velocity']['y'] = obj2v - obj1v * obj1.elasticity;
            if (obj2.active && obj2.sticky && (obj1delta > obj2delta)) {
                obj1.x += obj2['hitbox']['x'] - obj2['hitbox']['previousX'];
            }
        } else if (!obj2immovable) {
            obj2.y += overlap;
            obj2['velocity']['y'] = obj1v - obj2v * obj2.elasticity;
            if (obj1.active && obj1.sticky && (obj1delta < obj2delta)) {
                obj2.x += obj1.x - obj1['hitbox']['previousX'];
            }
        }
        
        return true;
        
    } else {
        return false;
    }
};