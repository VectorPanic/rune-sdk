//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the class.
 * 
 * @constructor
 *
 * @param {Object} [options] Gamepad settings.
 *
 * @class
 * @classdesc
 *
 * The Gamepads class represents a gamepad device handler, where each device is 
 * represented by a Gamepad object.
 */
rune.input.Gamepads = function(options) {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * List containing registered input devices.
     *
     * @type {Array}
     * @protected
     * @ignore
     */
    this.m_devices;
    
    /**
     * List containing objects that represent each gamepad.
     *
     * @type {Array}
     * @protected
     * @ignore
     */
    this.m_gamepads;
    
    /**
     * Gamepad settings.
     *
     * @type {rune.input.GamepadsOptions}
     * @protected
     * @ignore
     */
    this.m_options = new rune.input.GamepadsOptions(options);
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
}

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether the gamepads subsystem should be enabled (true) or not (false).
 * When the subsystem is inactive, devices do not respond to input.
 *
 * @member {boolean} enable
 * @memberof rune.input.Gamepads
 * @instance
 */
Object.defineProperty(rune.input.Gamepads.prototype, "enable", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_options.enable;
    },

    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    set : function(value) {
        if (this.m_options.enable != value) {
            this.m_options.enable  = value;
            
            if (this.m_options.enable == false) {
                this.reset();
            }
        }
    }
});

/**
 * Returns the number of connected gamepads. This value is always represented 
 * by an integer between 0 and 4.
 *
 * @member {number} numGamepads
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "numGamepads", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        var num = 0;
        if (this.m_gamepads != null) {
            for (var i = 0; i < this.m_gamepads.length; i++) {
                if (this.m_gamepads[i].connected == true) {
                    num++;
                }
            }
        }
        
        return num;
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick is facing up. For gamepads that do not have analog sticks, this value 
 * is always false.
 *
 * @member {boolean} stickLeftUp
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftUp", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftUp");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick was just facing up. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickLeftJustUp
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftJustUp", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftJustUp");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick is facing down. For gamepads that do not have analog sticks, this value 
 * is always false.
 *
 * @member {boolean} stickLeftDown
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftDown", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftDown");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick was just facing down. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickLeftJustDown
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftJustDown", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftJustDown");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick is facing left. For gamepads that do not have analog sticks, this value 
 * is always false.
 *
 * @member {boolean} stickLeftLeft
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftLeft", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftLeft");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick was just facing left. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickLeftJustLeft
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftJustLeft", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftJustLeft");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick is facing right. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickLeftRight
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftRight", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftRight");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's left analog 
 * stick was just facing right. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickLeftJustRight
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickLeftJustRight", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickLeftJustRight");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick is facing up. For gamepads that do not have analog sticks, this value 
 * is always false.
 *
 * @member {boolean} stickRightUP
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightUP", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightUp");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick was just facing up. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickRightJustUp
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightJustUp", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightJustUp");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick is facing down. For gamepads that do not have analog sticks, this value 
 * is always false.
 *
 * @member {boolean} stickRightDown
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightDown", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightDown");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick was just facing down. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickRightJustDown
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightJustDown", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightJustDown");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick is facing left. For gamepads that do not have analog sticks, this value 
 * is always false.
 *
 * @member {boolean} stickRightLeft
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightLeft", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightLeft");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick was just facing left. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickRightJustLeft
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightJustLeft", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightJustLeft");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick is facing right. For gamepads that do not have analog sticks, this 
 * value is always false.
 *
 * @member {boolean} stickRightRight
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightRight", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightRight");
    }
});

/**
 * Returns true if the direction of any of the connected gamepad's right analog 
 * stick was just facing right. For gamepads that do not have analog sticks, 
 * this value is always false.
 *
 * @member {boolean} stickRightJustRight
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 */
Object.defineProperty(rune.input.Gamepads.prototype, "stickRightJustRight", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        return this.m_getPropOfGamepads("stickRightJustRight");
    }
});

//------------------------------------------------------------------------------
// Private getter and setter methods
//------------------------------------------------------------------------------

/**
 * The number of connected input devices, note that this is not necessarily the 
 * same as the number of connected Gamepad objects.
 *
 * @member {number} m_numDevices
 * @memberof rune.input.Gamepads
 * @instance
 * @readonly
 * @private
 */
