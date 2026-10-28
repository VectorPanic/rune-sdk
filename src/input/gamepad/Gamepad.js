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
     * Invalidates pending asynchronous vibration fallbacks.
     *
     * @type {number}
     * @private
     */
    this.m_vibrationID = 0;

    /**
     * Pending delay for legacy pulse actuators.
     *
     * @type {number}
     * @private
     */
    this.m_vibrationTimer = 0;

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
    this.m_so = null;
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
 * @member {string} id
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
 * Indicates whether a physical device is connected to this Gamepad object.
 * Returns false when no device state is available.
 *
 * @member {boolean} connected
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
 * @member {boolean} stickLeftUp
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
        return (this.m_axesOne != null && this.m_axesOne.y < -this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing up.
 *
 * @member {boolean} stickLeftJustUp
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
        if (this.m_axesOne != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesOne.y < -this.tolerance) && (this.m_so.axes[1] > -this.tolerance)) ? true : false;
        }
        
        return false;
    }
});

/**
 * If the left analog stick of the Gamepad object is facing down.
 *
 * @member {boolean} stickLeftDown
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
        return (this.m_axesOne != null && this.m_axesOne.y > this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing down.
 *
 * @member {boolean} stickLeftJustDown
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
        if (this.m_axesOne != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesOne.y > this.tolerance) && (this.m_so.axes[1] < this.tolerance)) ? true : false;
        }
        
        return false;
    }
});

/**
 * If the left analog stick of the Gamepad object is facing left.
 *
 * @member {boolean} stickLeftLeft
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
        return (this.m_axesOne != null && this.m_axesOne.x < -this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing left.
 *
 * @member {boolean} stickLeftJustLeft
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
        if (this.m_axesOne != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesOne.x < -this.tolerance) && (this.m_so.axes[0] > -this.tolerance)) ? true : false;
        }
        
        return false;
    }
});

/**
 * If the left analog stick of the Gamepad object is facing right.
 *
 * @member {boolean} stickLeftRight
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
        return (this.m_axesOne != null && this.m_axesOne.x > this.tolerance) ? true : false;
    }
});

/**
 * If the left analog stick of the Gamepad object was just facing right.
 *
 * @member {boolean} stickLeftJustRight
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
        if (this.m_axesOne != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesOne.x > this.tolerance) && (this.m_so.axes[0] < this.tolerance)) ? true : false;
        }
        
        return false;
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
 * @member {boolean} stickRightUp
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
        return (this.m_axesTwo != null && this.m_axesTwo.y < -this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing up.
 *
 * @member {boolean} stickRightJustUp
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
        if (this.m_axesTwo != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesTwo.y < -this.tolerance) && (this.m_so.axes[3] > -this.tolerance)) ? true : false;
        }
        
        return false;
    }
});

/**
 * If the right analog stick of the Gamepad object is facing down.
 *
 * @member {boolean} stickRightDown
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
        return (this.m_axesTwo != null && this.m_axesTwo.y > this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing down.
 *
 * @member {boolean} stickRightJustDown
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
        if (this.m_axesTwo != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesTwo.y > this.tolerance) && (this.m_so.axes[3] < this.tolerance)) ? true : false;
        }
        
        return false;
    }
});

/**
 * If the right analog stick of the Gamepad object is facing left.
 *
 * @member {boolean} stickRightLeft
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
        return (this.m_axesTwo != null && this.m_axesTwo.x < -this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing left.
 *
 * @member {boolean} stickRightJustLeft
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
        if (this.m_axesTwo != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesTwo.x < -this.tolerance) && (this.m_so.axes[2] > -this.tolerance)) ? true : false;
        }
        
        return false;
    }
});

/**
 * If the right analog stick of the Gamepad object is facing right.
 *
 * @member {boolean} stickRightRight
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
        return (this.m_axesTwo != null && this.m_axesTwo.x > this.tolerance) ? true : false;
    }
});

/**
 * If the right analog stick of the Gamepad object was just facing right.
 *
 * @member {boolean} stickRightJustRight
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
        if (this.m_axesTwo != null && this.m_so != null && this.m_so.axes) {
            return ((this.m_axesTwo.x > this.tolerance) && (this.m_so.axes[2] < this.tolerance)) ? true : false;
        }
        
        return false;
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
    this.vibrate(0);
    this.m_disposeState();
    this.m_resetAxes();
};

/**
 * Triggers vibration using playEffect, falling back to legacy hapticActuators
 * and pulse for dual-rumble. Unsupported devices and rejected effects are safe
 * no-ops. A new call, reset or disconnect cancels pending fallback work.
 *
 * @param {number} [duration=250] Duration in milliseconds. Zero or less stops
 *     vibration and cancels pending requests.
 * @param {number} [delay=0] Delay before vibration starts, in milliseconds.
 * @param {number} [weak=1.0] High-frequency motor intensity, clamped to 0.0–1.0.
 * @param {number} [strong=1.0] Low-frequency motor intensity, clamped to 0.0–1.0.
 * @param {string} [type="dual-rumble"] The vibration effect type.
 * 
 * @returns {undefined}
 */
