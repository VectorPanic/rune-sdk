//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new application instance.
 *
 * @constructor
 *
 * @param {Object} [options=null] Application settings.
 * 
 * @class
 * @classdesc
 * 
 * The application class represents the core of a Rune-based application. All 
 * subsystems and processes are derived from this class. Rune-based 
 * applications must thus inherit from this class in order to be executed.
 */
rune.system.Application = function(options) {
    
    //--------------------------------------------------------------------------
    // Private prototype properties
    //--------------------------------------------------------------------------
    
    /**
     * Configuration settings used at startup.
     *
     * @type {rune.system.Config}
     * @private
     */
    this.m_config = new rune.system.Config(options);
    
    /**
     * Reference to the local highscore handler.
     *
     * @type {rune.data.Highscores}
     * @private
     */
    this.m_highscores = null;
    
    /**
     * The subsystem that handles input devices.
     *
     * @type {rune.input.Inputs}
     * @private
     */
    this.m_inputs = null;
    
    /**
     * Represents the resource library.
     *
     * @type {rune.resource.Resources}
     * @private
     */
    this.m_resources = null;
    
    /**
     * Reference to the subsystem that handles scenes within the application.
     *
     * @type {rune.scene.Scenes}
     * @private
     */
    this.m_scenes = null;
    
    /**
     * Represents the application screen, ie. the rectangular surface where 
     * graphics are drawn.
     *
     * @type {rune.display.Screen}
     * @private
     */
    this.m_screen = null;
    
    /**
     * Reference to the subsystem that handles audio and music.
     *
     * @type {rune.media.Sounds}
     * @private
     */
    this.m_sounds = null;
    
    /**
     * Reference to the subsystem that calculates time within the current 
     * application.
     *
     * @type {rune.system.Time}
     * @private
     */
    this.m_time = null;
	
    /**
     * The start and stop process uses timeout in order to move the execution 
     * process to the end of the event loop. This property contains the current 
     * timeout ID for this process.
     *
     * @type {number}
     * @private
     */
    this.m_timeoutID = 0;
};

//------------------------------------------------------------------------------
// Private static properties
//------------------------------------------------------------------------------

/**
 * Reference to the current application executed by the engine.
 *
 * @type {rune.system.Application}
 * @private
 */
rune.system.Application.m_instance = null;

//------------------------------------------------------------------------------
// Public static getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the current application executed by the engine. This is mainly 
 * for internal use.
 *
 * @member {rune.system.Application} instance
 * @memberof rune.system.Application
 * @readonly
 */
Object.defineProperty(rune.system.Application, "instance", {
    /**
     * @ignore
     */
    get : function() {
        return rune.system.Application.m_instance;
    }
});

/**
 * RID (short for Rune-ID) is a version number that represents the most 
 * recent compilation of the source code. A change to the RID does not 
 * necessarily mean a change to the codebase, merely that the code has been 
 * compiled into a new distribution version. Note that this constant only 
 * returns a RID number when a compiled version of the code base is executed, 
 * when executing from source code, "%RID%" is returned.
 *
 * @member {rune.system.Application} RID
 * @memberof rune.system.Application
 * @readonly
 * @const
 */
Object.defineProperty(rune.system.Application, "RID", {
    /**
     * @ignore
     */
    get : function() {
        return "%RID%";
    }
});

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * A hash string that uniquely identifies the current version of the 
 * application.
 *
 * @member {string} hash
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "hash", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return btoa(
            this['id'] + " - " + this.m_config.build
        );
    }
});

/**
 * This refers to the native height of the application, measured in pixels.
 *
 * @member {number} height
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "height", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_config.screenResolutionY;
    }
});

/**
 * Used to save local highscores.
 *
 * @member {rune.data.Highscores} highscores
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "highscores", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_highscores;
    }
});

/**
 * A string (according to the reverse domain name system) that uniquely 
 * identifies the application project. Example: "com.vectorpanic.demo".
 *
 * @member {string} id
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "id", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_config.developer + "." + this.m_config.app;
    }
});

/**
 * The subsystem that handles input devices, such as keyboards, gamepads, etc..
 *
 * @member {rune.input.Inputs} inputs
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "inputs", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_inputs;
    }
});

/**
 * The application's resource library, ie. the location where all loaded 
 * resource files are stored and made available for use within the application.
 *
 * @member {rune.resource.Resources} resources
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "resources", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_resources;
    }
});

/**
 * Reference to the subsystem that handles scenes within the application.
 *
 * @member {rune.scene.Scenes} scenens
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "scenes", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_scenes;
    }
});

/**
 * Represents the application screen, ie. the rectangular surface where 
 * graphics are drawn.
 *
 * @member {rune.display.Screen} screen
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "screen", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_screen;
    }
});

/**
 * Sounds is a reference to the application's sound system. Use this reference 
 * to handle sounds within the current application.
 *
 * @member {rune.media.Sounds} sounds
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "sounds", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_sounds;
    }
});

/**
 * Reference to the subsystem that calculates time within the current 
 * application.
 *
 * @member {rune.system.Time} time
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "time", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_time;
    }
});

/**
 * This refers to the native width of the application, measured in pixels.
 *
 * @member {number} width
 * @memberof rune.system.Application
 * @instance
 * @readonly
 */
