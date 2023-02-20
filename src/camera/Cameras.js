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