rune.input.Gamepad.prototype.vibrate = function(duration, delay, weak, strong, type) {
    var id = ++this.m_vibrationID;
    if (this.m_vibrationTimer) {
        window.clearTimeout(this.m_vibrationTimer);
        this.m_vibrationTimer = 0;
    }
    
    var actuators = this.m_getVibrationActuators();
    duration = typeof duration === "number" && isFinite(duration) ? duration : 250;
    if (duration <= 0) {
        for (var i = 0; i < actuators.length; i++) {
            try {
                var result = typeof actuators[i].reset === "function" ? actuators[i].reset() :
                    (typeof actuators[i]["pulse"] === "function" ? actuators[i]["pulse"](0, 0) : null);
                if (result && typeof result.then === "function") result.then(null, function() {});
            } catch (error) {
                // Unsupported hardware must not interrupt input or disposal.
            }
        }
        return;
    }
    
    if (!this.m_active || this.m_sc == null || this.m_sc.connected === false) return;
    delay = typeof delay === "number" && isFinite(delay) ? Math.max(0, delay) : 0;
    weak = typeof weak === "number" && isFinite(weak) ? Math.max(0, Math.min(1, weak)) : 1;
    strong = typeof strong === "number" && isFinite(strong) ? Math.max(0, Math.min(1, strong)) : 1;
    
    this.m_playVibration(actuators, 0, type || "dual-rumble", {
        startDelay: delay,
        duration: duration,
        weakMagnitude: weak,
        strongMagnitude: strong
    }, id);
};

/**
 * Collects the current device's vibration actuators without duplicates.
 * Native actuator references are preserved so their methods retain the
 * original receiver.
 *
 * @returns {Array.<Object>}
 * @private
 */
rune.input.Gamepad.prototype.m_getVibrationActuators = function() {
    var result = [];
    if (this.m_sc == null) return result;
    if (this.m_sc.vibrationActuator) result.push(this.m_sc.vibrationActuator);
    var legacy = this.m_sc.hapticActuators || [];
    for (var i = 0; i < legacy.length; i++) {
        if (legacy[i] && result.indexOf(legacy[i]) === -1) result.push(legacy[i]);
    }
    return result;
};

