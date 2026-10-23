//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Scene004 object.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 *
 * Demonstrates a repeated texture with adjustable scrolling speed.
 */
demo.scene.Scene004 = function() {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Background texture.
     *
     * @type {rune.display.RepeatedGraphic}
     * @private
     */
    this.m_background;

    /**
     * Describes the scene's keyboard controls.
     *
     * @type {rune.text.BitmapField}
     * @private
     */
    this.m_controls;

    /**
     * Direction buttons controlling the background scroll speed.
     *
     * @type {rune.ui.ButtonGroup}
     * @private
     */
    this.m_buttons = null;

    /**
     * Scroll speed.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_speed = new rune.geom.Point(0, 0);

    /**
     * Scroll speed step.
     *
     * @type {number}
     * @private
     */
    this.m_speedStep = 1;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.scene.Scene.
     */
    rune.scene.Scene.call(this, "scene004");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.scene.Scene004.prototype = Object.create(rune.scene.Scene.prototype);
demo.scene.Scene004.prototype.constructor = demo.scene.Scene004;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.scene.Scene004.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_initBackground();
    this.m_initControls();
    this.m_initButtons();
};

/**
 * @inheritDoc
 */
demo.scene.Scene004.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    this.m_updateButtons();
    this.m_updateOffset(step);
    this.m_updateInput(step);
};

/**
 * @inheritDoc
 */
demo.scene.Scene004.prototype.dispose = function() {
    this.m_disposeButtons();
    this.m_disposeControls();
    this.m_disposeBackground();
    rune.scene.Scene.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Create background texture.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_initBackground = function() {
    this.m_background = new rune.display.RepeatedGraphic(
        0,
        0,
        this.application.width,
        this.application.height,
        "demo_texture_checkered_16x16"
    );

    this.stage.addChild(this.m_background);
};

/**
 * Creates a keyboard reference fixed to the camera.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_initControls = function() {
    this.m_disposeControls();
    if (this.m_controls == null) {
        this.m_controls = new rune.text.BitmapField([
            "CONTROLS (H: SHOW / HIDE)",
            "LEFT / A : PREVIOUS BUTTON",
            "RIGHT / D: NEXT BUTTON",
            "ENTER    : PRESS / RELEASE BUTTON",
            "UP / DOWN BUTTONS CHANGE Y SPEED",
            "LEFT / RIGHT BUTTONS CHANGE X SPEED",
            "EACH ACTIVATION CHANGES SPEED BY 1",
            "SCROLLING CONTINUES AFTER RELEASE",
            "ESC   : MAIN MENU"
        ].join("\n"), rune.text.BitmapFormat.FONT_SMALL);
        this.m_controls.autoSize = true;
        this.m_controls.x = 8;
        this.m_controls.y = 8;
        this.cameras.getCameraAt(0).addChild(this.m_controls);
    } else {
        throw new Error();
    }
};

/**
 * Creates four direction buttons fixed to the camera.
 * Activation changes the corresponding scroll speed by one step.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_initButtons = function() {
    this.m_buttons = new rune.ui.ButtonGroup(8, this.application.height - 24);
    this.cameras.getCameraAt(0).addChild(this.m_buttons);

    var left = new demo.ui.ButtonLeft(0, 0);
    left.onActivate(function() {
        this.m_speed.x -= this.m_speedStep;
    }, this);

    var up = new demo.ui.ButtonUp(20, 0);
    up.onActivate(function() {
        this.m_speed.y -= this.m_speedStep;
    }, this);

    var down = new demo.ui.ButtonDown(40, 0);
    down.onActivate(function() {
        this.m_speed.y += this.m_speedStep;
    }, this);

    var right = new demo.ui.ButtonRight(60, 0);
    right.onActivate(function() {
        this.m_speed.x += this.m_speedStep;
    }, this);

    this.m_buttons.addChild(left);
    this.m_buttons.addChild(up);
    this.m_buttons.addChild(down);
    this.m_buttons.addChild(right);
};

/**
 * Navigates the buttons and forwards Enter press and release events.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_updateButtons = function() {
    if (this.keyboard.justPressed("LEFT") || this.keyboard.justPressed("A")) {
        this.m_buttons.previous();
    }
    if (this.keyboard.justPressed("RIGHT") || this.keyboard.justPressed("D")) {
        this.m_buttons.next();
    }
    if (this.keyboard.justPressed("ENTER")) {
        this.m_buttons.press();
    }
    if (this.keyboard.justReleased("ENTER")) {
        this.m_buttons.release();
    }
};

/**
 * Update background texture.
 *
 * @param {number} step Fixed time step.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_updateOffset = function(step) {
    this.m_background.offsetX += this.m_speed.x;
    this.m_background.offsetY += this.m_speed.y;
};

/**
 * Update keyboard input.
 *
 * @param {number} step Fixed time step.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_updateInput = function(step) {
    if (this.keyboard.justPressed("H")) {
        this.m_toggleControls();
    }

    if (this.keyboard.pressed("ESCAPE")) {
        this.application.scenes.select(0);
    }
};

/**
 * Toggles the visibility of the keyboard reference.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_toggleControls = function() {
    this.m_controls.visible = !this.m_controls.visible;
};

/**
 * Removes and destroys the direction buttons.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_disposeButtons = function() {
    if (this.m_buttons != null) {
        this.m_buttons.parent.removeChild(this.m_buttons, true);
        this.m_buttons = null;
    }
};

/**
 * Dispose background texture.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_disposeBackground = function() {
    if (this.m_background instanceof rune.display.RepeatedGraphic) {
        this.m_background.parent.removeChild(this.m_background, true);
        this.m_background = null;
    }
};

/**
 * Removes and destroys the keyboard reference.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene004.prototype.m_disposeControls = function() {
    if (this.m_controls instanceof rune.text.BitmapField) {
        this.m_controls.parent.removeChild(this.m_controls, true);
        this.m_controls = null;
    }
};
