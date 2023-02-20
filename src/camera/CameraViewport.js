//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a CameraViewport object.
 *
 * @constructor
 * @extends rune.geom.Rectangle
 *
 * @param {rune.camera.Camera} camera Reference to the camera object to which the viewport is connected.
 * 
 * @class
 * @classdesc
 * 
 * The CameraViewport class represents a camera's viewport in the form of a 
 * rectangle. DisplayObject located inside the viewport is rendered to the 
 * camera's pixel buffer.
 */
rune.camera.CameraViewport = function(camera) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Reference to the camera object to which this viewport is associated.
     *
     * @type {rune.camera.Camera}
     * @private
     */
    this.m_camera = camera;
    
    /**
     * Current zoom value, where 1.0 is the default, ie. rendered on a 100% 
     * scale.
     *
     * @type {number}
     * @private
     */
    this.m_zoom = 1;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Rectangle.
     */
    rune.geom.Rectangle.call(this, 0, 0, camera.width, camera.height);
};

//--------------------------------------------------------------------------
// Inheritance
//--------------------------------------------------------------------------

rune.camera.CameraViewport.prototype = Object.create(rune.geom.Rectangle.prototype);
rune.camera.CameraViewport.prototype.constructor = rune.camera.CameraViewport;

//--------------------------------------------------------------------------
// Override public getter and setter methods
//--------------------------------------------------------------------------

/**
 * @inheritDoc
 *
 * @member {number} width
 * @memberof rune.camera.CameraViewport
 * @instance
 */
Object.defineProperty(rune.camera.CameraViewport.prototype, "width", {
    /**
     * @this rune.camera.CameraViewport
     * @ignore
     */
    get : function() {
        return this.m_camera['canvas']['width'];
    },
    
    /**
     * @this rune.camera.CameraViewport
     * @ignore
     */
    set : function(value) {
        throw new Error("Illegal operation");
    }
});

/**
 * @inheritDoc
 *
 * @member {number} height
 * @memberof rune.camera.CameraViewport
 * @instance
 */
Object.defineProperty(rune.camera.CameraViewport.prototype, "height", {
    /**
     * @this rune.camera.CameraViewport
     * @ignore
     */
    get : function() {
        return this.m_camera['canvas']['height'];
    },
    
    /**
     * @this rune.camera.CameraViewport
     * @ignore
     */
    set : function(value) {
        throw new Error("Illegal operation");
    }
});

//--------------------------------------------------------------------------
// Public getter and setter methods
//--------------------------------------------------------------------------

/**
 * Current zoom value, where 1.0 is the default, ie. rendered on a 100% 
 * scale. The value can vary between 0.25 (min) and 4.0 (max).
 *
 * @member {number} zoom
 * @memberof rune.camera.CameraViewport
 * @instance
 */
Object.defineProperty(rune.camera.CameraViewport.prototype, "zoom", {
    /**
     * @this rune.camera.CameraViewport
     * @ignore
     */
    get : function() {
        return this.m_zoom;
    },
    
    /**
     * @this rune.camera.CameraViewport
     * @ignore
     */
    set : function(value) {
        this.m_zoom = rune.util.Math.clamp(value, 0.25, 4.0);
        this.m_camera['canvas'].resize(
            this.m_camera['width']  / this.m_zoom,
            this.m_camera['height'] / this.m_zoom
        );
    }
});

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Removes the object and frees allocated memory.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraViewport.prototype.dispose = function() {
    this.m_camera = null;
};