/**
 * Attempts to play a vibration effect using the selected actuator. Falls back
 * to a legacy pulse or the next actuator if the effect is unavailable or fails.
 * Requests superseded by another vibration call are ignored.
 *
 * @param {Array.<Object>} actuators Available device actuators.
 * @param {number} index Index of the actuator to try.
 * @param {string} type The vibration effect type.
 * @param {Object} settings Duration, delay and motor strengths for the effect.
 * @param {number} id Identifier of the current vibration request.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepad.prototype.m_playVibration = function(actuators, index, type, settings, id) {
    if (id !== this.m_vibrationID || index >= actuators.length) return;
    var gamepad = this;
    var actuator = actuators[index];
    var fallback = function() {
        gamepad.m_pulseVibration(actuators, index, type, settings, id);
    };
    try {
        if (typeof actuator.playEffect === "function" &&
            (!actuator.effects || Array.prototype.indexOf.call(actuator.effects, type) !== -1)) {
            var result = actuator.playEffect(type, settings);
            if (result && typeof result.then === "function") {
                result.then(function(value) { if (value === false) fallback(); }, fallback);
            } else if (result === false) fallback();
            return;
        }
    } catch (error) {
        // Some implementations throw synchronously instead of rejecting a Promise.
    }
    fallback();
};

/**
 * Attempts a legacy pulse for dual-rumble effects, preserving the requested
 * delay. Tries the next actuator if the pulse is unavailable or fails.
 * Requests superseded by another vibration call are ignored.
 *
 * @param {Array.<Object>} actuators Available device actuators.
 * @param {number} index Index of the actuator to try.
 * @param {string} type The vibration effect type.
 * @param {Object} settings Duration, delay and motor strengths for the effect.
 * @param {number} id Identifier of the current vibration request.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepad.prototype.m_pulseVibration = function(actuators, index, type, settings, id) {
    if (id !== this.m_vibrationID) return;
    var gamepad = this;
    var actuator = actuators[index];
    var next = function() {
        gamepad.m_playVibration(actuators, index + 1, type, settings, id);
    };
    if (type !== "dual-rumble" || typeof actuator["pulse"] !== "function") {
        next();
        return;
    }
    var pulse = function() {
        if (id !== gamepad.m_vibrationID) return;
        gamepad.m_vibrationTimer = 0;
        try {
            var result = actuator["pulse"](
                Math.max(settings.weakMagnitude, settings.strongMagnitude), settings.duration
            );
            if (result && typeof result.then === "function") {
                result.then(function(value) { if (value === false) next(); }, next);
            } else if (result === false) next();
        } catch (error) {
            next();
        }
    };
    if (settings.startDelay > 0) {
        this.m_vibrationTimer = window.setTimeout(pulse, settings.startDelay);
    } else {
        pulse();
    }
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
    this.vibrate(0);
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
    if (this.m_sc != null && (state == null || state.connected === false)) this.vibrate(0);
    this.m_so = this.m_sc;
    this.m_sc = (state != null) ? this.m_clone(state) : null;
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
    } else {
        this.m_resetAxes();
    }
};

/**
 * Resets joystick values.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepad.prototype.m_resetAxes = function() {
    if (this.m_axesOne != null) {
        this.m_axesOne.x = 0;
        this.m_axesOne.y = 0;
    }
    
    if (this.m_axesTwo != null) {
        this.m_axesTwo.x = 0;
        this.m_axesTwo.y = 0;
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
    this.m_sc = null;
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
};

/**
 * Recursively copies the device state while preserving native vibration
 * actuator references. Actuator getters are also read when non-enumerable.
 *
 * @param {Object} obj Object to clone.
 *
 * @returns {Object}
 * @private
 */
rune.input.Gamepad.prototype.m_clone = function(obj) {
    if (obj == null) return null;
    
    var clone = {};
    for (var i in obj) {
        if (obj[i] && typeof obj[i] === "object" && i !== "vibrationActuator" && i !== "hapticActuators") clone[i] = this.m_clone(obj[i]);
        else clone[i] = obj[i];
    }

    // Native handles may use non-enumerable getters and require their original receiver.
    if (obj.vibrationActuator) clone.vibrationActuator = obj.vibrationActuator;
    if (obj.hapticActuators) clone.hapticActuators = obj.hapticActuators;
    
    return clone;
};