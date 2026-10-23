//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates an application-owned manager for frozen scene-image transitions.
 *
 * @constructor
 *
 * @param {rune.system.Application} application Owning application.
 *
 * @class
 * @classdesc
 *
 * select() and load() capture the old screen before requesting a scene change.
 * Scenes performs normal lifecycle callbacks without running scene updates.
 * Once pending lifecycle changes settle, the new screen is captured and the
 * effect combines two frozen images. Cameras and scene timers remain paused.
 * Captures exclude debug overlays. Only two extra internal-resolution canvases
 * are allocated, once per operation. Calls while active return false. Resizing
 * cancels the effect and reveals the current scene. Resources must be loaded
 * before starting; asynchronous resource readiness is not inferred from init().
 */
rune.transition.Transitions = function(application) {

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Owning application; retained across scene batches.
     *
     * @type {rune.system.Application}
     * @private
     */
    this.m_application = application;

    /**
     * Current capture, switch, prepare or animation phase.
     *
     * @type {string}
     * @private
     */
    this.m_phase = "idle";

    /**
     * Effect owned while an operation is active.
     *
     * @type {rune.transition.Transition}
     * @private
     */
    this.m_effect = null;

    /**
     * Frozen previous screen image.
     *
     * @type {rune.display.Canvas}
     * @private
     */
    this.m_from = null;

    /**
     * Frozen next screen image.
     *
     * @type {rune.display.Canvas}
     * @private
     */
    this.m_to = null;

    /**
     * Copied batch request, or null for selection.
     *
     * @type {Array.<rune.scene.Scene>}
     * @private
     */
    this.m_batch = null;

    /**
     * Requested scene index.
     *
     * @type {number}
     * @private
     */
    this.m_index = 0;

    /**
     * Elapsed animation time in milliseconds.
     *
     * @type {number}
     * @private
     */
    this.m_elapsed = 0;

    /**
     * Duration captured when the request starts.
     *
     * @type {number}
     * @private
     */
    this.m_duration = 0;
};

//------------------------------------------------------------------------------
// PUBLIC GETTER AND SETTER METHODS
//------------------------------------------------------------------------------

/**
 * Whether a capture, scene change or image transition is in progress.
 *
 * @member {boolean} active
 * @memberof rune.transition.Transitions
 * @instance
 * @readonly
 */
Object.defineProperty(rune.transition.Transitions.prototype, "active", {
    /**
     * @this rune.transition.Transitions
     * @ignore
     */
    get : function() {
        return this.m_phase !== "idle";
    }
});

/**
 * Normalized animation progress. Scene initialization does not advance it.
 *
 * @member {number} progress
 * @memberof rune.transition.Transitions
 * @instance
 * @readonly
 */
Object.defineProperty(rune.transition.Transitions.prototype, "progress", {
    /**
     * @this rune.transition.Transitions
     * @ignore
     */
    get : function() {
        return this.m_duration > 0 ? this.m_elapsed / this.m_duration : 0;
    }
});

/**
 * Whether the next capture needs the selected scene to render.
 *
 * @member {boolean} needsScene
 * @memberof rune.transition.Transitions
 * @instance
 * @readonly
 */
Object.defineProperty(rune.transition.Transitions.prototype, "needsScene", {
    /**
     * @this rune.transition.Transitions
     * @ignore
     */
    get : function() {
        return this.m_phase === "capture" || (this.m_phase === "prepare" &&
            !this.m_application['scenes']['pending']);
    }
});

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS (API)
//------------------------------------------------------------------------------

/**
 * Starts an effect before selecting an index in the current scene batch.
 * The effect is owned only when the request is accepted.
 *
 * @param {number} index Scene index, a zero-based integer.
 * @param {rune.transition.Transition} effect Effect to play.
 *
 * @returns {boolean} Whether the request was accepted.
 * @throws {RangeError} If index is outside the current batch.
 * @throws {Error} If the manager is disposed or scene changes are pending.
 */
rune.transition.Transitions.prototype.select = function(index, effect) {
    if (this['active']) {
        return false;
    }

    this.m_validateRequest(effect);

    if (typeof index !== "number" || index !== Math.floor(index) ||
        index < 0 || index >= this.m_application['scenes']['batchSize']) {
        throw new RangeError("Invalid transition scene index.");
    }

    this.m_index = index;
    this.m_begin(effect);

    return true;
};

/**
 * Starts an effect before loading a copied scene batch. The scene manager
 * validates its contents when the old image has been captured, before replacing
 * current scenes. A rejected or cancelled request does not own the batch.
 *
 * @param {Array.<rune.scene.Scene>} batch New scene instances.
 * @param {rune.transition.Transition} effect Effect to play.
 *
 * @returns {boolean} Whether the request was accepted.
 * @throws {Error} If batch is empty, the manager is disposed or changes are pending.
 */
rune.transition.Transitions.prototype.load = function(batch, effect) {
    if (this['active']) {
        return false;
    }

    this.m_validateRequest(effect);

    if (!Array.isArray(batch) || batch.length === 0) {
        throw new Error("Invalid transition scene batch.");
    }

    this.m_batch = batch.slice();
    this.m_begin(effect);

    return true;
};

/**
 * Ends an operation and releases images and effect resources. A scene change
 * already submitted to Scenes is not rolled back. Before submission it is
 * simply discarded, leaving the old scene selected.
 *
 * @returns {undefined}
 */
