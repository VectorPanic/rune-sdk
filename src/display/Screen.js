//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Screen instance.
 * 
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {rune.system.Config} options Screen options.
 * 
 * @class
 * @classdesc
 * 
 * The Screen class represents a pixel buffer for what is to be displayed on 
 * the screen. Cameras are mainly rendered to this buffer, but since the screen 
 * is a DisplayObjectContainer, DisplayObjects can also be placed directly on 
 * the screen.
 */
rune.display.Screen = function(options) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Reference to the application configuration file.
     *
     * @type {Object}
     * @private
     */
    this.m_config = options;
    
    /**
     * The developer console.
     *
     * @type {rune.console.ConsoleManager}
     * @private
     */
    this.m_console = null;
    
    /**
     * The debugger.
     *
     * @type {rune.debug.Debugger}
     * @private
     */
    this.m_debugger = null;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend DisplayObjectContainer.
     */
    rune.display.DisplayObjectContainer.call(this, 0, 0, options.screenResolutionX, options.screenResolutionY);
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.display.Screen.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.display.Screen.prototype.constructor = rune.display.Screen;

//------------------------------------------------------------------------------
// Override public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The screen never saves any cache, so this value is always false.
 *
 * @member {boolean} cached
 * @memberof rune.display.Screen
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Screen.prototype, "cached", {
    /**
     * @this rune.display.Screen
     * @suppress {accessControls}
     * @ignore
     */
    get : function() {
        return false;
    }
});

/**
 * The height of the screen, in pixels.
 *
 * @member {number} height
 * @memberof rune.display.Screen
 * @instance
 */
Object.defineProperty(rune.display.Screen.prototype, "height", {
    /**
     * @this rune.display.Screen
     * @suppress {accessControls}
     * @ignore
     */
    get : function() {
        return this.m_canvas['element'].height;
    },
    
    /**
     * @this rune.display.Screen
     * @ignore
     */
    set : function(value) {
        throw new Error("Illegal operation");
    }
});

/**
 * The width of the screen, in pixels.
 *
 * @member {number} width
 * @memberof rune.display.Screen
 * @instance
 */
Object.defineProperty(rune.display.Screen.prototype, "width", {
    /**
     * @this rune.display.Screen
     * @suppress {accessControls}
     * @ignore
     */
    get : function() {
        return this.m_canvas['element'].width;
    },
    
    /**
     * @this rune.display.Screen
     * @ignore
     */
    set : function(value) {
        throw new Error("Illegal operation");
    }
});

/**
 * The x coordinate of the top-left corner of the screen. This value is always 
 * 0.0 and can not be changed.
 *
 * @member {number} x
 * @memberof rune.display.Screen
 * @instance
 */
Object.defineProperty(rune.display.Screen.prototype, "x", {
    /**
     * @this rune.display.Screen
     * @suppress {accessControls}
     * @ignore
     */
    get : function() {
        return this.m_x;
    },
    
    /**
     * @this rune.display.Screen
     * @ignore
     */
    set : function(value) {
        throw new Error("Illegal operation");
    }
});

/**
 * The y coordinate of the top-left corner of the rectangle. This value is 
 * always 0.0 and can not be changed.
 *
 * @member {number} y
 * @memberof rune.display.Screen
 * @instance
 */
Object.defineProperty(rune.display.Screen.prototype, "y", {
    /**
     * @this rune.display.Screen
     * @suppress {accessControls}
     * @ignore
     */
    get : function() {
        return this.m_y;
    },
    
    /**
     * @this rune.display.Screen
     * @ignore
     */
    set : function(value) {
        throw new Error("Illegal operation");
    }
});

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Developer console. Use this to activate shortcuts within the current 
 * application.
 *
 * @member {rune.console.ConsoleManager} console
 * @memberof rune.display.Screen
 * @instance
 * @readonly
 */
