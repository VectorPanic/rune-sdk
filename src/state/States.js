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
     * Guards cleanup against recursive dispose() calls from state callbacks.
     *
     * @type {boolean}
     * @private
     */
    this.m_disposing = false;

    /**
     * Whether initialization or a transition is invoking lifecycle callbacks.
     *
     * @type {boolean}
     * @private
     */
    this.m_transitioning = false;

    /**
     * Latest callback selection, deferred until the next update.
     *
     * @type {?rune.state.State}
     * @private
     */
    this.m_requested = null;

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
        var previous = this.m_swap;
        this.m_requested = null;
        this.m_swap = batch;
        this.m_disposeStateList(previous, this.m_states.concat(batch));
    } else throw new Error("Invalid state batch");
};

/**
 * Selects and activates a state based on its name. Aborts if onExit()
 * disposes or replaces the active list. Selections requested from lifecycle
 * callbacks are queued for the next update; the latest valid request wins.
 * A later direct selection or load supersedes a queued request.
 *
 * @param {string} name Name of state to be selected.
 *
 * @returns {boolean} Whether a state could be selected without canceling the transition.
 */
rune.state.States.prototype.select = function(name) {
    name = (name == null) ? "" : name.toString().toUpperCase();
    var states = this.m_states;
    if (states == null) return false;

    for (var i = 0; i < states.length; i++) {
        if (states[i]['name'].toUpperCase() == name) {
            if (this.m_transitioning) {
                this.m_requested = states[i];
                return true;
            }
            this.m_requested = null;
            if (this.m_selected != i) {
                var a = i;
                var b = this.m_selected;
                this.m_transitioning = true;
                try {
                    states[b]['onExit'](states[a]);
                    if (this.m_states !== states) return false;
                    this.m_selected = a;
                    states[a]['onEnter'](states[b]);
                } catch (error) {
                    this.m_abortTransition(error);
                } finally {
                    this.m_transitioning = false;
                }
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
    var states = this.m_states;
    var requested = this.m_requested;
    this.m_requested = null;
    this.m_updateSwap(step);
    if (requested != null && this.m_states === states && states.indexOf(requested) >= 0) {
        this.select(requested['name']);
    }
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
 * Disposes active and pending states, releasing the machine owner.
 * Cleanup continues after callback failures, then rethrows the first error.
 *
 * @returns {undefined}
 * @ignore
 */
rune.state.States.prototype.dispose = function() {
    if (this.m_disposing) return;

    try {
        this.m_disposeAllStates();
    } finally {
        this.m_owner = null;
    }
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Initiates a new batch. A failed lifecycle hook aborts the transition,
 * attempts cleanup of all owned states and propagates the original error.
 * Initialization stops if a callback disposes or replaces the active list.
 *
 * @throws {Error} In case of invalid state swap.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_initStates = function() {
    if (this.m_swap == null || this.m_swap.length === 0) {
        throw new Error("Invalid state swap");
    }
    var oldStates = this.m_states;
    var transitioning = this.m_transitioning;
    this.m_transitioning = true;
    try {
        var oldState = this['selected'] || null;
        var newState = this.m_swap[0];
        if (oldState != null && oldState !== newState) {
            oldState.onExit(newState);
            if (this.m_states !== oldStates) return;
        }

        var states = this.m_swap;
        this.m_states = states;
        this.m_swap = null;
        this.m_requested = null;
        this.m_selected = 0;
        for (var i = 0; this.m_states === states && i < states.length; i++) {
            states[i].setOwner(this.m_owner);
            states[i].init();
        }

        if (this.m_states === states) {
            states[this.m_selected].onEnter(oldState);
        }
        var retired = oldStates;
        oldStates = null;
        var keep = this.m_states.concat(this.m_swap || []);
        if (this.m_states !== states) {
            // The canceled batch has already been cleaned up. Do not dispose
            // its shared states again while retiring the previous list.
            keep = keep.concat(states);
        }
        this.m_disposeStateList(retired, keep);
    } catch (error) {
        this.m_abortTransition(error, oldStates);
    } finally {
        this.m_transitioning = transitioning;
    }
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
    if (this.m_hasPendingStates()) {
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
 * Detaches and cleans up active, pending and optional retired states once each.
 * Loads requested by cleanup callbacks are drained without initialization.
 * Every cleanup is attempted before the first error is rethrown.
 *
 * @param {Array.<rune.state.State>} [retired] Previous states awaiting cleanup.
 *
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_disposeAllStates = function(retired) {
    if (this.m_disposing) return;

    this.m_disposing = true;
    var disposed = [];
    var failure = null;
    try {
        do {
            var batch = (retired || []).concat(this.m_states, this.m_swap || []);
            retired = null;
            this.m_states = [];
            this.m_swap = null;
            this.m_requested = null;
            this.m_selected = 0;
            var states = [];
            for (var i = 0; i < batch.length; i++) {
                if (disposed.indexOf(batch[i]) < 0) {
                    disposed.push(batch[i]);
                    states.push(batch[i]);
                }
            }
            try {
                this.m_disposeStateList(states);
            } catch (error) {
                if (failure == null) failure = {error: error};
            }
        } while (this.m_hasPendingStates());
    } finally {
        this.m_disposing = false;
    }
    if (failure != null) throw failure.error;
};

/**
 * Clears a failed transition while preserving the original lifecycle error.
 * The machine retains its owner so a fresh batch can be loaded after recovery.
 *
 * @param {*} error Original lifecycle error.
 * @param {Array.<rune.state.State>} [retired] Previous states awaiting cleanup.
 *
 * @throws {*} The original error after cleanup attempts finish.
 * @returns {undefined}
 * @private
 */
rune.state.States.prototype.m_abortTransition = function(error, retired) {
    try {
        this.m_disposeAllStates(retired);
    } catch (cleanupError) {
        // Cleanup errors must not hide the failed transition's original error.
    }
    throw error;
};

/**
 * Checks pending requests after lifecycle callbacks have run.
 *
 * @returns {boolean}
 * @private
 */
rune.state.States.prototype.m_hasPendingStates = function() {
    return this.m_swap != null;
};

/**
 * Disposes each distinct state not included in keep exactly once.
 * The input arrays are not modified. Owner references are released even if
 * dispose() throws. Remaining states are attempted before rethrowing the first error.
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
        var failure = null;
        for (var i = 0; i < states.length; i++) {
            var state = states[i];
            if (state instanceof rune.state.State && keep.indexOf(state) < 0 && disposed.indexOf(state) < 0) {
                disposed.push(state);
                try {
                    state.dispose();
                } catch (error) {
                    if (failure == null) failure = {error: error};
                } finally {
                    state.setOwner(null);
                }
            }
        }
        if (failure != null) throw failure.error;
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
