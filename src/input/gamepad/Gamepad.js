//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Gamepad object.
 * 
 * @constructor
 * @package
 *
 * @class
 * @classdesc
 * 
 * The Gamepad class represents a physical gamepad device and its current 
 * state. Note that the class can not be instantiated by itself, Gamepad 
 * objects are retrieved via an instance of the Gamepads class, which acts as 
 * a handler for all connected devices. Objects of the Gamepad class are used 
 * to read the state of a specific gamepad device, for example for player one, 
 * etc..
 */
rune.input.Gamepad = function() {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * The "dead zone" threshold of a joystick. All input data lower than this 
     * value is ignored.
     *
     * @type {number}
     * @default 0.2
     */
    this.threshold = 0.2;

    /**
     * Threshold for when input data from joysticks is to be counted as a 
     * boolean true value.
     *
     * @type {number}
     * @default 0.5
     */
    this.tolerance = 0.5;

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Whether the Gamepad object is active or not.
     *
     * @type {boolean}
     * @private
     */
    this.m_active = true;

    /**
     * Input from the left analog stick.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_axesOne = new rune.geom.Point(0, 0);

    /**
     * Input from the right analog stick.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_axesTwo = new rune.geom.Point(0, 0);

    /**
     * Object that represent the current state of the physical device.
     *
     * @type {Object}
     * @private
     */
    this.m_sc = null;

    /**
     * Object that represent the previous state of the physical device, ie that 
     * from the previous update.
     *
     * @type {Object}
     * @private
     */
    this.m_so = null
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the Gamepad object is active (true) or not (false). If false, the 
 * state of the Gamepad object will not be updated.
 *
 * @member {boolean} active
 * @memberof rune.input.Gamepad
 * @instance
 */
Object.defineProperty(rune.input.Gamepad.prototype, "active", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return this.m_active;
    },
    
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    set : function(value) {
        this.m_active = value;
        this.reset();
    }
});

