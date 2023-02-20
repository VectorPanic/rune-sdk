//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new "blank" scene.
 * 
 * @constructor
 * @param {string} [name] The scene name.
 * 
 * @class
 * @classdesc
 * 
 * Represents a scene within the current application. A scene is a combination 
 * of visual (and logical) objects that are updated and rendered within a 
 * controlled scope of an application. An application usually consists of 
 * several scenes; one for menu system, one for gameplay, etc..
 */
rune.scene.Scene = function(name) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Determines whether the current scene should be updated even if it is not 
     * selected. Usually, the update loop is disabled for scenes that are 
     * disabled, ie. are not selected.
     *
     * @type {boolean}
     * @default false
     */
    this.persistent = false;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * The camera system connected to this Scene.
     *
     * @type {rune.camera.Cameras}
     * @protected
     * @ignore
     */
    this.m_cameras = null;
    
    /**
     * Group manager if the scene objects need to be divided into 
     * groups.
     *
     * @type {rune.display.DisplayGroups}
     * @protected
     * @ignore
     */
    this.m_groups = null;
    
    /**
     * Name of current scene. This string can be used to easily find a 
     * specific scene in a batch of scenes.
     *
     * @type {string}
     * @protected
     * @ignore
     */
    this.m_name = name || "";
    
    /**
     * Represents the main drawing area.
     *
     * @type {rune.display.Stage}
     * @protected
     * @ignore
     */
    this.m_stage = null;
    
    /**
     * A finite-state machine.
     *
     * @type {rune.state.States}
     * @protected
     * @ignore
     */
    this.m_states = null;
    
    /**
     * Timer manager that can be used to create Timer objects for the purpose 
     * of counting down time.
     *
     * @type {rune.timer.Timers}
     * @protected
     * @ignore
     */
    this.m_timers = null;
    
    /**
     * The scene's own subsystem to handle interpolation.
     *
     * @type {rune.tween.Tweens}
     * @private
     */
    this.m_tweens = null;
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    /**
     * Call for dedicated constructor method.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the application's entry point class, ie. the main class of the 
 * application. Useful for accessing the application's subsystem.
 *
 * @member {rune.system.Main} application
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "application", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return rune.system.Application['instance'];
    }
});

/**
 * The camera system connected to this Scene.
 *
 * @member {rune.camera.Cameras} cameras
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "cameras", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this.m_cameras;
    }
});

/**
 * Reference to the developer console. This can be used during the development 
 * stage to execute tests and debugging commands during runtime.
 *
 * @member {rune.console.ConsoleManager} console
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "console", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this['application']['screen']['console'];
    }
});

/**
 * Reference to the application's subsystem for connected gamepad devices.
 *
 * @member {rune.input.Gamepads} gamepads
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "gamepads", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return rune.system.Application["instance"]['inputs']['gamepads'];
    }
});

/**
 * Reference to the scene's built-in group manager. Useful when objects that 
 * appear within the scene need to be divided into groups.
 *
 * @member {rune.display.DisplayGroups} groups
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "groups", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this.m_groups;
    }
});

/**
 * Reference to the keyboard manager. Use this reference to read the state of 
 * any keyboard key.
 *
 * @member {rune.input.Keyboard} keyboard
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "keyboard", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return rune.system.Application["instance"]['inputs']['keyboard'];
    }
});

/**
 * Name of current scene. This string can be used to easily find a 
 * specific scene in a batch of scenes.
 *
 * @member {string} name
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "name", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this.m_name;
    }
});

/**
 * Represents the main drawing area. Display objects added to the Stage are 
 * rendered by the camera system.
 *
 * @member {rune.display.Stage} stage
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "stage", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this.m_stage;
    }
});

/**
 * A finite-state machine.
 *
 * @member {rune.state.States} states
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "states", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this.m_states;
    }
});

/**
 * Timer manager that can be used to create Timer objects for the purpose 
 * of counting down time. Useful if you want to add or remove an object after n 
 * seconds.
 *
 * @member {rune.timer.Timers} timers
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "timers", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this.m_timers;
    }
});

/**
 * Subsystem for handling interpolation within the current scene.
 *
 * @member {rune.tween.Tweens} tweens
 * @memberof rune.scene.Scene
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scene.prototype, "tweens", {
    /**
     * @this rune.scene.Scene
     * @ignore
     */
    get : function() {
        return this.m_tweens;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * This method is automatically activated by the scene manager (Scenes) when 
 * the current scene is deactivated.
 *
 * @param {rune.scene.Scene} scene Reference to the scene object that replaces the existing scene.
 *
 * @returns {undefined}
 */
rune.scene.Scene.prototype.onDeselect = function(scene) {
    // NOTHING, AS DEFAULT.
};

/**
 * This method is activated automatically by the scene manager (Scenes) when 
 * the current object is activated, ie. is selected.
 *
 * @param {rune.scene.Scene} scene Reference to the previous scene object.
 *
 * @returns {undefined}
 */
rune.scene.Scene.prototype.onSelect = function(scene) {
    // NOTHING, AS DEFAULT.
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * This method is automatically activated by the scene manager (Scenes) as 
 * soon as the current scene is initiated by the game engine. Use this method 
 * to populate the current scene.
 *
 * @returns {undefined}
 */
rune.scene.Scene.prototype.init = function() {
    this.m_initCamera();
};

/**
 * This method is automatically activated by the scene manager for each tick 
 * within the application. Apply scene logic to this method.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
rune.scene.Scene.prototype.update = function(step) {
    this.m_updateStage(step);
    this.m_updateCameras(step);
    this.m_updateTimers(step);
    this.m_updateTweens(step);
    this.m_updateGroups(step);
    this.m_updateStates(step);
};

/**
 * Goes through the content of the scene and renders graphics.
 *
 * @returns {undefined}
 */
rune.scene.Scene.prototype.render = function() {
    this.m_renderStates();
};

/**
 * This method is activated automatically by the scene manager (Scenes) when 
 * the current scene ends, ie. is removed and deallocated.
 *
 * @returns {undefined}
 */
rune.scene.Scene.prototype.dispose = function() {
    this.m_disposeStates();
    this.m_disposeGroups();
    this.m_disposeTweens();
    this.m_disposeTimers();
    this.m_disposeCameras();
    this.m_disposeStage();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Method that represents the class constructor.
 * 
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_construct = function() {
    this.m_constructStage();
    this.m_constructCameras();
    this.m_constructTimers();
    this.m_constructTweens();
    this.m_constructGroups();
    this.m_constructStates();
};

/**
 * Creates the stage.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_constructStage = function() {
    this.m_disposeStage();
    if (this.m_stage == null) {
        this.m_stage = new rune.display.Stage();
        this.m_stage['backgroundColor'] = "#000000";
    } else throw new Error();
};

/**
 * Creates and activates the camera system.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scene.prototype.m_constructCameras = function() {
    this.m_disposeCameras();
    if (this.m_cameras == null && this.m_stage != null) {
        this.m_cameras = new rune.camera.Cameras(this.m_stage);
    } else throw new Error();
};

/**
 * Creates the subsystem for timers.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scene.prototype.m_constructTimers = function() {
    this.m_disposeTimers();
    if (this.m_timers == null) {
        this.m_timers = new rune.timer.Timers(this);
    } else throw new Error();
};

/**
 * Creates the subsystem for interpolation.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_constructTweens = function() {
    this.m_disposeTweens();
    if (this.m_tweens == null) {
        this.m_tweens = new rune.tween.Tweens();
    } else throw new Error();
};

/**
 * Creates the group manager of the scene.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_constructGroups = function() {
    this.m_disposeGroups();
    if (this.m_groups == null) {
        this.m_groups = new rune.display.DisplayGroups();
    } else throw new Error();
};

/**
 * Creates the scene's finite-state machine.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_constructStates = function() {
    this.m_disposeStates();
    if (this.m_states == null) {
        this.m_states = new rune.state.States(this);
    } else throw new Error();
};

/**
 * Creates a camera object with the same resolution as the application. 
 * Override this method if, for example, multiple camera objects are to be 
 * created.
 *
 * @returns {undefined}
 * @protected
 */
rune.scene.Scene.prototype.m_initCamera = function() {
    if (this.m_cameras != null) {
        this.m_cameras.addCamera(this.m_cameras.createCamera());
    }
};

/**
 * Updates all stage objects.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_updateStage = function(step) {
    if (this.m_stage != null) {
        this.m_stage.update(step);
    }
};

/**
 * Updates all camera objects.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_updateCameras = function(step) {
    if (this.m_cameras != null) {
        this.m_cameras.update(step);
        //@note: Should cameras be affected by the scene's time scale?
        //@note: Maybe a flag in the Cameras object that indicates whether scale should be used?
    }
};

/**
 * Updates all timers.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_updateTimers = function(step) {
    if (this.m_timers != null) {
        this.m_timers.update(step * this.m_stage.timeScale);
    }
};

/**
 * Updates the interpolation subsystem.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_updateTweens = function(step) {
    if (this.m_tweens != null) {
        this.m_tweens.update(step * this.m_stage.timeScale);
    }
};

/**
 * Updating groups.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_updateGroups = function(step) {
    if (this.m_groups != null) {
        this.m_groups.update(step * this.m_stage.timeScale);
    }
};

/**
 * Updates the scene's finite-state machine.
 *
 * @param {number} step The current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_updateStates = function(step) {
    if (this.m_states != null) {
        this.m_states.update(step * this.m_stage.timeScale);
    }
};

/**
 * Executes rendering code in current state.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_renderStates = function() {
    if (this.m_states != null) {
        this.m_states.render();
    }
};

/**
 * Removes the scene's finite-state machine.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_disposeStates = function() {
    if (this.m_states instanceof rune.state.States) {
        this.m_states.dispose();
        this.m_states = null;
    }
};

/**
 * Removes all groups.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_disposeGroups = function() {
    if (this.m_groups instanceof rune.display.DisplayGroups) {
        this.m_groups.dispose();
        this.m_groups = null;
    }
};

/**
 * Removes the interpolation subsystem.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_disposeTweens = function() {
    if (this.m_tweens instanceof rune.tween.Tweens) {
        this.m_tweens.dispose();
        this.m_tweens = null;
    }
};

/**
 * Removes the timers subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scene.prototype.m_disposeTimers = function() {
    if (this.m_timers instanceof rune.timer.Timers) {
        this.m_timers.dispose();
        this.m_timers = null;
    }
};

/**
 * Removes the camera system.
 *
 * @throws {TypeError} If the reference to the camera system is invalid.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scene.prototype.m_disposeCameras = function() {
    if (this.m_cameras instanceof rune.camera.Cameras) {
        this.m_cameras.dispose();
        this.m_cameras = null;
    }
};

/**
 * Removes the stage.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.scene.Scene.prototype.m_disposeStage = function() {
    if (this.m_stage != null) {
        this.m_stage.dispose();
        this.m_stage = null;
    }
};