Object.defineProperty(rune.display.Screen.prototype, "console", {
    /**
     * @this rune.display.Screen
     * @ignore
     */
    get : function() {
        return this.m_console;
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.Screen.prototype.update = function(step) {
    rune.display.DisplayObjectContainer.prototype.update.call(this, step);
    this.m_updateDebugger(step);
    this.m_updateConsole(step);
};

/**
 * @inheritDoc
 */
rune.display.Screen.prototype.render = function() {
    if (this["visible"] == true) {
        this.m_renderBackgroundColor();
        this.m_renderCameras();
        this.m_renderChildren();
        this.m_renderDebugger();
        this.m_renderConsole();
    }
};

/**
 * @inheritDoc
 */
rune.display.Screen.prototype.dispose = function() {
    this.m_disposeConsole();
    this.m_disposeDebugger();
    rune.display.DisplayObjectContainer.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.display.Screen.prototype.m_construct = function() {
    rune.display.DisplayObjectContainer.prototype.m_construct.call(this);
    this.m_constructScreenMode();
    this.m_constructDebugger();
    this.m_constructConsole();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Configures screen conditions etc.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Screen.prototype.m_constructScreenMode = function() {
    this.m_canvas['element'].style.width  = "100%";
    this.m_canvas['element'].style.height = "100%";
    this.m_canvas['element'].style.backgroundColor = "#000000";
};

/**
 * Creates the object that visualizes debug data.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Screen.prototype.m_constructDebugger = function() {
    this.m_disposeDebugger();
    if (this.m_debugger == null && this.m_config.debug == true) {
        this.m_debugger = new rune.debug.Debugger(this.width, this.height);
        
        if (this.m_debugger.width  >= 1280 && 
            this.m_debugger.height >= 720) {
            this.m_debugger.width  = this.m_debugger.width  >> 1;
            this.m_debugger.height = this.m_debugger.height >> 1;
            this.m_debugger['scaleX'] = 2.0;
            this.m_debugger['scaleY'] = 2.0;
        }
    }
};

/**
 * Creates the developer console.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Screen.prototype.m_constructConsole = function() {
    this.m_disposeConsole();
    if (this.m_console == null) {
        this.m_console = new rune.console.ConsoleManager(
            this['width'], 
            this['height']
        );
    }
};

/**
 * Updating the debugger.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Screen.prototype.m_updateDebugger = function(step) {
    if (this.m_debugger != null) {
        this.m_debugger.update(step);
    }
};

/**
 * Updating the developer console.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Screen.prototype.m_updateConsole = function(step) {
    if (this.m_console != null && this.m_config.debug == true) {
        this.m_console.update(step);
    }
};

/**
 * Renders all cameras to the screen.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Screen.prototype.m_renderCameras = function() {
    var cameras = rune.system.Application['instance']['scenes']['selected']['cameras'].getCameras();
    for (var i = 0; i < cameras.length; i++) {
        this['canvas'].renderDisplayObject(cameras[i]);
    }
};

/**
 * Renders the visualization of debug data.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Screen.prototype.m_renderDebugger = function() {
    if (this.m_debugger != null && this.m_debugger['visible'] == true) {
        this.m_canvas.renderDisplayObject(this.m_debugger);
    }
};

/**
 * Renders the developer console to the screen.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Screen.prototype.m_renderConsole = function() {
    if (this.m_console != null && this.m_console['visible'] == true && this.m_config.debug == true) {
        this.m_canvas.renderDisplayObject(this.m_console);
    }
};

/**
 * Removes the developer console.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Screen.prototype.m_disposeConsole = function() {
    if (this.m_console instanceof rune.console.ConsoleManager) {
        this.m_console.dispose();
        this.m_console = null;
    }
};

/**
 * Removes the debugger.
 *
 * @returns {undefined}
 * @private
 */
rune.display.Screen.prototype.m_disposeDebugger = function() {
    if (this.m_debugger != null) {
        this.m_debugger.dispose();
        this.m_debugger = null;
    }
};