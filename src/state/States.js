//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the States class, ie a state machine.
 *
 * @constructor
 *
 * @param {Object} owner The state owner.
 * 
 * @class
 * @classdesc
 * 
 * The States class represents a finite-state machine (FSM) that can handle 
 * multiple logical states simultaneously. Although several states can be 
 * allocated simultaneously, only one state can be active at a time. Switch 
 * between states to quickly switch between an object's behavioral logic.
 */
rune.state.States = function(owner) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Reference to the object that is in the current state.
     *
     * @type {Object}
     * @private
     */
    this.m_owner = owner || null;
    
    /**
     * Index of selected state.
     *
     * @type {number}
     * @private
     */
    this.m_selected = 0;

    /**
     * List of initiated and available States.
     *
     * @type {Array.<rune.state.State>}
     * @private
     */
    this.m_states = [];

    /**
     * List containing states to be activated at the next frame.
     *
     * @type {Array.<rune.state.State>}
     * @private
     */
    this.m_swap = null;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The state that is currently selected and thus activated.
 *
 * @member {rune.state.State} selected
 * @memberof rune.state.States
 * @instance
 * @readonly
 */
Object.defineProperty(rune.state.States.prototype, "selected", {
    /**
     * @this rune.state.States
     * @ignore
     */
    get : function() {
        return this.m_states[this.m_selected];
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Loads a new batch from a copied list. Later changes to the caller's array
 * do not affect the pending or active list, and cleanup never modifies it.
 * State objects retain their identity; only the containing array is copied.
 * Replacing a pending list retains states still used by the active or new list.
 * Each state object may occur only once in a batch. Invalid input leaves the
 * active and pending lists unchanged. A load requested from init() is kept
 * pending until the next update; the latest pending request takes precedence.
 *
 * @param {Array.<rune.state.State>} states List of instantiated states.
 *
 * @throws {Error} If the batch is empty, invalid or contains duplicate state objects.
 *
 * @returns {undefined}
 */
rune.state.States.prototype.load = function(states) {
    if (this.m_validateStates(states) === true) {
        var batch = states.slice();
        if (this.m_swap != null) {
            this.m_disposeStateList(this.m_swap, this.m_states.concat(batch));
        }
        
        this.m_swap = batch;
    } else throw new Error("Invalid state batch");
};

/**
 * Selects and activates a state based on its name.
 *
 * @param {string} name Name of state to be selected.
 *
 * @returns {boolean} Whether a state could be selected.
 */
rune.state.States.prototype.select = function(name) {
    name = (name == null) ? "" : name.toString().toUpperCase();
    if (this.m_states == null) return false;

    for (var i = 0; i < this.m_states.length; i++) {
        if (this.m_states[i]['name'].toUpperCase() == name) {
            if (this.m_selected != i) {
                var a = i;
                var b = this.m_selected;
                this.m_states[this.m_selected]['onExit'](this.m_states[a]);
                this.m_selected = a;
                this.m_states[this.m_selected]['onEnter'](this.m_states[b]);
            }
            
            return true;
        }
    }

    return false;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Updates all states.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.state.States.prototype.update = function(step) {
    this.m_updateSwap(step);
    this.m_updateStates(step);
};

/**
 * Renders all states.
 *
 * @returns {undefined}
 * @ignore
 */
rune.state.States.prototype.render = function() {
    this.m_renderStates();
};

/**
 * Destroys all states.
 *
 * @returns {undefined}
 * @ignore
 */
rune.state.States.prototype.dispose = function() {
    this.m_disposeSwap();
    this.m_disposeStates();
    this.m_owner = null;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Initiates current states.
 *
 * @throws {Error} In case of invalid state swap.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_initStates = function() {
    if (this.m_swap != null && this.m_swap.length > 0) {
        var oldStates = this.m_states;
        var oldState = this['selected'] || null;
        var newState = this.m_swap[0];
        if (oldState != null && oldState !== newState) {
            oldState.onExit(newState);
        }
        
        this.m_states = this.m_swap;
        this.m_swap = null;
        this.m_selected = 0;
        for (var i = 0; i < this.m_states.length; i++) {
            this.m_states[i].setOwner(this.m_owner);
            this.m_states[i].init();
        }
        
        this.m_states[this.m_selected].onEnter(oldState);
        this.m_disposeStateList(oldStates, this.m_states.concat(this.m_swap || []));
    } else throw new Error();
};

/**
 * Update swap.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_updateSwap = function(step) {
    if (this.m_swap != null) {
        this.m_initStates();
    }
};

/**
 * Update states.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_updateStates = function(step) {
    if (this.m_states != null && this.m_states.length > 0) {
        this.m_states[this.m_selected].update(step);
    }
};

/**
 * Render states.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_renderStates = function() {
    if (this.m_states != null && this.m_states.length > 0) {
        this.m_states[this.m_selected].render();
    }
};

/**
 * Destroys all states.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_disposeStates = function() {
    this.m_disposeStateList(this.m_states);
    this.m_states = [];
    this.m_selected = 0;
};

/**
 * Destroys pending states.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_disposeSwap = function() {
    this.m_disposeStateList(this.m_swap, this.m_states);
    this.m_swap = null;
};

/**
 * Disposes each distinct state not included in keep exactly once.
 * The input arrays are not modified.
 *
 * @param {Array.<rune.state.State>} states List of states.
 * @param {Array.<rune.state.State>} [keep] List of states not to destroy.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_disposeStateList = function(states, keep) {
    if (Array.isArray(states) === true) {
        keep = keep || [];
        var disposed = [];
        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            if (state instanceof rune.state.State && keep.indexOf(state) < 0 && disposed.indexOf(state) < 0) {
                disposed.push(state);
                state.dispose();
                state.setOwner(null);
            }
        }
    }
};

/**
 * Validates a non-empty list of distinct State instances.
 *
 * @param {Array.<rune.state.State>} states List of states.
 *
 * @returns {boolean}
 * @private
 */
rune.state.States.prototype.m_validateStates = function(states) {
    if (Array.isArray(states) === false || states.length == 0) {
        return false;
    }

    for (var i = 0; i < states.length; i++) {
        if (states[i] instanceof rune.state.State === false || states.indexOf(states[i]) !== i) {
            return false;
        }
    }

    return true;
};
