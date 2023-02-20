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
     * Demo selection menu.
     *
     * @type {rune.ui.VTMenu}
     * @private
     */
    this.m_menu = null;
    
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
    this.m_menu.center = this.cameras.getCameraAt(0).viewport.center;
    this.stage.addChild(this.m_menu);
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
    if (this.keyboard.justPressed("W")) {
        if (this.m_menu.up()) {
            this.m_sound.play();
        }
    }
    
    if (this.keyboard.justPressed("S") || this.gamepads.justPressed(8)) {
        if (this.m_menu.down()) {
            this.m_sound.play();
        }
    }
    
    if (this.keyboard.justPressed("SPACE") || this.gamepads.justPressed(9)) {
        this.m_menu.select();
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
    }
};