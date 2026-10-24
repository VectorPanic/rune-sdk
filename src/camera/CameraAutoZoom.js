//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a camera's automatic zoom controller.
 *
 * @constructor
 * @param {rune.camera.Camera} camera The owning camera.
 *
 * @class
 * @classdesc
 *
 * Fits the camera's targets and a world-space margin inside its viewport.
 * Zoom is clamped to configurable limits and optionally smoothed over time.
 * The controller is disabled by default. Disabling it, or removing all targets,
 * preserves the current zoom. Limits take precedence over fitting all targets.
 */
rune.camera.CameraAutoZoom = function(camera) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * Whether automatic zoom and bounds-centered following are enabled.
     *
     * @type {boolean}
     * @default false
     */
    this.enabled = false;

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * The camera controlled by this subsystem.
     * @type {rune.camera.Camera}
     * @private
     */
    this.m_camera = camera;

    /**
     * Minimum zoom, bounded by the viewport's supported range.
     * @type {number}
     * @private
     */
    this.m_min = 0.25;

    /**
     * Maximum zoom, bounded by the viewport's supported range.
     * @type {number}
     * @private
     */
    this.m_max = 4.0;

    /**
     * Margin on each side of the target bounds, in world pixels.
     * @type {number}
     * @private
     */
    this.m_padding = 32;

    /**
     * Exponential smoothing time constant, in milliseconds.
     * @type {number}
     * @private
     */
    this.m_smoothing = 250;

    /**
     * Reusable global bounds of the registered targets.
     * @type {rune.geom.Rectangle}
     * @private
     */
    this.m_bounds = new rune.geom.Rectangle();

    /**
     * Target bounds center relative to the camera's input stage.
     * @type {rune.geom.Point}
     * @private
     */
    this.m_position = new rune.geom.Point();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Minimum zoom, clamped between 0.25 and max. Lower values show more of the world.
 *
 * @member {number} min
 * @default 0.25
 * @memberof rune.camera.CameraAutoZoom
 * @instance
 * @throws {RangeError} If the value is not a finite number.
 */
Object.defineProperty(rune.camera.CameraAutoZoom.prototype, "min", {
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    get : function() {
        return this.m_min;
    },
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    set : function(value) {
        this.m_min = rune.util.Math.clamp(this.m_validateNumber(value), 0.25, this.m_max);
    }
});

/**
 * Maximum zoom, clamped between min and 4. Higher values show targets closer up.
 *
 * @member {number} max
 * @default 4.0
 * @memberof rune.camera.CameraAutoZoom
 * @instance
 * @throws {RangeError} If the value is not a finite number.
 */
Object.defineProperty(rune.camera.CameraAutoZoom.prototype, "max", {
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    get : function() {
        return this.m_max;
    },
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    set : function(value) {
        this.m_max = rune.util.Math.clamp(this.m_validateNumber(value), this.m_min, 4.0);
    }
});

/**
 * Margin on each side of the target bounds in world pixels, clamped to zero.
 *
 * @member {number} padding
 * @default 32
 * @memberof rune.camera.CameraAutoZoom
 * @instance
 * @throws {RangeError} If the value is not a finite number.
 */
Object.defineProperty(rune.camera.CameraAutoZoom.prototype, "padding", {
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    get : function() {
        return this.m_padding;
    },
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    set : function(value) {
        this.m_padding = Math.max(0, this.m_validateNumber(value));
    }
});

/**
 * Smoothing time constant in milliseconds, clamped to zero. Zero fits instantly.
 * About 63 percent of the remaining zoom difference is covered in this time.
 *
 * @member {number} smoothing
 * @default 250
 * @memberof rune.camera.CameraAutoZoom
 * @instance
 * @throws {RangeError} If the value is not a finite number.
 */
Object.defineProperty(rune.camera.CameraAutoZoom.prototype, "smoothing", {
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    get : function() {
        return this.m_smoothing;
    },
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    set : function(value) {
        this.m_smoothing = Math.max(0, this.m_validateNumber(value));
    }
});

/**
 * The last calculated target bounds center, in stage-local world coordinates.
 * Updated by the camera before following its targets. Treat as read-only.
 *
 * @member {rune.geom.Point} position
 * @memberof rune.camera.CameraAutoZoom
 * @instance
 * @readonly
 */
Object.defineProperty(rune.camera.CameraAutoZoom.prototype, "position", {
    /**
     * @this rune.camera.CameraAutoZoom
     * @ignore
     */
    get : function() {
        return this.m_position;
    }
});

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Calculates framing and updates zoom before camera following and boundaries.
 * Snaps to the target within 0.0001 to stop asymptotic zoom changes. Targets
 * may temporarily exceed the viewport during smoothing or when limited by min.
 *
 * @param {number} step Elapsed milliseconds.
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraAutoZoom.prototype.update = function(step) {
    if (!this.enabled || this.m_camera == null || this.m_camera['targets']['length'] === 0) {
        return;
    }

    var camera = this.m_camera;
    var bounds = camera['targets'].getBounds(this.m_bounds);
    var inputX = camera.input != null ? camera.input['globalX'] : 0;
    var inputY = camera.input != null ? camera.input['globalY'] : 0;

    this.m_position['x'] = bounds['x'] + bounds['width'] / 2 - inputX;
    this.m_position['y'] = bounds['y'] + bounds['height'] / 2 - inputY;

    var width = Math.max(1, bounds['width'] + this.m_padding * 2);
    var height = Math.max(1, bounds['height'] + this.m_padding * 2);
    var horizontalZoom = camera['width'] / width;
    var verticalZoom = camera['height'] / height;
    var targetZoom = rune.util.Math.clamp(Math.min(horizontalZoom, verticalZoom), this.m_min, this.m_max);

    var viewport = camera['viewport'];
    var currentZoom = rune.util.Math.clamp(viewport['zoom'], this.m_min, this.m_max);
    var zoom = rune.util.Math.damp(currentZoom, targetZoom, this.m_smoothing, step);

    if (Math.abs(targetZoom - zoom) < 0.0001) {
        zoom = targetZoom;
    }

    if (zoom !== viewport['zoom']) {
        viewport.zoomTo(zoom);
    }
};

/**
 * Releases the owning camera and reusable geometry.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.camera.CameraAutoZoom.prototype.dispose = function() {
    this.m_camera = null;
    this.m_bounds = null;
    this.m_position = null;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Validates a numeric configuration value before it is clamped.
 *
 * @param {number} value Value to validate.
 * @returns {number} The validated value.
 * @throws {RangeError} If the value is not a finite number.
 * @private
 */
rune.camera.CameraAutoZoom.prototype.m_validateNumber = function(value) {
    if (typeof value !== "number" || !isFinite(value)) throw new RangeError("Expected a finite number.");
    return value;
};
