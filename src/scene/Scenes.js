//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the class.
 * 
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * Represents a scene manager. Multiple scenes can exist simultaneously, but 
 * only one scene can be selected at a time. Rendering is limited to the 
 * selected scene. All scenes in the current batch are initialized and kept in 
 * memory until a new batch is loaded.
 */
rune.scene.Scenes = function() {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Current batch.
     *
     * @type {Array.<rune.scene.Scene>}
     * @private
     */
    this.m_cb = [];
    
    /**
     * Requested batch.
     *
     * @type {Array.<rune.scene.Scene>}
     * @private
     */
    this.m_rb = null;
    
    /**
     * Prevents recursive cleanup when a scene's dispose callback calls dispose().
     *
     * @type {boolean}
     * @private
     */
    this.m_disposing = false;

    /**
     * Selected scene index.
     *
     * @type {number}
     * @private
     */
    this.m_cs = 0;
    
    /**
     * Requested scene index.
     *
     * @type {number}
     * @private
     */
    this.m_rs = 0;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The number of scenes that exist within the current batch, i.e. how many 
 * Scene objects currently exist in memory. Note that a batch can contain 
 * multiple scenes, but only one scene can be selected at a time.
 *
 * @member {number} batchSize
 * @memberof rune.scene.Scenes
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scenes.prototype, "batchSize", {
    /**
     * @this rune.scene.Scenes
     * @ignore
     */
    get : function() {
        return this.m_cb.length;
    },
});

/**
 * The currently selected scene.
 *
 * @member {rune.scene.Scene} selected
 * @memberof rune.scene.Scenes
 * @instance
 * @readonly
 */
