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
 * selected scene.
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
 * Searching for a specific scene. The scene is automatically activated 
 * if it is found.
 *
 * @param {string} name The name of the searched scene.
 *
 * @returns {boolean}
 */
rune.scene.Scenes.prototype.findAndSelect = function(name) {
    for (var i = 0; i < this.m_cb.length; i++) {
        if (this.m_cb[i]['name'] === name) {
            this.select(i);
            return true;
        }
    }
    
    return false;
};

/**
 * Activates a batch of scenes. This process removes any previous scenes and 
 * frees up allocated memory, hence the process can not be undone.
 *
 * @param {Array.<rune.scene.Scene>} batch Batch to be loaded.
 *
 * @throws {Error} If the specified batch is invalid.
 *
 * @returns {undefined}
 */
rune.scene.Scenes.prototype.load = function(batch) {
    if (Array.isArray(batch) === true && batch.length > 0) {
        this.m_rb = batch;
    } else throw new Error("Invalid scene batch");
};

/**
 * Select a scene from the current batch. Note that only the selected scene is 
 * rendered. Inactive scenes remain unchanged during their time as inactive.
 *
 * @param {number} index List index of requested scene.
 *
 * @throws {RangeError} On invalid list index.
 *
 * @returns {undefined}
 */
rune.scene.Scenes.prototype.select = function(index) {
    var batch = (this.m_rb) ? this.m_rb : this.m_cb;
    if (index > -1 && index < batch.length) {
        if (this.m_cs != index) {
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
 * Deletes current scenes and frees up allocated memory.
 *
 * @returns {undefined}
 * @ignore
 */
rune.scene.Scenes.prototype.dispose = function() {
    this.m_disposeScenes();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Replaces the current batch with a new one.
 *
 * @throws {Error} Unless there is a new batch of scenes.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_iniScenes = function() {
    if (this.m_rb != null && this.m_rb.length > 0) {  
        
        this.m_disposeScenes();
        
        this.m_cb = this.m_rb;
        
        for (var i = 0; i < this.m_cb.length; i++) {
            this.m_cb[i].init();
        }
        
        this.m_rb = null;
        this.m_cb[0].onSelect(null);
    } else throw new Error();
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
    if (this.m_rb != null) {
        this.m_iniScenes();
    }
};

/**
 * Updates scene selection. Multiple scenes can be initiated simultaneously, 
 * but only one can be selected.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_updateSelection = function(step) {
    if (this.m_cs != this.m_rs) {
        
        var o = this.m_cb[this.m_cs];
        var n = this.m_cb[this.m_rs];
        
        this.m_cs = this.m_rs;
        
        o['onDeselect'](n);
        n['onSelect'](o);
    }
};

/**
 * Updates active scenes.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_updateScenes = function(step) {
    if (this.m_cb != null) {
        var l = this.m_cb.length;
        for (var i = 0; i < l; i++) {
            if (i == this.m_cs || this.m_cb[i].persistent == true) {
                this.m_cb[i].update(step);
            }
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
 * Removes allocated scenes.
 *
 * @returns {undefined}
 * @private
 */
rune.scene.Scenes.prototype.m_disposeScenes = function() {
    if (this.m_cb != null) {
        rune.system.Application['instance']['sounds'].clear();
        var i = this.m_cb.length;
        while (i--) {
            this.m_cb[i].dispose();
            this.m_cb[i] = null;
        }
        
        this.m = null;
        this.m_cs = 0;
    }
};