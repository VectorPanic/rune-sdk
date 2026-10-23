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
    
    /**
     * Screenshot request waiting for the next visible render, or null.
     *
     * @type {Object}
     * @private
     */
    this.m_screenshot = null;

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
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Downloads the next rendered screen as a PNG at its internal resolution,
 * independent of CSS scaling. Includes cameras and screen children such as
 * HUD elements. Debugger and console are excluded unless includeDebug is true.
 * The request waits while the screen is invisible. If requested more than once
 * before rendering, the latest filename and debug option replace the previous
 * request. At most one screenshot is captured per render.
 *
 * Encoding and downloading use the browser's asynchronous canvas export. The
 * browser controls the save location and may request permission to download.
 * Export/download errors are reported to the console without stopping the game.
 * The pending request is discarded if the screen is disposed before rendering.
 *
 * @param {string} [filename="screenshot.png"] Download filename; .png is appended if missing.
 * @param {boolean} [includeDebug=false] Whether to include debugger and console.
 *
 * @return {undefined}
 * @throws {TypeError} If filename is not a nonempty string.
 * @throws {Error} If the screen has been disposed.
 */
rune.display.Screen.prototype.screenshot = function(filename, includeDebug) {
    if (this.m_canvas == null) throw new Error("Screen is disposed.");
    filename = filename === undefined ? "screenshot.png" : filename;
    if (typeof filename !== "string" || !/\S/.test(filename)) throw new TypeError("Invalid screenshot filename.");
    if (!/\.png$/i.test(filename)) filename += ".png";
    this.m_screenshot = {filename: filename, includeDebug: includeDebug === true};
};

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
        var screenshot = this.m_screenshot;
        this.m_screenshot = null;
        var transitions = rune.system.Application['instance']['transitions'];
        
        if (transitions == null || transitions.render(this.m_canvas) === false) {
            this.renderContent();
        }
        
        if (screenshot != null && screenshot['includeDebug'] === false) {
            this.m_captureScreenshot(screenshot['filename']);
        }
        
        this.m_renderDebugger();
        this.m_renderConsole();
        
        if (screenshot != null && screenshot['includeDebug'] === true) {
            this.m_captureScreenshot(screenshot['filename']);
        }
    }
};

/**
 * Renders clean application content before screenshots and debug overlays.
 * Used by frozen-image transitions when capturing a scene.
 *
 * @return {undefined}
 * @ignore
 */
rune.display.Screen.prototype.renderContent = function() {
    this.m_renderBackgroundColor();
    if (rune.system.Application['instance']['scenes']['selected'] != null) {
        this.m_renderCameras();
    }
    
    this.m_renderChildren();
};

/**
 * @inheritDoc
 */
rune.display.Screen.prototype.dispose = function() {
    this.m_screenshot = null;
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
 * Encodes a snapshot and starts its download. Override to provide a different
 * export destination. toBlob() snapshots the bitmap before asynchronous
 * encoding, so debug overlays drawn afterwards do not affect a clean capture.
 * Browser security failures do not interrupt rendering.
 *
 * @param {string} filename PNG download filename.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.display.Screen.prototype.m_captureScreenshot = function(filename) {
    try {
        this.m_canvas['element'].toBlob(function(blob) {
            if (blob == null) {
                console.error("Unable to encode screenshot.");
                return;
            }
            var url = null;
            var link = null;
            try {
                url = URL.createObjectURL(blob);
                link = document.createElement("a");
                link.download = filename;
                link.href = url;
                link.style.display = "none";
                document.body.appendChild(link);
                link.click();
            } catch (error) {
                console.error("Unable to download screenshot.", error);
            } finally {
                if (link != null && link.parentNode != null) link.parentNode.removeChild(link);
                if (url != null) {
                    // Let the browser consume the download before releasing its URL.
                    var downloadURL = /** @type {string} */ (url);
                    window.setTimeout(function() { URL.revokeObjectURL(downloadURL); }, 1000);
                }
            }
        }, "image/png");
    } catch (error) {
        console.error("Unable to capture screenshot.", error);
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