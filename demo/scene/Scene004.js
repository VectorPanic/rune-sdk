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
        "rune_texture_logo_text_64x32"
    );
    
    this.stage.addChild(this.m_background);
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
    if (this.keyboard.pressed("ESCAPE")) {
        this.application.scenes.select(0);
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