Object.defineProperty(rune.input.Gamepads.prototype, "m_numDevices", {
    /**
     * @this rune.input.Gamepads
     * @ignore
     */
    get : function() {
        var num = 0;
        for (var i = 0; i < this.m_devices.length; i++) {
            if (this.m_devices[i] !== null) {
                num++;
            }
        }
        
        return num;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Request an instance of the Gamepad class. Each instance represents a 
 * connected device. Because the subsystem can handle up to four devices, an 
 * ID between 0 and 3 must be used. The method always returns a Gamepad object, 
 * even if there is no connected physical device for the requested ID. A 
 * Gamepad object that is not connected to a physical device can still be used 
 * via code, but all input is always false for that Gamepad object.
 * 
 * @param {number} id ID of requested Gamepad object.
 * 
 * @throws {RangeError} If the requested ID is outside the range of possible IDs.
 *
 * @returns {rune.input.Gamepad}
 */
rune.input.Gamepads.prototype.get = function(id) {
    if (id < this.m_gamepads.length) {
        return this.m_gamepads[id];
    } throw new RangeError();
};

/**
 * Check if any of the connected devices just pressed a specific button that 
 * is identified by its button ID.
 *
 * @param {number} button button Button ID.
 *
 * @returns {boolean}
 */
rune.input.Gamepads.prototype.justPressed = function(button) {
    var i = this.m_gamepads.length;
    while (i--) {
        if (this.m_gamepads[i] != null) {
            if (this.m_gamepads[i].justPressed(button) === true) {
                return true;
            };
        };
    };

    return false;
};

/**
 * Check if any of the connected devices released a specific button that is 
 * identified via their button ID.
 *
 * @param {number} button button Button ID.
 *
 * @returns {boolean}
 */
rune.input.Gamepads.prototype.justReleased = function(button) {
    var i = this.m_gamepads.length;
    while (i--) {
        if (this.m_gamepads[i] != null) {
            if (this.m_gamepads[i].justReleased(button) === true) {
                return true;
            };
        };
    };

    return false;
};

/**
 * Check if one of the connected devices presses a specific button which is 
 * identified via its button ID.
 *
 * @param {number} button Button ID.
 *
 * @returns {boolean}
 */
rune.input.Gamepads.prototype.pressed = function(button) {
    var i = this.m_gamepads.length;
    while (i--) {
        if (this.m_gamepads[i] != null) {
            if (this.m_gamepads[i].pressed(button) === true) {
                return true;
            };
        };
    };

    return false;
};

/**
 * Resets the input of all connected Gamepad objects.
 *
 * @returns {undefined}
 */
rune.input.Gamepads.prototype.reset = function() {
    this.m_resetGamepads();
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Destroys the subsystem and frees up allocated memory.
 *
 * @returns {undefined}
 * @ignore
 */
rune.input.Gamepads.prototype.dispose = function() {
    this.m_disposeGamepads();
    this.m_disposeDevices();
};

/**
 * Updates all connected Gamepad objects.
 *
 * @returns {undefined}
 * @ignore
 */
rune.input.Gamepads.prototype.update = function() {
    if (this.m_options.enable == true) {
        this.m_updateDevices();
        this.m_updateGamepads();
    }
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
rune.input.Gamepads.prototype.m_construct = function() {
    this.m_constructDevices();
    this.m_constructGamepads();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates support for connected devices.
 *
 * @throws {Error} If there is no support for W3C Gamepad.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_constructDevices = function() {
    if (navigator && typeof navigator.getGamepads === "function") {
        this.m_devices = window.navigator.getGamepads();
    } else throw new Error("Gamepads not supported at runtime.");
};

/**
 * Creates Gamepad objects to represent connected devices.
 *
 * @throws {Error} If Gamepad objects could not be created.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_constructGamepads = function() {
    this.m_disposeGamepads();
    if (this.m_gamepads == null && this.m_devices != null) {
        this.m_gamepads = [];
        for (var i = 0; i < this.m_devices.length; i++) {
            this.m_gamepads.push(
                new rune.input.Gamepad()
            );
        }
    } else throw new Error();
};

/**
 * Updates the state of connected devices.
 *
 * @throws {Error} If the state could not be updated.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_updateDevices = function() {
    if (window.navigator != null) {
        this.m_devices = window.navigator.getGamepads();

        var a = this['m_numDevices'];
        var b = this['numGamepads'];

        if      (a > b) this.m_onDeviceConnected();
        else if (a < b) this.m_onDeviceDisconnected();
    } else throw new Error();
};

/**
 * Updates the states of Gamepad objects.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_updateGamepads = function() {
    if (this.m_gamepads == null) return;
    for (var i = 0; i < this.m_gamepads.length; i++) {
        if (this.m_gamepads[i].active === true) {
            this.m_gamepads[i].update(
                this.m_devices[i]
            );
        }
    }
};


/**
 * Destroy all Gamepad objects.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_disposeGamepads = function() {
    if (Array.isArray(this.m_gamepads)) {
        while (this.m_gamepads.length > 0) {
            this.m_gamepads[0].dispose();
            this.m_gamepads.splice(0, 1);
        }
    }

    this.m_gamepads = null;
};

/**
 * Destroy connection to physical devices.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_disposeDevices = function() {
    this.m_devices = null;
};

/**
 * Resets the state of all Gamepad objects.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_resetGamepads = function() {
    var i = this.m_gamepads.length;
    while (i--) this.m_resetGamepad(this.m_gamepads[i]);
};

/**
 * Resets the state of a Gamepad object.
 *
 * @param {rune.input.Gamepad} gamepad Gamepad to reset.
 *
 * @throws {TypeError} In case of incorrect data type.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_resetGamepad = function(gamepad) {
    if (gamepad instanceof rune.input.Gamepad) {
        gamepad.reset();
    } else throw new TypeError();
};

/**
 * Reads a property of all Gamepad objects.
 *
 * @param {string} prop Property to read.
 *
 * @returns {boolean}
 * @private
 */
rune.input.Gamepads.prototype.m_getPropOfGamepads = function(prop) {
    var i = this.m_gamepads.length;
    while (i--) {
        if (this.m_gamepads[i] != null) {
            if (this.m_gamepads[i][prop] === true) {
                return true;
            };
        };
    };

    return false;
};

/**
 * Callback for when gamepads are connected.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_onDeviceConnected = function() {
    this.m_options.exec("onConnect");
};

/**
 * Callback for when gamepads are disconnected.
 *
 * @returns {undefined}
 * @private
 */
rune.input.Gamepads.prototype.m_onDeviceDisconnected = function() {
    this.m_options.exec("onDisconnect");
};