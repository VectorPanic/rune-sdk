//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instances the Scene001 class.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 * 
 * The Scene001 class is a test scene within the Demo application.
 */
demo.scene.Scene001 = function() {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Particle emitter.
     *
     * @type {rune.particle.Emitter}
     * @private
     */
    this.m_emitter = null;
    
    /**
     * Demo selection menu.
     *
     * @type {rune.ui.VTMenu}
     * @private
     */
    this.m_menu = null;

    /**
     * Animated heading above the demo selection menu.
     *
     * @type {rune.text.BitmapField}
     * @private
     */
    this.m_title = null;
    
    /**
     * Selection sound.
     *
     * @type {rune.sound.Sound}
     * @private
     */
    this.m_sound = null;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.scene.Scene.
     */
    rune.scene.Scene.call(this, "scene001");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.scene.Scene001.prototype = Object.create(rune.scene.Scene.prototype);
demo.scene.Scene001.prototype.constructor = demo.scene.Scene001;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @override
 */
demo.scene.Scene001.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_sound = this.application.sounds.sound.get("demo_sound_beep", true);
    this.m_initMenu();
    this.m_initTitle();
    this.m_layoutMenu();
    this.m_initEmitter();
};

/**
 * @override
 */
demo.scene.Scene001.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    this.m_updateInput(step);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Create the menu.
 *
 * @return {undefined}
 * @private
 */
demo.scene.Scene001.prototype.m_initMenu = function() {
    this.m_menu = new rune.ui.VTMenu();
    this.m_menu.onSelect(this.m_onMenuSelect, this);
    this.m_menu.add("Scene001");
    this.m_menu.add("Scene002");
    this.m_menu.add("Scene003");
    this.stage.addChild(this.m_menu);
};

/**
 * Creates the heading and starts revealing its text automatically.
 *
 * @return {undefined}
 * @private
 */
demo.scene.Scene001.prototype.m_initTitle = function() {
    this.m_title = new rune.text.BitmapField("", rune.text.BitmapFormat.FONT_MEDIUM);
    this.m_title.autoSize = true;
    this.m_title.align = rune.text.BitmapField.ALIGN_CENTER;
    this.m_title.writer.start("SELECT SCENE", 60);
    this.stage.addChild(this.m_title);
};

/**
 * Centers the heading and menu text with sixteen pixels of spacing. The menu
 * pointer sits to the left of the centered text. Trailing list padding is
 * excluded from the block height, and full heading dimensions keep it stable
 * while characters are revealed.
 *
 * @return {undefined}
 * @private
 */
demo.scene.Scene001.prototype.m_layoutMenu = function() {
    var center = this.cameras.getCameraAt(0).viewport.center;
    var list = this.m_menu.getChildAt(0);
    var last = list.getChildAt(list.numChildren - 1);
    var height = this.m_title.height + 16 + list.y + last.bottom;
    this.m_title.x = Math.floor(center.x - this.m_title.width / 2);
    this.m_title.y = Math.floor(center.y - height / 2);
    this.m_menu.x = Math.floor(center.x - list.x - list.width / 2);
    this.m_menu.y = this.m_title.bottom + 16;
};

/**
 * Creates the emitter with its emission area centered above the heading.
 *
 * @return {undefined}
 * @private
 */
demo.scene.Scene001.prototype.m_initEmitter = function() {
    this.m_emitter = new rune.particle.Emitter(0, 0, 8, 8, {
        particles: [demo.entity.Particle],
        capacity: 92,
        accelerationY: 0.025,
        maxVelocityX:  1.25,
        minVelocityX: -1.25,
        maxVelocityY: -1.25,
        minVelocityY: -0.85,
        minRotation:  -2,
        maxRotation:   2
    });
    
    this.m_emitter.centerX = this.m_title.centerX;
    this.m_emitter.centerY = this.m_title.top - 16;
    this.stage.addChild(this.m_emitter);
};

/**
 * Checks if there is input.
 *
 * @param {number} step Fixed time step.
 *
 * @return {undefined}
 * @private
 */
demo.scene.Scene001.prototype.m_updateInput = function(step) {
    if (this.keyboard.justPressed("W") || this.gamepads.stickLeftJustUp) {
        if (this.m_menu.up()) {
            this.m_sound.play();
            this.m_emitter.emit(10);
        }
    }
    
    if (this.keyboard.justPressed("S") || this.gamepads.stickLeftJustDown) {
        if (this.m_menu.down()) {
            this.m_sound.play();
            this.m_emitter.emit(10);
        }
    }
    
    if (this.keyboard.justPressed("SPACE") || this.gamepads.justPressed(9)) {
        this.m_menu.select();
        this.m_emitter.emit(64);
    }
};

/**
 * Handler function for when a menu selection is made.
 *
 * @param {rune.ui.VTListElement} element The list element that was selected.
 *
 * @return {undefined}
 * @private
 */
demo.scene.Scene001.prototype.m_onMenuSelect = function(element) {
    switch (element.text) {
        case "Scene001":
            this.application.scenes.select(1);
            break;
        
        case "Scene002":
            this.application.scenes.select(2);
            break;
            
        case "Scene003":
        this.application.scenes.select(3);
        break;
    }
};