Object.defineProperty(rune.scene.Scenes.prototype, "selected", {
    /**
     * @this rune.scene.Scenes
     * @ignore
     */
    get : function() {
        return this.m_cb[this.m_cs];
    },
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Searches for a specific scene in the current batch of scene objects. The 
 * search is based on scene name.
 *
 * @param {string} name The name of the searched scene.
 *
 * @returns {rune.scene.Scene}
 */
rune.scene.Scenes.prototype.find = function(name) {
    for (var i = 0; i < this.m_cb.length; i++) {
        if (this.m_cb[i]['name'] === name) {
            return this.m_cb[i];
        }
    }
    
    return null;
};

/**
 * Requests selection by name in the pending batch, or the current batch if
 * no load is pending. Uses the same batch as select(); activation is deferred
 * until update(). A missing name returns false without changing the request.
 * Unlike find(), this searches the pending batch when one exists.
 *
 * @param {string} name The name of the searched scene.
 *
 * @returns {boolean}
 */
rune.scene.Scenes.prototype.findAndSelect = function(name) {
    var batch = this.m_rb || this.m_cb;
    for (var i = 0; i < batch.length; i++) {
        if (batch[i]['name'] === name) {
            this.select(i);
            return true;
        }
    }
    
    return false;
};

/**
 * Activates a batch of scenes. This process removes any previous scenes and 
 * frees up allocated memory, hence the process can not be undone. All scenes 
 * in the batch are initialized on the next update tick. A load requested
 * during init() or old-batch dispose() remains pending until the following
 * update. If several loads are requested before then, the latest request
 * replaces the pending batch.
 * Replacing a pending batch disposes its abandoned scenes immediately; scenes
 * still in the current or new pending batch are retained.
 * The array is copied; later array edits do not affect the manager. Scene
 * objects are retained by reference and disposed when removed by the manager.
 * Every scene must provide callable init, update, render, dispose, onSelect
 * and onDeselect methods. A scene object may occur only once per batch;
 * distinct objects may share a name. Objects in the current batch cannot be
 * loaded again: use select() to switch scenes, or create a new instance to
 * restart one. Invalid input leaves current and pending batches unchanged.
 *
 * @param {Array.<rune.scene.Scene>} batch Scene list to copy into the manager.
 *
 * @throws {Error} If the batch is empty, is not an array or contains invalid, duplicate or current scenes.
 *
 * @returns {undefined}
 */
rune.scene.Scenes.prototype.load = function(batch) {
    if (!Array.isArray(batch) || batch.length === 0) {
        throw new Error("Invalid scene batch");
    }
    var scenes = batch.slice();
    for (var i = 0; i < scenes.length; i++) {
        var scene = scenes[i];
        if (scene == null || typeof scene !== "object" ||
            typeof scene.init !== "function" || typeof scene.update !== "function" ||
            typeof scene.render !== "function" || typeof scene.dispose !== "function" ||
            typeof scene.onSelect !== "function" || typeof scene.onDeselect !== "function") {
            throw new Error("Invalid scene at index " + i);
        }
        if (scenes.indexOf(scene) !== i) {
            throw new Error("Duplicate scene at index " + i);
        }
        if (this.m_cb.indexOf(scenes[i]) >= 0) {
            throw new Error("Scene at index " + i + " already belongs to the current batch");
        }
    }
    var previous = this.m_rb;
    this.m_rb = scenes;
    this.m_rs = 0;
    this.m_disposeAbandonedScenes(previous);
};

/**
 * Select a scene from the current batch. Note that only the selected scene is 
 * rendered. Inactive scenes remain unchanged during their time as inactive.
 *
 * @param {number} index Zero-based integer index in the pending or current batch.
 *
 * @throws {RangeError} If index is not an integer number within the batch bounds.
 *
 * @returns {undefined}
 */
rune.scene.Scenes.prototype.select = function(index) {
    var batch = (this.m_rb) ? this.m_rb : this.m_cb;
    if (typeof index === "number" && index === Math.floor(index) &&
        index >= 0 && index < batch.length) {
        if (this.m_rs != index) {
            this.m_rs  = index;
        }
    } else throw new RangeError("Invalid scene index");
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates current scenes.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.scene.Scenes.prototype.update = function(step) {
    this.m_updateBatch(step);
    this.m_updateSelection(step);
    this.m_updateScenes(step);
};

/**
 * Renders the selected scene.
 *
 * @returns {undefined}
 * @ignore
 */
rune.scene.Scenes.prototype.render = function() {
    this.m_renderScenes();
};

/**
 * Cancels pending loads and disposes current and pending scenes once each.
 * Requests made by disposal callbacks are also canceled and cleaned up.
 * Cleanup continues after callback failures, then rethrows the first error.
 * A later explicit load() may reuse this manager.
 *
 * @returns {undefined}
 * @ignore
 */
rune.scene.Scenes.prototype.dispose = function() {
    if (this.m_disposing) return;

    this.m_disposing = true;
    var disposed = [];
    var failure = null;
    try {
        do {
            var batch = this.m_cb.concat(this.m_rb || []);
            this.m_rb = null;
            this.m_cb = [];
            this.m_cs = this.m_rs = 0;
            var scenes = [];
            for (var i = 0; i < batch.length; i++) {
                var scene = batch[i];
                if (scene != null && disposed.indexOf(scene) < 0) {
                    disposed.push(scene);
                    scenes.push(scene);
                }
            }
            try {
                this.m_disposeBatch(scenes);
            } catch (error) {
                if (failure == null) failure = {error: error};
            }
        } while (this.m_hasPendingBatch());
    } finally {
        this.m_disposing = false;
    }
    
    if (failure != null) throw failure.error;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Cancels a failed transition and attempts cleanup of all owned scenes.
 * Cleanup failures must not hide the original lifecycle error.
 *
 * @param {*} error Original initialization or selection error.
 *
 * @throws {*} The original error after cleanup attempts finish.
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_abortTransition = function(error) {
    try {
        this.dispose();
    } catch (cleanupError) {
        // Preserve the transition error; dispose() has attempted every scene.
    }
    throw error;
};

/**
 * Checks pending state after lifecycle callbacks, which may request a new load.
 *
 * @returns {boolean}
 * @private
 */
rune.scene.Scenes.prototype.m_hasPendingBatch = function() {
    return this.m_rb != null;
};

/**
 * Replaces the current batch with a new one. A lifecycle failure aborts the
 * transition, clears owned scenes and propagates the original error.
 *
 * @throws {Error} Unless there is a new batch of scenes.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_iniScenes = function() {
    if (this.m_rb == null || this.m_rb.length === 0) {
        throw new Error("No pending scene batch");
    }
    var previous = this.m_cb;
    var batch = this.m_rb;
    var selection = this.m_rs;

    this.m_cb = batch;
    this.m_rb = null;
    this.m_cs = (selection > -1 && selection < batch.length) ? selection : 0;
    this.m_rs = this.m_cs;

    try {
        this.m_disposeBatch(previous);
        if (this.m_cb !== batch) return;

        for (var i = 0; i < batch.length; i++) {
            batch[i].init();
            if (this.m_cb !== batch) return;
        }
        
        this.m_selectInitialScene();
    } catch (error) {
        this.m_abortTransition(error);
    }
};

/**
 * Activates the initial scene after all init callbacks have run. If a callback
 * requested another batch, its requested index must not select a current scene.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_selectInitialScene = function() {
    if (!this.m_hasPendingBatch()) {
        this.m_cs = this.m_rs;
    }
    this.m_cb[this.m_cs].onSelect(null);
};

/**
 * If there is a requested batch, it should replace the existing one.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_updateBatch = function(step) {
    if (this.m_hasPendingBatch()) {
        this.m_iniScenes();
    }
};

/**
 * Updates selection within the current batch. If another batch is pending,
 * the requested index belongs to that batch and must not select an old scene.
 * Stops the transition if onDeselect() disposes or replaces the current batch.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_updateSelection = function(step) {
    if (!this.m_hasPendingBatch() && this.m_cb != null &&
        this.m_rs > -1 && this.m_rs < this.m_cb.length && this.m_cs != this.m_rs) {
        
        var batch = this.m_cb;
        var o = batch[this.m_cs];
        var n = batch[this.m_rs];
        
        this.m_cs = this.m_rs;
        
        try {
            o['onDeselect'](n);
            if (this.m_cb !== batch) return;
            n['onSelect'](o);
        } catch (error) {
            this.m_abortTransition(error);
        }
    }
};

/**
 * Updates active scenes while the same batch remains current.
 * Stops if a scene callback disposes or replaces the batch.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_updateScenes = function(step) {
    var batch = this.m_cb;
    if (batch == null) return;

    for (var i = 0; this.m_cb === batch && i < batch.length; i++) {
        var scene = batch[i];
        if (i == this.m_cs || scene.persistent == true) {
            scene.update(step);
        }
    }
};

/**
 * Renders the selected scene.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_renderScenes = function() {
    if (this.m_cb != null && this.m_cb.length > this.m_cs) {
        this.m_cb[this.m_cs].render();
    }
};

/**
 * Disposes scenes abandoned by a replacement request. Check live ownership
 * before each callback because dispose() may request another batch. Attempts
 * every abandoned scene before rethrowing the first cleanup error.
 *
 * @param {?Array.<rune.scene.Scene>} batch Previous pending batch.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_disposeAbandonedScenes = function(batch) {
    if (batch == null) return;

    var disposed = [];
    var failure = null;
    for (var i = batch.length - 1; i >= 0; i--) {
        var scene = batch[i];
        if (this.m_cb.indexOf(scene) < 0 &&
            (this.m_rb == null || this.m_rb.indexOf(scene) < 0) && disposed.indexOf(scene) < 0) {
            disposed.push(scene);
            try {
                scene.dispose();
            } catch (error) {
                if (failure == null) failure = {error: error};
            }
        }
    }
    if (failure != null) throw failure.error;
};

/**
 * Attempts cleanup of a detached batch without changing current or pending
 * ownership. Callback load requests belong to the next update. Throws the
 * first error only after all remaining scenes have been attempted.
 *
 * @param {Array.<rune.scene.Scene>} batch Scenes to dispose.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_disposeBatch = function(batch) {
    var failure = null;
    try {
        if (rune.system.Application['instance'] != null && rune.system.Application['instance']['sounds'] != null) {
            rune.system.Application['instance']['sounds'].clear();
        }
    } catch (error) {
        failure = {error: error};
    }

    if (batch != null) {
        for (var i = batch.length - 1; i >= 0; i--) {
            if (batch[i] != null) {
                try {
                    batch[i].dispose();
                } catch (error) {
                    if (failure == null) failure = {error: error};
                }
            }
        }
    }
    if (failure != null) throw failure.error;
};
