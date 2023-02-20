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
 * Load a new batch of states. A "batch" is represented by a list.
 *
 * @param {Array.<rune.state.State>} states List of instantiated states.
 *
 * @throws {Error} If invalid or empty batch.
 *
 * @returns {undefined}
 */
rune.state.States.prototype.load = function(states) {
    if (Array.isArray(states) === true && states.length > 0) {
        this.m_swap = states;
    } else throw new Error();
};

/**
 * Selects and activates a state based on its name.
 *
 * @param {string} name Name of state to be selected.
 *
 * @returns {boolean} Whether a state could be selected.
 */
rune.state.States.prototype.select = function(name) {
    for (var i = 0; i < this.m_states.length; i++) {
        if (this.m_states[i]['name'].toUpperCase() == name.toUpperCase()) {
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
    this.m_disposeStates();
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
    this.m_disposeStates();
    if (this.m_swap != null && this.m_swap.length > 0) {
        this.m_states = this.m_swap;
        this.m_selected = 0;
        for (var i = 0; i < this.m_states.length; i++) {
            this.m_states[i].setOwner(this.m_owner);
            this.m_states[i].init();
        }
        
        this.m_swap = null;
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
    if (this.m_states != null) {
        for (var i = 0; i < this.m_states.length; i++) {
            this.m_states[i].dispose();
            this.m_states[i] = null;
        }
        
        this.m_states = null;
        this.m_selected = 0;
    }
};