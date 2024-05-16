//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Cameras instance.
 * 
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {number} x Current x position for the camera object.
 * @param {number} y Current y position for the camera object.
 * @param {number} width The width of the camera. 
 * @param {number} height The height of the camera.
 * 
 * @class
 * @classdesc
 * 
 * The camera class is used to render display objects that have been added to 
 * the current stage and that are made visible within the camera's viewport.
 */
rune.camera.Camera = function(x, y, width, height) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Limits the position of the camera to a rectangular surface defined by a 
     * Rectangle object.
     *
     * @type {rune.geom.Rectangle}
     * @default null
     */
    this.bounderies = null;
    
    //--------------------------------------------------------------------------
    // Internal properties
    //--------------------------------------------------------------------------
    
    /**
     * Camera input, i.e. a stage.
     *
     * @type {rune.display.Stage}
     * @package
     * @ignore
     */
    this.input = null;
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Subsystem for fading the camera in and out.
     *
     * @type {rune.camera.CameraFade}
     * @protected
     * @ignore
     */
    this.m_fade = null;
    
    /**
     * Camera flash effect manager.
     *
     * @type {rune.camera.CameraFlash}
     * @protected
     * @ignore
     */
    this.m_flash = null;
    
    /**
     * Dictates how much the camera should lag behind when following objects. 
     * The default value is 0.125 in both the x and y axes.
     *
     * @type {rune.geom.Point}
     * @protected
     * @ignore
     */
    this.m_lag = new rune.geom.Point(0.125, 0.125);
    
    /**
     * Subsystem that handles shake effects on the camera.
     *
     * @type {rune.camera.CameraShake}
     * @protected
     * @ignore
     */
    this.m_shake = null;
    
    /**
     * Registers objects that the camera should follow.
     *
     * @type {rune.camera.CameraTargets}
     * @protected
     * @ignore
     */
    this.m_targets = null;
    
    /**
     * Used to apply a color tint to the current camera instance.
     *
     * @type {rune.camera.CameraTint}
     * @protected
     * @ignore
     */
    this.m_tint = null;
    
    /**
     * The camera viewport.
     *
     * @type {rune.camera.CameraViewport}
     * @protected
     * @ignore
     */
    this.m_viewport = null;
    
    /**
     * The camera's viewport including any offset in the form of camera 
     * shake effect.
     *
     * @type {rune.geom.Rectangle}
     * @protected
     * @ignore
     */
    this.m_viewportOffset = null;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend DisplayObjectContainer.
     */
    rune.display.DisplayObjectContainer.call(this, x, y, width, height);
}

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.camera.Camera.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.camera.Camera.prototype.constructor = rune.camera.Camera;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Subsystem for fading the camera in and out.
 *
 * @member {rune.camera.CameraFade} fade
 * @memberof rune.camera.Camera
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Camera.prototype, "fade", {
    /**
     * @this rune.camera.Camera
     * @ignore
     */
    get : function() {
        return this.m_fade;
    }
});

/**
 * Subsystems used to create flash effects.
 *
 * @member {rune.camera.CameraFlash} fade
 * @memberof rune.camera.Camera
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Camera.prototype, "flash", {
    /**
     * @this rune.camera.Camera
     * @ignore
     */
    get : function() {
        return this.m_flash;
    }
});

/**
 * Dictates how much the camera should lag behind when following objects. The 
 * lag is used to smooth out camera movements. The default value is 0.125 in 
 * both the x and y axes.
 *
 * @member {rune.geom.Point} lag
 * @memberof rune.camera.Camera
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Camera.prototype, "lag", {
    /**
     * @this rune.camera.Camera
     * @ignore
     */
    get : function() {
        return this.m_lag;
    }
});

/**
 * Subsystem that handles shake effects on the camera.
 *
 * @member {rune.camera.CameraShake} shake
 * @memberof rune.camera.Camera
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Camera.prototype, "shake", {
    /**
     * @this rune.camera.Camera
     * @ignore
     */
    get : function() {
        return this.m_shake;
    }
});

