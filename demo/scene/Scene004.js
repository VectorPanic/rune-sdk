//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instances the Scene004 class.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 * 
 * The Scene004 class is a test scene within the Demo application.
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
     * Scroll speed.
     *
     * @type {rune.geom.Point}
     * @private
     */
    this.m_speed = new rune.geom.Point(0,0);
    
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
};

/**
 * @inheritDoc
 */
demo.scene.Scene004.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    this.m_updateOffset(step);
    this.m_updateInput(step);
};

/**
 * @inheritDoc
 */
demo.scene.Scene004.prototype.dispose = function() {
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
        "rune_image_logo_text_64x32"
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
            "W / S : DECREASE / INCREASE Y SPEED",
            "A / D : DECREASE / INCREASE X SPEED",
            "EACH PRESS CHANGES SPEED BY 1",
            "SCROLLING CONTINUES AFTER RELEASE",
            "ESC   : MAIN MENU"
        ].join("\n"), rune.text.BitmapFormat.FONT_SMALL);
        this.m_controls.autoSize = true;
        this.m_controls.x = 8;
        this.m_controls.y = 8;
        this.cameras.getCameraAt(0).addChild(this.m_controls);
    } else throw new Error();
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
    if (this.keyboard.justPressed("W")) {
        this.m_speed.y -= this.m_speedStep;
    }
    
    if (this.keyboard.justPressed("S")) {
        this.m_speed.y += this.m_speedStep;
    }
    
    if (this.keyboard.justPressed("A")) {
        this.m_speed.x -= this.m_speedStep;
    }
    
    if (this.keyboard.justPressed("D")) {
        this.m_speed.x += this.m_speedStep;
    }
    
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
