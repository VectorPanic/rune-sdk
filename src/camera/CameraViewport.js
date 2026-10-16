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
 * scale. The value can vary between 0.25 (min) and 4.0 (max). Buffer dimensions
 * are rounded up to whole pixels. Unchanged pixel dimensions are not resized.
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
        var canvas = this.m_camera['canvas'];
        var width = Math.max(1, Math.ceil(this.m_camera['width'] / this.m_zoom));
        var height = Math.max(1, Math.ceil(this.m_camera['height'] / this.m_zoom));
        if (canvas['width'] !== width || canvas['height'] !== height) {
            var smoothing = canvas['smoothing'];
            canvas.resize(width, height);
            // Resizing clears context state; preserve the interpolation setting.
            canvas['smoothing'] = smoothing;
        }
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Changes the zoom value while preserving the current viewport center.
 *
 * @param {number} value Zoom value.
 *
 * @returns {number} The current zoom value after clamping.
 */
rune.camera.CameraViewport.prototype.zoomTo = function(value) {
    var centerX = this['x'] + this['width'] / 2;
    var centerY = this['y'] + this['height'] / 2;
    this['zoom'] = value;
    this['x'] = centerX - this['width'] / 2;
    this['y'] = centerY - this['height'] / 2;

    return this.m_zoom;
};

/**
 * Changes the zoom value relative to the current zoom while preserving the
 * current viewport center.
 *
 * @param {number} value Zoom value delta.
 *
 * @returns {number} The current zoom value after clamping.
 */
rune.camera.CameraViewport.prototype.zoomBy = function(value) {
    return this.zoomTo(this.m_zoom + value);
};

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