/**
 * Keeps track of whether the camera should follow one or more display objects.
 *
 * @member {rune.camera.CameraTint} targets
 * @memberof rune.camera.Camera
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Camera.prototype, "targets", {
    /**
     * @this rune.camera.Camera
     * @ignore
     */
    get : function() {
        return this.m_targets;
    }
});

/**
 * Used to apply a color tint to the current camera instance.
 *
 * @member {rune.camera.CameraTint} tint
 * @memberof rune.camera.Camera
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Camera.prototype, "tint", {
    /**
     * @this rune.camera.Camera
     * @ignore
     */
    get : function() {
        return this.m_tint;
    }
});

/**
 * Represents the camera's field of view. Display objects located inside the 
 * camera's viewport are rendered to the camera's pixel buffer.
 *
 * @member {rune.camera.CameraViewport} viewport
 * @memberof rune.camera.Camera
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Camera.prototype, "viewport", {
    /**
     * @this rune.camera.Camera
     * @ignore
     */
    get : function() {
        return this.m_viewport;
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.camera.Camera.prototype.update = function(step) {
    rune.display.DisplayObjectContainer.prototype.update.call(this, step);
    this.m_updateShake(step);
    this.m_updateFlash(step);
    this.m_updateFade(step);
    this.m_updateTargets(step);
    this.m_updateBoundaries(step);
};

/**
 * @inheritDoc
 */
rune.camera.Camera.prototype.render = function() {
    //@note: Never perform cache checking, cameras do not use cache.
    //@note: Always use custom render flow.
    this.m_renderBackgroundColor();
    this.m_renderMapBackBuffer();
    this.m_renderInput();
    this.m_renderMapFrontBuffer();
    this.m_renderChildren();
    this.m_renderGraphics();
    this.m_renderTint();
    this.m_renderFlash();
    this.m_renderFade();
};

/**
 * @inheritDoc
 */
rune.camera.Camera.prototype.dispose = function() {
    this.m_disposeTargets();
    this.m_disposeFade();
    this.m_disposeFlash();
    this.m_disposeTint();
    this.m_disposeShake();
    this.m_disposeViewport();
    rune.display.DisplayObjectContainer.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override internal prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.camera.Camera.prototype.getRenderFrame = function() {
    this.m_frame['x'] = this['x'];
    this.m_frame['y'] = this['y'];
    this.m_frame['width']  = this['width'];
    this.m_frame['height'] = this['height'];
    this.m_frame['clipping']['x'] = 0;
    this.m_frame['clipping']['y'] = 0;
    this.m_frame['clipping']['width']  = this.m_viewport['width'];
    this.m_frame['clipping']['height'] = this.m_viewport['height'];
    
    return this.m_frame;
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.camera.Camera.prototype.m_construct = function() {
    rune.display.DisplayObjectContainer.prototype.m_construct.call(this);
    this.m_constructViewport();
    this.m_constructShake();
    this.m_constructTint();
    this.m_constructFlash();
    this.m_constructFade();
    this.m_constructTargets();
};

/**
 * Fills the object's canvas with the background color of the current 
 * Stage object.
 *
 * @return {undefined}
 * @ignore
 */
rune.camera.Camera.prototype.m_renderBackgroundColor = function() {
    if (this.m_canvas != null && this.input != null) {
        if (this.input.m_backgroundColor != "") this.m_canvas.drawFill(this.input.m_backgroundColor);
        else this.m_canvas.clear();
    }
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the camera's viewport object.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_constructViewport = function() {
    this.m_disposeViewport();
    if (this.m_viewport == null) {
        this.m_viewport = new rune.camera.CameraViewport(this);
        this.m_viewportOffset = new rune.geom.Rectangle();
    } else throw new Error();
};

/**
 * Creates the subsystem for shake effects.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_constructShake = function() {
    this.m_disposeShake();
    if (this.m_shake == null) {
        this.m_shake = new rune.camera.CameraShake();
    } else throw new Error();
};

/**
 * Creates the subsystem to apply color tint to the camera.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_constructTint = function() {
    this.m_disposeTint();
    if (this.m_tint == null) {
        this.m_tint = new rune.camera.CameraTint();
    } else throw new Error();
};

/**
 * Creates the subsystem used to create flash effects.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_constructFlash = function() {
    this.m_disposeFlash();
    if (this.m_flash == null) {
        this.m_flash = new rune.camera.CameraFlash();
        this.m_flash['color'].setRGB(255, 255, 255);
    } else throw new Error();
};

/**
 * Creates the subsystem used to create fade effects.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_constructFade = function() {
    this.m_disposeFade();
    if (this.m_fade == null) {
        this.m_fade = new rune.camera.CameraFade();
    } else throw new Error();
};

/**
 * Creates the subsystem used to track display objects.
 *
 * @returns {undefined}
 * @private
 */
rune.camera.Camera.prototype.m_constructTargets = function() {
    this.m_disposeTargets();
    if (this.m_targets == null) {
        this.m_targets = new rune.camera.CameraTargets();
    }
};

/**
 * Updates the shake effects subsystem.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_updateShake = function(step) {
    if (this.m_shake != null) {
        this.m_shake.update(step);
        
        this.m_viewportOffset['x'] = this.m_viewport['x'] + this.m_shake['x'];
        this.m_viewportOffset['y'] = this.m_viewport['y'] + this.m_shake['y'];
        this.m_viewportOffset['width'] = this.m_viewport['width'];
        this.m_viewportOffset['height'] = this.m_viewport['height'];
    }
};

/**
 * Updates the subsystem used to create flash effects.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_updateFlash = function(step) {
    if (this.m_flash != null) {
        this.m_flash.update(step);
    }
};

/**
 * Updates the subsystem used to create fade effects.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_updateFade = function(step) {
    if (this.m_fade != null) {
        this.m_fade.update(step);
    }
};

/**
 * Updates the camera position, if there are objects to follow.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_updateTargets = function(step) {
    if (this.m_targets['length'] > 0) {
        var tx = (this['targets'].position.x - (this.m_viewport.width  >> 1));
        var ty = (this['targets'].position.y - (this.m_viewport.height >> 1));
        
        this.m_viewport.x += (tx - this.m_viewport.x) * this.m_lag.x;
        this.m_viewport.y += (ty - this.m_viewport.y) * this.m_lag.y;
    }
};

/**
 * Updates the camera position so that it is within limits.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_updateBoundaries = function(step) {
    if (this.bounderies != null) {
        if (this.m_viewport['left'] < this.bounderies['left']) {
            this.m_viewport['left'] = this.bounderies['left'];
        }

        if (this.m_viewport['right'] > this.bounderies['right']) {
            this.m_viewport['right'] = this.bounderies['right'];
        }

        if (this.m_viewport['top'] < this.bounderies['top']) {
            this.m_viewport['top'] = this.bounderies['top'];
        }

        if (this.m_viewport['bottom'] > this.bounderies['bottom']) {
            this.m_viewport['bottom'] = this.bounderies['bottom'];
        }
    }
};

/**
 * Renders the tilemap's back buffer. This assumes that there is a loaded map.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderMapBackBuffer = function() {
    if (this.input['map']['back'] && this.input['map']['back'].visible) {
        this["canvas"].renderTiles(
            this.input['map'], 
            this.m_viewportOffset,
            rune.tilemap.Tilemap.BACK_BUFFER
        );
        
        this.m_renderMapPaths(this.input['map']['back']);
    }
};

/**
 * Renders paths on a Tilemap layer. This method is designed for debugging only.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderMapPaths = function(layer) {
    var path = null;
    if (layer) {
        for (var i = 0; i < layer['paths']['length']; i++) {
            path = layer['paths'].get(i);
            this["canvas"].renderPath(
                path,
                this.m_viewportOffset['x'], 
                this.m_viewportOffset['y']
            );
        } 
    }
};

/**
 * Renders the display objects that are visible within the camera's viewport.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderInput = function() {
    if (this.input != null) {
        var children = this.input.getChildren();
        for (var i = 0, l = children.length; i < l; i++) {
            this["canvas"].renderDisplayObject(
                children[i], 
                this.m_viewportOffset['x'], 
                this.m_viewportOffset['y']
            );
            
            this.m_renderInputDebug(children[i]);
        }
    }
};

/**
 * Renders debug graphics for input data.
 *
 * @param {rune.display.DisplayObject} obj Display object to debug.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderInputDebug = function(obj) {
    if (obj['debug'] == true) {
        this.m_canvas.drawRect(
            obj['x'] - this.m_viewport['x'],
            obj['y'] - this.m_viewport['y'],
            obj['width'],
            obj['height'],
            obj['debugColor'],
            1
        );   
    }
    
    if (obj['hitbox'].debug == true) {
        this.m_canvas.drawRect(
            obj['hitbox']['x'] - this.m_viewport['x'],
            obj['hitbox']['y'] - this.m_viewport['y'],
            obj['hitbox']['width'],
            obj['hitbox']['height'],
            obj['hitbox'].debugColor,
            1
        );   
    }
};

/**
 * Renders the tilemap's front buffer. This assumes that there is a loaded map.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderMapFrontBuffer = function() {
    if (this.input['map']['front'] && this.input['map']['front'].visible) {
        this["canvas"].renderTiles(
            this.input['map'], 
            this.m_viewport,
            rune.tilemap.Tilemap.FRONT_BUFFER
        ); 
        
        this.m_renderMapPaths(this.input['map']['front']); 
    }
};

/**
 * Render color tint.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderTint = function() {
    if (this.m_tint != null && this.m_tint["opacity"] > 0.0) {
        this["canvas"].drawFill(this.m_tint.toString());
    }
};

/**
 * Render camera flash.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderFlash = function() {
    if (this.m_flash != null && this.m_flash["opacity"] > 0.0) {
        this["canvas"].drawFill(this.m_flash.toString());
    }
};

/**
 * Render camera fade.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_renderFade = function() {
    if (this.m_fade != null && this.m_fade["opacity"] > 0.0) {
        this["canvas"].drawFill(this.m_fade.toString());
    }
};

/**
 * Removes the subsystem (CameraTargets).
 *
 * @returns {undefined}
 * @private
 */
rune.camera.Camera.prototype.m_disposeTargets = function() {
    if (this.m_targets instanceof rune.camera.CameraTargets) {
        this.m_targets.dispose();
        this.m_targets = null;
    }
};

/**
 * Removes the subsystem (CameraFade).
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_disposeFade = function() {
    if (this.m_fade instanceof rune.camera.CameraFade) {
        this.m_fade.dispose();
        this.m_fade = null;
    }
};

/**
 * Removes the subsystem (CameraFlash).
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_disposeFlash = function() {
    if (this.m_flash instanceof rune.camera.CameraFlash) {
        this.m_flash.dispose();
        this.m_flash = null;
    }
};

/**
 * Removes the subsystem (CameraTint).
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_disposeTint = function() {
    if (this.m_tint instanceof rune.camera.CameraTint) {
        this.m_tint.dispose();
        this.m_tint = null;
    }
};

/**
 * Removes the subsystem (CameraShake).
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_disposeShake = function() {
    if (this.m_shake instanceof rune.camera.CameraShake) {
        this.m_shake.dispose();
        this.m_shake = null;
    }
};

/**
 * Removes the camera's viewport.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Camera.prototype.m_disposeViewport = function() {
    if (this.m_viewport instanceof rune.camera.CameraViewport) {
        this.m_viewport.dispose();
        this.m_viewport = null;
    }
};