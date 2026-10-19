//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Cameras instance.
 * 
 * @constructor
 *
 * @param {rune.display.Stage} input What the camera system should render.
 * 
 * @class
 * @classdesc
 * 
 * The Cameras class represents a camera system with the ability to create, 
 * delete and manage camera objects.
 */
rune.camera.Cameras = function(input) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Contains the camera objects used by the camera system.
     *
     * @type {Array.<rune.camera.Camera>}
     * @private
     */
    this.m_cameras = [];
    
    /**
     * Camera system input, ie. what is to be rendered by one or more cameras.
     *
     * @type {rune.display.Stage}
     * @private
     */
    this.m_input = input || null;
}

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Returns the number of available cameras.
 *
 * @member {number} length
 * @memberof rune.camera.Cameras
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.Cameras.prototype, "length", {
    /**
     * @this rune.camera.Cameras
     * @ignore
     */
    get : function() {
        return (this.m_cameras) ? this.m_cameras.length : 0;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds a Camera instance to this Cameras instance.
 *
 * @param {rune.camera.Camera} camera The camera to add.
 *
 * @throws {TypeError} If no valid camera object.
 *
 * @returns {rune.camera.Camera}
 */
rune.camera.Cameras.prototype.addCamera = function(camera) {
    if (camera instanceof rune.camera.Camera) {
        if (this.m_cameras.indexOf(camera) === -1) {
            this.m_cameras.push(camera);
            camera.input = this.m_input;
            camera.init();
        }
    } else throw new TypeError();
    
    return camera;
};

/**
 * Creates a new Camera instance.
 *
 * @param {number} [x=0] Camera position in x coordinates.
 * @param {number} [y=0] Camera position in y coordinates.
 * @param {number} [width=384] Camera size in width.
 * @param {number} [height=216] Camera size in height.
 *
 * @returns {rune.camera.Camera} The new camera object.
 */
rune.camera.Cameras.prototype.createCamera = function(x, y, width, height) {
    var camera = new rune.camera.Camera(
        x || 0,
        y || 0,
        width  || rune.system.Application['instance']['screen']['width'],
        height || rune.system.Application['instance']['screen']['height']
    );
    
    return camera;
};

/**
 * Returns the camera object instance that exists at the specified index.
 *
 * @param {number} index The index position of the camera object.
 *
 * @throws {RangeError} Throws if the index does not exist in the camera list.
 *
 * @return {rune.camera.Camera}
 */
rune.camera.Cameras.prototype.getCameraAt = function(index) {
    if (index > -1 && index < this.m_cameras.length) {
        return this.m_cameras[index];
    } else throw new RangeError();
};

/**
 * Returns all Camera instances. Note that this method is primarily intended 
 * for internal use.
 *
 * @return {Array.<rune.camera.Camera>}
 */
rune.camera.Cameras.prototype.getCameras = function() {
    return this.m_cameras;
};

/**
 * Removes a specific Camera instance.
 *
 * @param {rune.camera.Camera} camera Camera to remove.
 * @param {boolean} [dispose=false] If the Camera instance is to be completely removed from memory.
 *
 * @throws {TypeError} If invalid camera object.
 *
 * @returns {rune.camera.Camera}
 */
rune.camera.Cameras.prototype.removeCamera = function(camera, dispose) {
    if (camera instanceof rune.camera.Camera) {
        var i = this.m_cameras.indexOf(camera);
        if (i > -1) {
            this.m_cameras.splice(i, 1);
            if (dispose === true) {
                camera.dispose();
                camera = null;
            }
        }
    } else throw new TypeError();

    return (dispose) ? null : camera;
};

/**
 * Removes all Camera instances.
 *
 * @param {boolean} [dispose=false] If the Camera instances are to be completely removed from memory.
 *
 * @returns {undefined}
 */
rune.camera.Cameras.prototype.removeCameras = function(dispose) {
    while (this.m_cameras.length > 0) {
        this.removeCamera(this.getCameraAt(0), dispose);
    }
};

/**
 * Arranges one to four cameras over the application's internal screen area.
 * Disposes all existing cameras through removeCameras(true), then creates a
 * fresh set through createCamera()/addCamera(). Previous targets, effects,
 * zoom settings and external camera references do not carry over. Configure
 * the new cameras after this call. Invalid layout arguments leave cameras intact.
 *
 * One camera fills the screen. Two cameras use left/right panes by default;
 * horizontal uses top/bottom. Three or four cameras use a two-by-two grid in
 * row-major order, leaving the bottom-right pane unused with three cameras.
 * Pixel boundaries are rounded independently so odd resolutions have no gaps.
 * Call again after a screen resolution change; layout is not updated implicitly.
 *
 * @param {number} count Number of cameras, an integer from one to four.
 * @param {string} [orientation="vertical"] Two-player layout: vertical or horizontal.
 *
 * @return {undefined}
 * @throws {RangeError} If count, orientation or screen dimensions are invalid.
 * @throws {Error} If the camera system has been disposed.
 */
rune.camera.Cameras.prototype.splitScreen = function(count, orientation) {
    if (this.m_cameras == null) throw new Error("Cameras is disposed.");
    orientation = orientation === undefined ? "vertical" : orientation;
    if (typeof count !== "number" || count !== Math.floor(count) || count < 1 || count > 4 ||
        (orientation !== "vertical" && orientation !== "horizontal")) {
        throw new RangeError("Invalid split-screen layout.");
    }
    var screen = rune.system.Application['instance']['screen'];
    var width = screen['width'];
    var height = screen['height'];
    var columns = count === 1 || (count === 2 && orientation === "horizontal") ? 1 : 2;
    var rows = count > 2 || (count === 2 && orientation === "horizontal") ? 2 : 1;
    if (!isFinite(width) || !isFinite(height) || width !== Math.floor(width) ||
        height !== Math.floor(height) || width < columns || height < rows) {
        throw new RangeError("Screen is too small or invalid for split-screen.");
    }
    this.removeCameras(true);
    for (var i = 0; i < count; i++) {
        var column = i % columns;
        var row = Math.floor(i / columns);
        var x = Math.floor(column * width / columns);
        var y = Math.floor(row * height / rows);
        var w = Math.floor((column + 1) * width / columns) - x;
        var h = Math.floor((row + 1) * height / rows) - y;
        var camera = this.addCamera(this.createCamera(0, 0, w, h));
        this.m_layoutCamera(camera, x, y, w, h);
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates the camera system. This method is called automatically once per tick.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.camera.Cameras.prototype.update = function(step) {
    this.m_updateCameras(step);
};

/**
 * Removes the camera system and thus all cameras. The camera system becomes 
 * unusable after this method is called.
 *
 * @returns {undefined}
 * @ignore
 */
rune.camera.Cameras.prototype.dispose = function() {
    this.m_disposeCameras();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Applies a split-screen pane without moving its world-space view center.
 * Camera x/y and width/height describe the output rectangle; viewport x/y
 * describe the viewed world. Reapply zoom after resizing the camera buffer.
 * Override to customize how an individual camera receives its layout.
 *
 * @param {rune.camera.Camera} camera Camera to arrange.
 * @param {number} x Screen x in pixels.
 * @param {number} y Screen y in pixels.
 * @param {number} width Output width in pixels.
 * @param {number} height Output height in pixels.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.Cameras.prototype.m_layoutCamera = function(camera, x, y, width, height) {
    var viewport = camera['viewport'];
    var centerX = viewport['x'] + viewport['width'] / 2;
    var centerY = viewport['y'] + viewport['height'] / 2;
    var zoom = viewport['zoom'];
    var smoothing = camera['canvas']['smoothing'];
    camera['x'] = x;
    camera['y'] = y;
    camera['width'] = width;
    camera['height'] = height;
    viewport['zoom'] = zoom;
    camera['canvas']['smoothing'] = smoothing;
    viewport['x'] = centerX - viewport['width'] / 2;
    viewport['y'] = centerY - viewport['height'] / 2;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates all cameras.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.camera.Cameras.prototype.m_updateCameras = function(step) {
    var cameras = this.m_cameras;
    for (var i = 0, l = cameras.length; i < l; i++) {
        this.m_updateCamera(cameras[i], step);
    }
};

/**
 * Updates a specific camera.
 *
 * @param {rune.camera.Camera} camera Camera to be updated.
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.camera.Cameras.prototype.m_updateCamera = function(camera, step) {
    if (camera['active'] == true) {
        camera.update(step);
    }
};

/**
 * Removes all cameras.
 *
 * @returns {undefined}
 * @ignore
 */
rune.camera.Cameras.prototype.m_disposeCameras = function() {
    this.removeCameras(true);
    this.m_cameras = null;
    this.m_input = null;
};