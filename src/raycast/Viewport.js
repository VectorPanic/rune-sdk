//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Viewport object.
 *
 * @constructor
 * @extends rune.display.DisplayObject
 *
 * @param {number} x Display position in pixels.
 * @param {number} y Display position in pixels.
 * @param {number} width Render buffer width in pixels.
 * @param {number} height Render buffer height in pixels.
 * @param {rune.raycast.World} world World to render.
 * @param {rune.raycast.Camera} camera Observer used for projection.
 *
 * @class
 * @classdesc
 *
 * Projects tilemap walls, surfaces and animated billboards into a normal display
 * object. Uses Rune Canvas buffers and never updates its observed world or camera.
 */
rune.raycast.Viewport = function(x, y, width, height, world, camera) {

    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------

    /**
     * World observed by this view; owned by the caller.
     *
     * @type {rune.raycast.World}
     */
    this.world = world;

    /**
     * Observer used for projection; owned by the caller.
     *
     * @type {rune.raycast.Camera}
     */
    this.camera = camera;

    /**
     * Maximum view distance in tiles.
     *
     * @type {number}
     */
    this.range = 32;

    /**
     * Fallback floor color.
     *
     * @type {string}
     */
    this.floorColor = "#34343c";

    /**
     * Fallback ceiling and sky color.
     *
     * @type {string}
     */
    this.ceilingColor = "#747480";

    /**
     * Fallback color for blocked cells without a wall texture.
     *
     * @type {string}
     */
    this.wallColor = "#9999aa";

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Objects excluded only from this view.
     *
     * @type {Array.<rune.raycast.Billboard>}
     * @private
     */
    this.m_excluded = [];

    /**
     * Per-column wall depth in tiles.
     *
     * @type {Array.<number>}
     * @private
     */
    this.m_depth = [];

    /**
     * Reusable wall query result.
     *
     * @type {Object}
     * @private
     */
    this.m_hit = {};

    /**
     * Cached immutable floor and ceiling image pixels.
     *
     * @type {Array}
     * @private
     */
    this.m_surfaceCache = [null, null];

    /**
     * Reusable surface output pixels.
     *
     * @type {?ImageData}
     * @private
     */
    this.m_surfaceBuffer = null;

    /**
     * Owned buffer for compositing textured surfaces.
     *
     * @type {?rune.display.Canvas}
     * @private
     */
    this.m_surfaceCanvas = null;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.display.DisplayObject.
     */
    rune.display.DisplayObject.call(this, x, y, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.raycast.Viewport.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.raycast.Viewport.prototype.constructor = rune.raycast.Viewport;

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Excludes an object from this view and invalidates the render cache.
 *
 * @param {rune.raycast.Billboard} object Billboard to exclude.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.raycast.Viewport.prototype.exclude = function(object) {
    if (this.m_excluded.indexOf(object) < 0) {
        this.m_excluded.push(object);
    }
    this.breakCache();
};

/**
 * Removes a view-local exclusion without changing global visibility.
 *
 * @param {rune.raycast.Billboard} object Billboard to include.
 *
 * @returns {undefined}
 * @suppress {accessControls}
 */
rune.raycast.Viewport.prototype.include = function(object) {
    var index = this.m_excluded.indexOf(object);
    if (index >= 0) {
        this.m_excluded.splice(index, 1);
    }
    this.breakCache();
};

/**
 * Checks global visibility, flicker, alpha and this view's exclusions.
 * Override for game-specific rules, retaining the base implementation.
 *
 * @param {rune.raycast.Billboard} object Billboard to evaluate.
 *
 * @returns {boolean}
 */
rune.raycast.Viewport.prototype.isVisible = function(object) {
    return !object['hidden'] && object['alpha'] > 0 && this.m_excluded.indexOf(object) < 0;
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Invalidates projection without updating the observed world or camera.
 *
 * @param {number} step Elapsed time in milliseconds.
 *
 * @returns {undefined}
 * @inheritDoc
 * @suppress {accessControls}
 */
rune.raycast.Viewport.prototype.update = function(step) {
    rune.display.DisplayObject.prototype.update.call(this, step);
    this.breakCache();
};

/**
 * Renders surfaces, walls and upright billboards into the display buffer.
 *
 * @throws {RangeError} If fov is outside (0, PI) or range is not finite and non-negative.
 * @returns {undefined}
 * @inheritDoc
 */
rune.raycast.Viewport.prototype.render = function() {
    if (!isFinite(this.camera.fov) || this.camera.fov <= 0 || this.camera.fov >= Math.PI ||
        !isFinite(this.range) || this.range < 0) {
        throw new RangeError("A view requires a field of view between zero and PI and a finite non-negative range.");
    }
    this.m_renderSurfaces();
    this.m_renderWalls();
    this.m_renderBillboards();
};

/**
 * Releases owned buffers and exclusions, leaving the world and camera intact.
 *
 * @returns {undefined}
 * @inheritDoc
 */
rune.raycast.Viewport.prototype.dispose = function() {
    this.m_excluded.length = 0;
    this.m_surfaceCache = null;
    this.m_disposeSurfaceBuffer();
    this.m_depth = null;
    this.world = null;
    this.camera = null;
    rune.display.DisplayObject.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Fills fallback colors and composites the optional floor and ceiling textures.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.raycast.Viewport.prototype.m_renderSurfaces = function() {
    var viewWidth = this['canvas'].width;
    var viewHeight = this['canvas'].height;
    this['canvas'].clear();
    this['canvas'].drawRectFill(0, 0, viewWidth, Math.ceil(viewHeight / 2), this.ceilingColor, 1);
    this['canvas'].drawRectFill(0, Math.ceil(viewHeight / 2), viewWidth, viewHeight, this.floorColor, 1);
    var floor = this.m_getSurfacePixels(this.world['floorTexture'], 0);
    var ceiling = this.world.ceilingEnabled ?
        this.m_getSurfacePixels(this.world['ceilingTexture'], 1) : null;
    if (!this.world.ceilingEnabled) {
        this.m_renderSky();
    }
    if (!floor && !ceiling) {
        return;
    }
    this.m_constructSurfaceBuffer(viewWidth, viewHeight);
    var data = this.m_surfaceBuffer.data;
    for (var i = 0; i < data.length; i++) {
        data[i] = 0;
    }
    if (ceiling) {
        this.m_renderSurface(ceiling, false);
    }
    if (floor) {
        this.m_renderSurface(floor, true);
    }
    this.m_surfaceCanvas['context'].putImageData(this.m_surfaceBuffer, 0, 0);
    this['canvas'].context.drawImage(this.m_surfaceCanvas['element'], 0, 0);
};

/**
 * Draws a wrapping 360-degree panorama above the horizon.
 * Camera translation and view range do not affect the distant sky.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.raycast.Viewport.prototype.m_renderSky = function() {
    var texture = this.world['skyTexture'];
    if (!texture || !texture.width || !texture.height || texture.complete === false || texture.naturalWidth === 0) {
        return;
    }
    var viewWidth = this['canvas'].width;
    var viewHeight = Math.ceil(this['canvas'].height / 2);
    var projection = viewWidth / (2 * Math.tan(this.camera.fov / 2));
    var turn = Math.PI * 2;
    for (var x = 0; x < viewWidth; x++) {
        var angle = this.camera.angle + Math.atan((x + 0.5 - viewWidth / 2) / projection);
        var u = ((angle / turn) % 1 + 1) % 1;
        var column = Math.min(texture.width - 1, Math.floor(u * texture.width));
        this['canvas'].drawImage(texture, x, 0, 1, viewHeight, column, 0, 1, texture.height);
    }
};

/**
 * Projects one surface at eye height 0.5 tiles using nearest-neighbor sampling.
 *
 * @param {Object} texture Cached source image pixels.
 * @param {boolean} floor Whether to render below the horizon.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.raycast.Viewport.prototype.m_renderSurface = function(texture, floor) {
    var viewWidth = this['canvas'].width;
    var viewHeight = this['canvas'].height;
    var camera = this.camera;
    var projection = viewWidth / (2 * Math.tan(camera.fov / 2));
    var cos = Math.cos(camera.angle);
    var sin = Math.sin(camera.angle);
    var data = this.m_surfaceBuffer.data;
    for (var y = 0; y < viewHeight; y++) {
        var offset = y + 0.5 - viewHeight / 2;
        if ((floor && offset <= 0) || (!floor && offset >= 0)) {
            continue;
        }
        var distance = projection * 0.5 / Math.abs(offset);
        if (distance > this.range) {
            continue;
        }
        for (var x = 0; x < viewWidth; x++) {
            var lateral = (x + 0.5 - viewWidth / 2) / projection;
            if (distance * Math.sqrt(1 + lateral * lateral) > this.range) {
                continue;
            }
            var wx = camera.x + distance * (cos - sin * lateral);
            var wy = camera.y + distance * (sin + cos * lateral);
            var tx = Math.floor((wx - Math.floor(wx)) * texture.width);
            var ty = Math.floor((wy - Math.floor(wy)) * texture.height);
            var source = (ty * texture.width + tx) * 4;
            var dest = (y * viewWidth + x) * 4;
            data[dest] = texture.data[source];
            data[dest + 1] = texture.data[source + 1];
            data[dest + 2] = texture.data[source + 2];
            data[dest + 3] = texture.data[source + 3];
        }
    }
};

/**
 * Projects unit-height wall columns using perpendicular depth to avoid fisheye.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.raycast.Viewport.prototype.m_renderWalls = function() {
    var viewWidth = this['canvas'].width;
    var viewHeight = this['canvas'].height;
    var camera = this.camera;
    var projection = viewWidth / (2 * Math.tan(camera.fov / 2));
    var cos = Math.cos(camera.angle);
    var sin = Math.sin(camera.angle);
    var texture = this.world.map['texture'];
    this.m_depth.length = viewWidth;
    for (var x = 0; x < viewWidth; x++) {
        var lateral = (x + 0.5 - viewWidth / 2) / projection;
        var dx = cos - sin * lateral;
        var dy = sin + cos * lateral;
        var length = Math.sqrt(dx * dx + dy * dy);
        var hit = this.world.castView(camera.x, camera.y, dx, dy, this.range / length, this.m_hit);
        this.m_depth[x] = hit.hit ? hit.distance : Infinity;
        if (!hit.hit) {
            continue;
        }
        var height = projection / Math.max(hit.distance, 0.0001);
        var top = (viewHeight - height) / 2;
        this['canvas'].drawRectFill(x, top, 1, height, this.wallColor, 1);
        if (hit.object instanceof rune.raycast.Door) {
            var image = hit.object['texture'].data;
            var column = Math.min(image.width - 1, Math.floor(hit.u * image.width));
            this['canvas'].drawImage(image, x, top, 1, height, column, 0, 1, image.height);
        } else if (texture && hit.tile > 0) {
            var frame = this.world.map.getTileTextureRectOf(hit.tile);
            var tx = Math.min(frame.width - 1, Math.floor(hit.u * frame.width));
            this['canvas'].drawImage(texture, x, top, 1, height, frame.x + tx, frame.y, 1, frame.height);
        }
        if (hit.side === 1) {
            this['canvas'].drawRectFill(x, top, 1, height, "#000000", 0.2);
        }
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates or resizes the surface buffer only when the view dimensions change.
 *
 * @param {number} width Buffer width in pixels.
 * @param {number} height Buffer height in pixels.
 *
 * @returns {undefined}
 * @private
 */
rune.raycast.Viewport.prototype.m_constructSurfaceBuffer = function(width, height) {
    if (this.m_surfaceCanvas == null) {
        this.m_surfaceCanvas = new rune.display.Canvas(width, height);
    } else if (this.m_surfaceCanvas['width'] !== width || this.m_surfaceCanvas['height'] !== height) {
        this.m_surfaceCanvas.resize(width, height);
    } else {
        return;
    }
    this.m_surfaceBuffer = this.m_surfaceCanvas['context'].createImageData(width, height);
};

/**
 * Renders visible billboards from farthest to nearest without updating them.
 *
 * @returns {undefined}
 * @private
 */
rune.raycast.Viewport.prototype.m_renderBillboards = function() {
    var objects = this.m_getBillboards();
    for (var i = 0; i < objects.length; i++) {
        this.m_renderBillboard(objects[i]);
    }
};

/**
 * Projects one Sprite frame and clips its columns against the wall depths.
 *
 * @param {rune.raycast.Billboard} object Billboard to render.
 *
 * @returns {undefined}
 * @private
 */
rune.raycast.Viewport.prototype.m_renderBillboard = function(object) {
    var camera = this.camera;
    var cos = Math.cos(camera.angle);
    var sin = Math.sin(camera.angle);
    var dx = object.x - camera.x;
    var dy = object.y - camera.y;
    var depth = dx * cos + dy * sin;
    var lateral = dy * cos - dx * sin;
    var viewWidth = this['canvas'].width;
    var viewHeight = this['canvas'].height;
    var projection = viewWidth / (2 * Math.tan(camera.fov / 2));
    var frame = object.getFrame(camera);
    var texture = object['texture'].data;
    var width = object.worldWidth * projection / depth;
    var height = object.worldHeight * projection / depth;
    if (width <= 0 || height <= 0) {
        return;
    }
    var left = viewWidth / 2 + lateral * projection / depth - width / 2;
    var top = viewHeight / 2 + (0.5 - object.elevation - object.worldHeight) * projection / depth;
    var context = this['canvas'].context;
    context.save();
    context.globalAlpha = object['alpha'];
    if (object.flippedY) {
        context.translate(0, 2 * top + height);
        context.scale(1, -1);
    }
    for (var x = Math.max(0, Math.floor(left)); x < Math.min(viewWidth, Math.ceil(left + width)); x++) {
        var clipped = depth >= this.m_depth[x];
        if (clipped) {
            var wallHeight = projection / Math.max(this.m_depth[x], 0.0001);
            var wallTop = (viewHeight - wallHeight) / 2;
            var wallBottom = wallTop + wallHeight;
            if (object.flippedY) {
                var mirror = 2 * top + height;
                var mirroredTop = mirror - wallBottom;
                wallBottom = mirror - wallTop;
                wallTop = mirroredTop;
            }
            if (wallTop <= top && wallBottom >= top + height) {
                continue;
            }
            context.save();
            context.beginPath();
            context.rect(x, top, 1, Math.max(0, Math.min(height, wallTop - top)));
            var below = Math.max(top, wallBottom);
            context.rect(x, below, 1, Math.max(0, top + height - below));
            context.clip();
        }
        var u = rune.util.Math.clamp((x + 0.5 - left) / width, 0, 0.999999);
        if (object.flippedX) {
            u = 1 - u;
        }
        var tx = Math.min(frame.width - 1, Math.floor(u * frame.width));
        context.drawImage(texture, frame.x + tx, frame.y, 1, frame.height, x, top, 1, height);
        if (clipped) {
            context.restore();
        }
    }
    context.restore();
};

/**
 * Selects visible billboards in range and sorts them by camera depth.
 * The returned array contains the original objects without projection wrappers.
 *
 * @returns {Array.<rune.raycast.Billboard>}
 * @private
 */
rune.raycast.Viewport.prototype.m_getBillboards = function() {
    var camera = this.camera;
    var cos = Math.cos(camera.angle);
    var sin = Math.sin(camera.angle);
    var children = this.world.getChildren();
    var objects = [];
    for (var i = 0; i < children.length; i++) {
        var object = children[i];
        if (!(object instanceof rune.raycast.Billboard) || !this.isVisible(object)) {
            continue;
        }
        var dx = object.x - camera.x;
        var dy = object.y - camera.y;
        if (dx * cos + dy * sin > 0.0001 && dx * dx + dy * dy <= this.range * this.range) {
            objects.push(object);
        }
    }
    objects.sort(function(a, b) {
        return (b.x - camera.x) * cos + (b.y - camera.y) * sin -
            ((a.x - camera.x) * cos + (a.y - camera.y) * sin);
    });
    return objects;
};

/**
 * Caches immutable source image pixels by image identity and dimensions.
 *
 * @param {?HTMLImageElement} image Optional source image.
 * @param {number} slot Floor or ceiling cache slot.
 *
 * @returns {?Object}
 * @private
 */
rune.raycast.Viewport.prototype.m_getSurfacePixels = function(image, slot) {
    if (!image || !image.width || !image.height || image.complete === false) {
        this.m_surfaceCache[slot] = null;
        return null;
    }
    var cached = this.m_surfaceCache[slot];
    if (cached && cached.image === image && cached.width === image.width && cached.height === image.height) {
        return cached;
    }
    var canvas = new rune.display.Canvas(image.width, image.height);
    var context = canvas['context'];
    try {
        context.drawImage(image, 0, 0);
        cached = {
            image: image,
            width: image.width,
            height: image.height,
            data: context.getImageData(0, 0, image.width, image.height).data
        };
    } catch (error) {
        return null;
    } finally {
        canvas.dispose();
    }
    this.m_surfaceCache[slot] = cached;
    return cached;
};

/**
 * Releases the surface buffer owned by this view.
 *
 * @returns {undefined}
 * @private
 */
rune.raycast.Viewport.prototype.m_disposeSurfaceBuffer = function() {
    if (this.m_surfaceCanvas != null) {
        this.m_surfaceCanvas.dispose();
        this.m_surfaceCanvas = null;
    }
    this.m_surfaceBuffer = null;
};
