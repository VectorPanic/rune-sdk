//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new State object.
 *
 * @constructor
 * @abstract
 *
 * @param {string} [name="undefined"] Unique (descriptive) identifier.
 * 
 * @class
 * @classdesc
 * 
 * The State class represents an internal state of an object. The class can be 
 * used to isolate and / or modulate specific logic such as behavior or 
 * actions. The purpose is to simplify logic and make it reusable between 
 * objects with the same public interface. Note that the class is abstract and 
 * must therefore be used as a superclass for the actual State objects to be 
 * used.
 */
rune.state.State = function(name) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Represents a unique ID for the current state.
     *
     * @type {string}
     * @private
     */
    this.m_name = name || "undefined";

    /**
     * Reference to the object that is in the current state.
     *
     * @type {Object}
     * @private
     */
    this.m_owner = null;
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Represents a unique ID for the current state.
 *
 * @member {string} name
 * @memberof rune.state.State
 * @instance
 * @readonly
 */
Object.defineProperty(rune.state.State.prototype, "name", {
    /**
     * @this rune.state.State
     * @ignore
     */
    get : function() {
        return this.m_name;
    }
});

/**
 * Reference to the object that is in the current state. This value is constant 
 * and cannot change during the existence of the state.
 *
 * @member {Object} owner
 * @memberof rune.state.State
 * @instance
 * @readonly
 */
Object.defineProperty(rune.state.State.prototype, "owner", {
    /**
     * @this rune.state.State
     * @ignore
     */
    get : function() {
        return this.m_owner;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Is activated when the state machine selects the current state.
 *
 * @param {rune.state.State} state The old state.
 *
 * @return {undefined}
 */
rune.state.State.prototype.onEnter = function(state) {
    //OVERRIDE
};

/**
 * Is activated when the state machine switches to another state.
 *
 * @param {rune.state.State} state The new state.
 *
 * @return {undefined}
 */
rune.state.State.prototype.onExit = function(state) {
    //OVERRIDE
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Called when the state is initiated by the state machine. Override this 
 * method if the state, for example, needs to create objects or execute logic 
 * as soon as the state is created.
 *
 * @return {undefined}
 */
rune.state.State.prototype.init = function() {
    //OVERRIDE
};

/**
 * Called for each tick (frame). Override and write custom logic for the 
 * current State object, ie the program code that is executed when the owner 
 * object is in this state.
 *
 * @param {number} step Current time step.
 *
 * @return {undefined}
 */
rune.state.State.prototype.update = function(step) {
    //OVERRIDE
};

/**
 * It is unusual for a state to need its own rendering code, but this is 
 * possible by overriding this method.
 *
 * @return {undefined}
 */
rune.state.State.prototype.render = function() {
    //OVERRIDE
};

/**
 * Called when the state machine destroys the current state object. Override 
 * and write your own dispose routine. This is necessary if the state 
 * creates its own object instances. Incorrect or inadequate deallocation 
 * results in memory leaks.
 *
 * @return {undefined}
 */
rune.state.State.prototype.dispose = function() {
    //OVERRIDE
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Assign the object that owns the current state. Note that this method is 
 * internal and only intended for use by classes within the same package.
 *
 * @param {Object} owner The state owner.
 *
 * @return {undefined}
 * @package
 * @ignore
 */
rune.state.State.prototype.setOwner = function(owner) {
    this.m_owner = owner;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Class constructor
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.state.State.prototype.m_construct = function() {
    //OVERRIDE
};