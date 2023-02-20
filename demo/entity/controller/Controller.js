//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object of the Controller class.
 *
 * @constructor
 * @extends rune.display.Sprite
 *
 * @param {number} [playerID=0] Player ID.
 *
 * @class
 * @classdesc
 * 
 * A visual representation of a game controller's input data.
 */
demo.entity.Controller = function(playerID) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * List of game controller buttons.
     *
     * @type {Array.<demo.entity.ControllerButton>}
     */
    this.m_buttons = [];
    
    /**
     *  Reference to the Gamepad API.
     *
     *  @type {rune.input.Gamepad}
     */
    this.m_gamepad = null;
    
    /**
     *  Player ID (0-3).
     *
     *  @type {number}
     */
    this.m_playerID = playerID || 0;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Sprite.
     */
    rune.display.Sprite.call(this, 0, 0, 159, 87, "demo_controller_159x87");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Controller.prototype = Object.create(rune.display.Sprite.prototype);
demo.entity.Controller.prototype.constructor = demo.entity.Controller;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @override
 */
demo.entity.Controller.prototype.init = function() {
    rune.display.Sprite.prototype.init.call(this);
    this.m_initGamepad();
    this.m_initButtons();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates a reference to the GamePad API.
 *
 * @return {undefined}
 * @private
 */
demo.entity.Controller.prototype.m_initGamepad = function() {
    if (this.m_gamepad == null && this.gamepads != null) {
        this.m_gamepad = this.gamepads.get(this.m_playerID);
    }
};

/**
 * Creates the control's buttons.
 *
 * @return {undefined}
 * @private
 */
demo.entity.Controller.prototype.m_initButtons = function() {
    this.m_initButtonsConfig();
    this.m_initButtonsGraphics();
};

/**
 * Creates a configuration of buttons to be used.
 *
 * @return {undefined}
 * @private
 */
demo.entity.Controller.prototype.m_initButtonsConfig = function() {
    this.m_buttons[0] = {gfx: "demo_controller_button_yellow_15x15",            x: 118, y: 52};
    this.m_buttons[1] = {gfx: "demo_controller_button_red_15x15",               x: 133, y: 38};
    this.m_buttons[2] = {gfx: "demo_controller_button_green_15x15",             x: 103, y: 38};
    this.m_buttons[3] = {gfx: "demo_controller_button_blue_15x15",              x: 118, y: 24};

    this.m_buttons[4] = {gfx: "demo_controller_button_shoulder_left_40x10",     x: 16,  y: 0};
    this.m_buttons[5] = {gfx: "demo_controller_button_shoulder_right_40x10",    x: 103, y: 0};

    this.m_buttons[8] = {gfx: "demo_controller_button_select_start_16x16",      x: 57,  y: 43};
    this.m_buttons[9] = {gfx: "demo_controller_button_select_start_16x16",      x: 74,  y: 43};

    this.m_buttons[12] = {gfx: "demo_controller_button_dpad_up_11x10",          x: 28,  y: 29};
    this.m_buttons[13] = {gfx: "demo_controller_button_dpad_down_11x10",        x: 28,  y: 52};
    this.m_buttons[14] = {gfx: "demo_controller_button_dpad_left_8x13",         x: 20,  y: 39};
    this.m_buttons[15] = {gfx: "demo_controller_button_dpad_right_8x13",        x: 39,  y: 39};
};

/**
 * Creates the control's Button object.
 *
 * @return {undefined}
 * @private
 */
demo.entity.Controller.prototype.m_initButtonsGraphics = function() {
    for (var i = 0; i < this.m_buttons.length; i++) {
        if (this.m_buttons[i] != null) {
            this.addChild(new demo.entity.ControllerButton(
                this.m_buttons[i].x || 0,
                this.m_buttons[i].y || 0,
                this.m_gamepad,
                i || 0,
                this.m_buttons[i].gfx
            ));
        }
    }
};