Object.defineProperty(rune.system.Application.prototype, "width", {
    /**
     * @this rune.system.Application
     * @ignore
     */
    get : function() {
        return this.m_config.screenResolutionX;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Starts the current application.
 *
 * @param {Function} [callback=null] Refers to a function object that is executed as soon as the start process is completed. The function is thus executed when the application is fully functional.
 *
 * @return {undefined}
 */
rune.system.Application.prototype.start = function(callback) {
    var m_this = this;
    if (document.readyState === "complete") {
        window.clearTimeout(this.m_timeoutID);
        this.m_timeoutID = window.setTimeout(function() {
            m_this.m_preInit();
            if (typeof callback === "function") {
                callback.call(m_this);
            }
        }, 0);
    } else {
        window.addEventListener(
            "load",
            function(event) {
                m_this.start(callback);
            },
            {
                once: true
            }
        );
    }
};

/**
 * Stops the current application.
 *
 * @param {Function} [callback=null] Refers to a function object that is executed after the application is terminated.
 *
 * @return {undefined}
 */
rune.system.Application.prototype.stop = function(callback) {
    var m_this = this;
    if (document.readyState === "complete") {
        window.clearTimeout(this.m_timeoutID);
        this.m_timeoutID = window.setTimeout(function() {
            m_this.m_dispose();
            if (typeof callback === "function") {
                callback.call(m_this);
            }
        }, 0);
    } else {
        window.addEventListener(
            "load",
            function(event) {
                m_this.stop(callback);
            },
            {
                once: true
            }
        );
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Activates processes that must be completed before the application can be 
 * started.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_preInit = function() {
    this.m_preInitConfig();
    this.m_preInitResources();
};

/**
 * Ensures that the configuration file is valid.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_preInitConfig = function() {
    var cfg = this.m_config;
    var dID = /^([a-z]{2,3}).[a-z0-9-]{1,50}$/;
    var aID = /^[a-zA-Z0-9-_]*$/;
    var bID = /^[0-9].[0-9].[0-9]$/;
    
    if (!dID.test(cfg.developer)) {
        throw new Error('Invalid developer-ID.');
    }
    
    if (!aID.test(cfg.app)) {
        throw new Error('Invalid app-ID.');
    }
    
    if (!bID.test(cfg.build)) {
        throw new Error('Invalid build-ID.');
    }
};

/**
 * Loading resource files used by Rune.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_preInitResources = function() {
    this.m_disposeResources();
    if (this.m_resources == null) {
        this.m_resources = new rune.resource.Resources();
        this.m_resources.request({
            batch: new rune.data.Requests(),
            onComplete: function() {
                this.m_init();
            },
            scope: this
        });
    }
};

/**
 * Activates the initialization process of the application, ie. starts the 
 * subsystems on which the application is based.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_init = function() {
    this.m_initInstance();
    this.m_initHighscores();
    this.m_initSounds();
    this.m_initInputs();
    this.m_initScreen();
    this.m_initTime();
    this.m_initScenes();
    this.m_initCommands();
};

/**
 * Creates a static reference to the current application.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_initInstance = function() {
    this.m_disposeInstance();
    if (rune.system.Application.m_instance == null) {
        rune.system.Application.m_instance  = this;
    } else throw new Error();
};

/**
 * Initializes the local highscore system.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_initHighscores = function() {
    this.m_disposeHighscores();
    if (this.m_highscores == null) {
        this.m_highscores  = new rune.data.Highscores(
            this['id'],
            this.m_config.numHighscores,
            this.m_config.numHighscoreTables
        );
    } else throw new Error();
};

/**
 * Creates the audio subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.system.Application.prototype.m_initSounds = function() {
    this.m_disposeSounds();
    if (this.m_sounds == null) {
        this.m_sounds = new rune.media.Sounds();
    } else throw new Error();
};

/**
 * Creates the subsystem that handles input devices.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_initInputs = function() {
    this.m_disposeInputs();
    if (this.m_inputs == null) {
        this.m_inputs = new rune.input.Inputs(this.m_config);
    } else throw new Error();
};

/**
 * Creates the system that represents the screen.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_initScreen = function() {
    this.m_disposeScreen();
    if (this.m_screen == null) {
        this.m_screen = new rune.display.Screen(this.m_config);
        this.m_screen["canvas"].attach(document.body); //@todo: make configurable via Config.
    } else throw new Error();
};

/**
 * Activates the subsystem that calculates time within the application.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_initTime = function() {
    this.m_disposeTime();
    if (this.m_time == null) {
        this.m_time = new rune.system.Time(this.m_config.framerate);
        this.m_time['update'].add(this.m_update, this);
        this.m_time['render'].add(this.m_render, this);
        this.m_time.start();
    } else throw new Error();
};

/**
 * Creates the subsystem that handles scenes.
 *
 * @throws {Error} If an object reference already exists.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_initScenes = function() {
    this.m_disposeScenes();
    if (this.m_scenes == null) {
        this.m_scenes = new rune.scene.Scenes();
        this.m_scenes.load(this.m_config.debug ? 
            [new rune.data.LoaderDebug(this.m_config)] :
            [new this.m_config.loader(this.m_config)]
        );
    } else throw new Error();
};

/**
 * Adds standard commands to Rune's debug console.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_initCommands = function() {
    this.m_screen['console']['commands'].create("rid", function() {
        return rune.system.Application['RID']
    }, this);
    
    this.m_screen['console']['commands'].create("hsc", function() {
        this.m_highscores.clear();
        return "Done.";
    }, this);
    
    this.m_screen['console']['commands'].create("hss", function(score, name, table) {
        return this.m_highscores.send(
            score,
            name,
            table
        );
    }, this);
};

/**
 * Updates the application, including all subsystems.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_update = function(step) {
    this.m_updateInputs(step);
    this.m_updateScenes(step);
    this.m_updateScreen(step);
    this.m_updateSounds(step);
};

/**
 * Updates the subsystem that handles input devices.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_updateInputs = function(step) {
    if (this.m_inputs!= null) {
        this.m_inputs.update(step);
    }
};

/**
 * Updates the scene system.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_updateScenes = function(step) {
    if (this.m_scenes != null) {
        this.m_scenes.update(step);
    }
};

/**
 * Updates the screen object.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_updateScreen = function(step) {
    if (this.m_screen != null) {
        this.m_screen.update(step);
    }
};

/**
 * Updates the sound system.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_updateSounds = function(step) {
    if (this.m_sounds != null) {
        this.m_sounds.update(step);
    }
};

/**
 * Renders graphics to the screen.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_render = function() {
    this.m_renderScenes();
    this.m_renderScreen();
};

/**
 * Renders objects in the selected scene.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_renderScenes = function() {
    if (this.m_scenes!= null) {
        this.m_scenes.render();
    }
};

/**
 * Renders objects on the screen.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_renderScreen = function() {
    if (this.m_screen!= null && this.m_screen['visible']) {
        this.m_screen.render();
    }
};

/**
 * Process that shuts down the application and frees up allocated memory.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_dispose = function() {
    this.m_disposeScenes();
    this.m_disposeTime();
    this.m_disposeScreen();
    this.m_disposeInputs();
    this.m_disposeSounds();
    this.m_disposeHighscores();
    this.m_disposeInstance();
    this.m_disposeResources();
};

/**
 * Removes the subsystem that handles scenes.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeScenes = function() {
    if (this.m_scenes instanceof rune.scene.Scenes) {
        this.m_scenes.dispose();
        this.m_scenes = null;
    }
};

/**
 * Removes the subsystem that calculates time.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeTime = function() {
    if (this.m_time instanceof rune.system.Time) {
        this.m_time.dispose();
        this.m_time = null;
    }
};

/**
 * Removes the system responsible for rendering graphics to the canvas element 
 * that represents the screen.
 *
 * @throws {TypeError} If the reference to the screen system is invalid.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeScreen = function() {
    if (this.m_screen instanceof rune.display.Screen) {
        this.m_screen.dispose();
        this.m_screen = null;
    }
};

/**
 * Removes the subsystem that handles input devices.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeInputs = function() {
    if (this.m_inputs instanceof rune.input.Inputs) {
        this.m_inputs.dispose();
        this.m_inputs = null;
    }
};

/**
 * Removes the sound system.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeSounds = function() {
    if (this.m_sounds instanceof rune.media.Sounds) {
        this.m_sounds.dispose();
        this.m_sounds = null;
    }
};

/**
 * Removes the local highscore system.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeHighscores = function() {
    if (this.m_highscores instanceof rune.data.Highscores) {
        this.m_highscores.dispose();
        this.m_highscores = null;
    }
};

/**
 * Removes the static reference to the current application.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeInstance = function() {
    if (rune.system.Application.m_instance instanceof rune.system.Application) {
        rune.system.Application.m_instance = null;
    }
};

/**
 * Removes the resource library.
 *
 * @return {undefined}
 * @private
 */
rune.system.Application.prototype.m_disposeResources = function() {
    if (this.m_resources instanceof rune.resource.Resources) {
        this.m_resources.dispose();
        this.m_resources = null;
    }
};