/**
 * An ID string containing information about the physical device that the 
 * Gamepad object represents. Note that this value is set by the manufacturer 
 * of the current physical device.
 *
 * @member {number} id
 * @memberof rune.input.Gamepad
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "id", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_sc) ? this.m_sc.id : "";
    }
});

/**
 * An integer that is auto-incremented to be unique for each device 
 * currently connected to the system.
 *
 * @member {number} index
 * @memberof rune.input.Gamepad
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "index", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_sc) ? this.m_sc.index : -1;
    }
});

/**
 * Indicates whether the Gamepad object is connected (true) or not (false). 
 * Generally, this value should never be false as long as the Gamepad object 
 * exists.
 *
 * @member {booelan} connected
 * @memberof rune.input.Gamepad
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "connected", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_sc) ? Boolean(this.m_sc.connected) : false;
    }
});

/**
 * A list of the Gamepad object's buttons and their current state. Each button 
 * is indexed by their button ID.
 *
 * @member {Array} buttons
 * @memberof rune.input.Gamepad
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "buttons", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_sc) ? this.m_sc.buttons : [];
    }
});

/**
 * The direction of the left joystick of the input device. The direction is 
 * represented by a Point object that describes the x- and y-axis of the 
 * joystick.
 *
 * @member {rune.geom.Point} stickLeft
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeft", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return this.m_axesOne;
    }
});

/**
 * If the left analog stick of the Gamepad object is facing up.
 *
 * @member {booelan} stickLeftUp
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftUp", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesOne.y < -this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing up.
 *
 * @member {booelan} stickLeftJustUp
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftJustUp", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesOne.y < -this.tolerance) && (this.m_so.axes[1] > -this.tolerance)) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object is facing down.
 *
 * @member {booelan} stickLeftDown
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftDown", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesOne.y > this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing down.
 *
 * @member {booelan} stickLeftJustDown
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftJustDown", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesOne.y > this.tolerance) && (this.m_so.axes[1] < this.tolerance)) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object is facing left.
 *
 * @member {booelan} stickLeftLeft
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftLeft", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesOne.x < -this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing left.
 *
 * @member {booelan} stickLeftJustLeft
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftJustLeft", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesOne.x < -this.tolerance) && (this.m_so.axes[0] > -this.tolerance)) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object is facing right.
 *
 * @member {booelan} stickLeftRight
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftRight", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesOne.x > this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing right.
 *
 * @member {booelan} stickLeftJustRight
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickLeftJustRight", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesOne.x > this.tolerance) && (this.m_so.axes[0] < this.tolerance)) ? true : false;
    }
});

/**
 * The direction of the right joystick of the input device. The direction is 
 * represented by a Point object that describes the x- and y-axis of the 
 * joystick.
 *
 * @member {rune.geom.Point} stickRight
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRight", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return this.m_axesTwo;
    }
});

/**
 * If the right analog stick of the Gamepad object is facing up.
 *
 * @member {booelan} stickRightUp
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightUp", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesTwo.y < -this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing up.
 *
 * @member {booelan} stickRightJustUp
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightJustUp", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesTwo.y < -this.tolerance) && (this.m_so.axes[3] > -this.tolerance)) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object is facing down.
 *
 * @member {booelan} stickRightDown
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightDown", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesTwo.y > this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing down.
 *
 * @member {booelan} stickRightJustDown
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightJustDown", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesTwo.y > this.tolerance) && (this.m_so.axes[3] < this.tolerance)) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object is facing left.
 *
 * @member {booelan} stickRightLeft
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightLeft", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesTwo.x < -this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing left.
 *
 * @member {booelan} stickRightJustLeft
 * @memberof rune.input.Gamepad
 * @instance 
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightJustLeft", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesTwo.x < -this.tolerance) && (this.m_so.axes[2] > -this.tolerance)) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object is facing right.
 *
 * @member {booelan} stickRightRight
 * @memberof rune.input.Gamepad
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightRight", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return (this.m_axesTwo.x > this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing right.
 *
 * @member {booelan} stickRightJustRight
 * @memberof rune.input.Gamepad
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepad.prototype, "stickRightJustRight", {
    /**
     * @this rune.input.Gamepad
     * @ignore
     */
    get : function() {
        return ((this.m_axesTwo.x > this.tolerance) && (this.m_so.axes[2] < this.tolerance)) ? true : false;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Whether a specific button on the input device was just pressed. The button 
 * is identified based on its button ID.
 *
 * @param {number} button Button ID.
 *
 * @returns {boolean}
 */
rune.input.Gamepad.prototype.justPressed = function(button) {
    if (this.m_isButtonInvalid(button)) return false;
    return (this.m_sc.buttons[button].pressed === true && 
            this.m_so.buttons[button].pressed === false) ? true : false;
};

/**
 * Whether a specific button on the input device was just released. The button 
 * is identified based on its button ID.
 *
 * @param {number} button Button ID.
 *
 * @returns {boolean}
 */
rune.input.Gamepad.prototype.justReleased = function(button) {
    if (this.m_isButtonInvalid(button)) return false;
    return (this.m_sc.buttons[button].pressed === false && 
            this.m_so.buttons[button].pressed === true) ? true : false;
};

/**
 * Whether a specific button on the input device is pressed. The button is 
 * identified based on its button ID.
 *
 * @param {number} button Button ID.
 *
 * @returns {boolean}
 */
rune.input.Gamepad.prototype.pressed = function(button) {
    if (this.m_isButtonInvalid(button)) return false;
    return this.m_sc.buttons[button].pressed === true ? true : false;
};

/**
 * Resets the state of the Gamepad object.
 * 
 * @returns {undefined}
 */
rune.input.Gamepad.prototype.reset = function() {
    this.m_disposeState();
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Destroys the Gamepad object and frees up memory allocated by it.
 * 
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Gamepad.prototype.dispose = function() {
    this.m_disposeAxes();
    this.m_disposeState();
};

/**
 * Updates the current state of the Gamepad object based on data from the 
 * connected physical device that the object represents.
 *
 * @param {Object} state New gamepad state.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.input.Gamepad.prototype.update = function(state) {
    this.m_updateState(state);
    this.m_updateAxes();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates the current state of the gamepad.
 *
 * @param {Object} state New gamepad state.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepad.prototype.m_updateState = function(state) {
    this.m_so = this.m_sc;
    this.m_sc = this.m_clone(state);
};

/**
 * Updates joystick values.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepad.prototype.m_updateAxes = function() {
    if (this.m_sc != null && this.m_sc.axes != null) {
        this.m_axesOne.x = this.m_sc.axes[0] || 0;
        this.m_axesOne.y = this.m_sc.axes[1] || 0;
        this.m_axesTwo.x = this.m_sc.axes[2] || 0;
        this.m_axesTwo.y = this.m_sc.axes[3] || 0;

        this.m_axesOne.x = (Math.abs(this.m_axesOne.x) < this.threshold) ? 0 : this.m_axesOne.x;
        this.m_axesOne.y = (Math.abs(this.m_axesOne.y) < this.threshold) ? 0 : this.m_axesOne.y;
        this.m_axesTwo.x = (Math.abs(this.m_axesTwo.x) < this.threshold) ? 0 : this.m_axesTwo.x;
        this.m_axesTwo.y = (Math.abs(this.m_axesTwo.y) < this.threshold) ? 0 : this.m_axesTwo.y;
    }
};

/**
 * Destroy objects that represent the Gamepad Object's joysticks.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepad.prototype.m_disposeAxes = function() {
    this.m_axesOne = null;
    this.m_axesTwo = null;
};

/**
 * Destroys the states of the Gamepad object.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepad.prototype.m_disposeState = function() {
    this.m_so = null;
    this.m_cs = null;
};

/**
 * Tests if a button ID is valid, ie if the ID can be used to read input data.
 *
 * @param {number} button ID of button to test.
 *
 * @returns {boolean}
 * @private
 */
rune.input.Gamepad.prototype.m_isButtonInvalid = function(button) {
    if (this.m_sc == null || this.m_sc.buttons == null || this.m_sc.buttons[button] == null) return true;
    if (this.m_so == null || this.m_so.buttons == null || this.m_so.buttons[button] == null) return true;

    return false;
}

/**
 * Creates a (fast) shallow clone of an object.
 *
 * @param {Object} obj Object to clone.
 *
 * @returns {Object}
 * @private
 */
rune.input.Gamepad.prototype.m_clone = function(obj) {
    var clone = {};
    for (var i in obj) {
        if (obj[i] && typeof obj[i] === "object") clone[i] = this.m_clone(obj[i]);
        else clone[i] = obj[i];
    }

    return clone;
}