rune.transition.Transitions.prototype.cancel = function() {
    var effect = this.m_effect;
    var from   = this.m_from;
    var to     = this.m_to;

    this.m_phase    = "idle";
    this.m_effect   = null;
    this.m_from     = null;
    this.m_to       = null;
    this.m_batch    = null;
    this.m_elapsed  = 0;
    this.m_duration = 0;

    if (from != null) {
        from.dispose();
    }

    if (to != null) {
        to.dispose();
    }

    if (effect != null) {
        effect.dispose();
    }
};

//------------------------------------------------------------------------------
// PUBLIC PROTOTYPE METHODS (ENGINE)
//------------------------------------------------------------------------------

/**
 * Advances lifecycle preparation or animation without updating scene logic.
 *
 * @param {number} step Elapsed milliseconds.
 *
 * @returns {undefined}
 * @ignore
 */
rune.transition.Transitions.prototype.update = function(step) {
    try {
        var scenes = this.m_application['scenes'];
        if (this.m_phase === "switch") {
            this.m_phase = "prepare";
            
            if (this.m_batch != null) {
                scenes.load(this.m_batch);
            } else {
                scenes.select(this.m_index);
            }
            
            this.m_batch = null;
            scenes.update(0, false);
        } else if (this.m_phase === "prepare") {
            scenes.update(0, false);
        } else if (this.m_phase === "animate") {
            this.m_elapsed = Math.min(
                this.m_duration,
                this.m_elapsed + (isFinite(step) && step > 0 ? step : 0)
            );
            
            if (this.m_elapsed === this.m_duration) {
                this.m_phase = "finish";
            }
        }
    } catch (error) {
        this.m_abort(error);
    }
};

/**
 * Captures clean screen content or composites the current effect frame.
 * Returns false when Screen should render its normal content instead.
 *
 * @param {rune.display.Canvas} canvas Screen output canvas.
 *
 * @returns {boolean} Whether this operation supplied screen content.
 * @ignore
 */
rune.transition.Transitions.prototype.render = function(canvas) {
    if (!this['active']) {
        return false;
    }

    try {
        if (this.m_from != null && (this.m_from['width'] !== canvas['width'] ||
            this.m_from['height'] !== canvas['height'])) {
            this.cancel();
            
            return false;
        }
        
        if (this.m_phase === "capture") {
            this.m_application['screen'].renderContent();
            this.m_from = this.m_capture(canvas);
            this.m_phase = "switch";
        } else if (this.m_phase === "prepare" &&
            !this.m_application['scenes']['pending'] && this.m_application['scenes']['selected'] != null) {
            this.m_application['screen'].renderContent();
            this.m_to = this.m_capture(canvas);
            this.m_effect.init(canvas['width'], canvas['height']);
            this.m_phase = "animate";
        }

        canvas.clear();

        if (this.m_to != null) {
            var context = canvas['context'];
            
            context.save();
            
            try {
                this.m_effect.render(canvas, this.m_from, this.m_to, this['progress']);
            } finally {
                context.restore();
            }
            
            if (this.m_phase === "finish") {
                this.cancel();
            }
        } else {
            canvas.drawImage(this.m_from['element'], 0, 0, canvas['width'], canvas['height']);
        }
        
        return true;
    } catch (error) {
        this.m_abort(error);
    }

    return false;
};

/**
 * Releases the operation before the application disposes its scenes and screen.
 *
 * @returns {undefined}
 * @ignore
 */
rune.transition.Transitions.prototype.dispose = function() {
    try {
        this.cancel();
    } finally {
        this.m_application = null;
    }
};

//------------------------------------------------------------------------------
// PRIVATE PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Checks request prerequisites without changing scenes or claiming the effect.
 *
 * @param {rune.transition.Transition} effect Effect to validate.
 *
 * @returns {undefined}
 * @private
 */
rune.transition.Transitions.prototype.m_validateRequest = function(effect) {
    if (this.m_application == null) {
        throw new Error("Transitions is disposed.");
    }

    if (!(effect instanceof rune.transition.Transition) ||
        !isFinite(effect.duration) || effect.duration <= 0) {
        throw new TypeError("A valid Transition effect is required.");
    }

    var scenes = this.m_application['scenes'];

    if (scenes['pending'] || scenes['selected'] == null) {
        throw new Error("A settled current scene is required for a transition.");
    }
};

/**
 * Claims an effect and waits for the old image's next rendering.
 *
 * @param {rune.transition.Transition} effect Accepted effect.
 *
 * @returns {undefined}
 * @private
 */
rune.transition.Transitions.prototype.m_begin = function(effect) {
    this.m_effect   = effect;
    this.m_duration = effect.duration;
    this.m_elapsed  = 0;
    this.m_phase    = "capture";
};

/**
 * Copies the clean screen at its internal resolution without pixel readback.
 *
 * @param {rune.display.Canvas} canvas Source canvas.
 *
 * @returns {rune.display.Canvas} Owned snapshot.
 * @private
 */
rune.transition.Transitions.prototype.m_capture = function(canvas) {
    var image = new rune.display.Canvas(canvas['width'], canvas['height']);

    image['smoothing'] = canvas['smoothing'];
    image.drawImage(canvas['element'], 0, 0, canvas['width'], canvas['height']);

    return image;
};

/**
 * Releases an unsuccessful operation while preserving its original exception.
 *
 * @param {*} error Original lifecycle or rendering exception.
 *
 * @returns {undefined}
 * @throws {*} The original error.
 * @private
 */
rune.transition.Transitions.prototype.m_abort = function(error) {
    try {
        this.cancel();
    } catch (cleanupError) {
        // CLEANUP MUST NOT HIDE THE ORIGINAL ERROR.
    }

    throw error;
};
