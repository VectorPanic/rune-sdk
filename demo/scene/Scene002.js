//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Scene002 object.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 *
 * Demonstrates multiple cameras and keyboard/gamepad controls.
 */
demo.scene.Scene002 = function() {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Contains the camera objects used by the scene.
     *
     * @type {Array.<rune.camera.Camera>}
     * @private
     */
    this.m_cams = null;

    /**
     * Sprite representing a game controller and its input.
     *
     * @type {demo.entity.Controller}
     * @private
     */
    this.m_controller = null;

    /**
     * Keyboard reference displayed above all camera panes.
     * @type {rune.text.BitmapField}
     * @private
     */
    this.m_controls = null;

    /**
     * Whether the keyboard reference is enabled.
     * @type {boolean}
     * @private
     */
    this.m_controlsVisible = true;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.scene.Scene.
     */
    rune.scene.Scene.call(this, "scene002");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.scene.Scene002.prototype = Object.create(rune.scene.Scene.prototype);
demo.scene.Scene002.prototype.constructor = demo.scene.Scene002;

//------------------------------------------------------------------------------
// Override public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.scene.Scene002.prototype.onSelect = function(scene) {
    rune.scene.Scene.prototype.onSelect.call(this, scene);
    this.m_controls.visible = this.m_controlsVisible;
};

/**
 * @inheritDoc
 */
demo.scene.Scene002.prototype.onDeselect = function(scene) {
    this.m_controls.visible = false;
    rune.scene.Scene.prototype.onDeselect.call(this, scene);
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.scene.Scene002.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_initGamepad();
    this.m_initControls();
};

/**
 * @inheritDoc
 */
demo.scene.Scene002.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    this.m_updateInput(step);
};

/**
 * @inheritDoc
 */
demo.scene.Scene002.prototype.dispose = function() {
    this.m_disposeControls();
    rune.scene.Scene.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.scene.Scene002.prototype.m_initCamera = function() {
    this.cameras.splitScreen(4);

    var zooms = [0.25, 0.5, 1, 2];
    this.m_cams = [];

    for (var i = 0; i < zooms.length; i++) {
        var camera = this.cameras.getCameraAt(i);
        camera.viewport.zoom = zooms[i];
        camera.viewport.center = this.application.screen.center;
        this.m_cams.push(camera);
    }

    /**
     * Camera selected by the keyboard controls.
     *
     * @type {rune.camera.Camera}
     * @private
     */
    this.m_cam = this.m_cams[0];
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the game controller.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_initGamepad = function() {
    this.m_disposeGamepad();
    if (this.m_controller == null) {
        this.m_controller = new demo.entity.Controller();
        this.m_controller.center = this.application.screen.center;
        this.m_controller.scaleX = 0;
        this.m_controller.scaleY = 0;
        this.m_controller.rotation = 360;

        this.tweens.create({
            target: this.m_controller,
            scope: this,
            duration: 2500,
            onUpdate: function(obj) {
                obj.center = this.application.screen.center;
            },
            args: {
                scaleX: 1,
                scaleY: 1,
                rotation: 0
            }
        });

        this.stage.addChild(this.m_controller);
    }
};

/**
 * Creates a screen-fixed reference for the keyboard controls.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_initControls = function() {
    this.m_disposeControls();
    if (this.m_controls == null) {
        this.m_controls = new rune.text.BitmapField([
            "CONTROLS (H: SHOW / HIDE)",
            "1-4   : SELECT CAMERA",
            "WASD  : MOVE CAMERA ON SCREEN",
            "Q / E : ROTATE CAMERA",
            "SHIFT + WASD / Q / E: MOVE / ROTATE CONTROLLER",
            "ARROWS: MOVE CAMERA VIEW",
            "Z / X : ZOOM IN / OUT",
            "T     : TOGGLE FOLLOW CONTROLLER",
            "M     : MIRROR CAMERA",
            "F / V / G: FLASH / SHAKE / GLITCH",
            "I / O : FADE IN / OUT",
            "R     : RESET CAMERAS / CONTROLLER POSITION",
            "ESC   : MAIN MENU"
        ].join("\n"), rune.text.BitmapFormat.FONT_SMALL);
        this.m_controls.autoSize = true;
        this.m_controls.x = 8;
        this.m_controls.y = 8;
        this.m_controls.visible = false;
        this.application.screen.addChild(this.m_controls);
    } else {
        throw new Error();
    }
};

/**
 * Updates user input.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInput = function() {
    if (this.keyboard.justPressed("H")) {
        this.m_toggleControls();
    }
    this.m_updateInputSelect();
    this.m_updateInputFlash();
    this.m_updateInputTarget();
    this.m_updateInputFade();
    this.m_updateInputShake();
    this.m_updateInputGlitch();
    this.m_updateInputMove();
    this.m_updateInputView();
    this.m_updateInputReset();
    this.m_updateInputMirror();
    this.m_updateInputZoom();
    this.m_updateSceneSelect();
};

/**
 * Camera selection.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputSelect = function() {
    if (this.keyboard.justPressed("ONE")) {
        this.m_cam = this.m_cams[0];
        this.m_cam.flash.start();
    } else if (this.keyboard.justPressed("TWO")) {
        this.m_cam = this.m_cams[1];
        this.m_cam.flash.start();
    } else if (this.keyboard.justPressed("THREE")) {
        this.m_cam = this.m_cams[2];
        this.m_cam.flash.start();
    } else if (this.keyboard.justPressed("FOUR")) {
        this.m_cam = this.m_cams[3];
        this.m_cam.flash.start();
    }
};

/**
 * Camera flash effect.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputFlash = function() {
    if (this.keyboard.justPressed("F")) {
        this.m_cam.flash.start();
    }
};

/**
 * Whether the camera should be able to move freely or follow the game
 * control object.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputTarget = function() {
    if (this.keyboard.justPressed("T")) {
        if (this.m_cam.targets.length == 0) {
            this.m_cam.targets.add(this.m_controller);
        } else {
            this.m_cam.targets.clear();
        }
    }
};

/**
 * Camera fade in/out.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputFade = function() {
    if (this.keyboard.justPressed("I")) {
        this.m_cam.fade.in(2500);
    } else if (this.keyboard.justPressed("O")) {
        this.m_cam.fade.out(2500);
    }
};

/**
 * Camera shake effect.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputShake = function() {
    if (this.keyboard.justPressed("V")) {
        this.m_cam.shake.start(2500, 5, 5, true);
    }
};

/**
 * Camera glitch effect. Press G to distort the selected camera for 750 ms.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputGlitch = function() {
    if (this.keyboard.justPressed("G")) {
        this.m_cam.glitch.start(750, 8);
    }
};

/**
 * Move the game controller or current camera.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputMove = function() {
    var obj;
    if (this.keyboard.pressed("SHIFT")) {
        obj = this.m_controller;
    } else {
        obj = this.m_cam;
    }

    if (this.keyboard.pressed("A")) {
        obj.x--;
    } else if (this.keyboard.pressed("D")) {
        obj.x++;
    }

    if (this.keyboard.pressed("W")) {
        obj.y--;
    } else if (this.keyboard.pressed("S")) {
        obj.y++;
    }

    if (this.keyboard.pressed("Q")) {
        obj.rotation--;
    } else if (this.keyboard.pressed("E")) {
        obj.rotation++;
    }
};

/**
 * Move camera viewport.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputView = function() {
    if (this.keyboard.pressed("LEFT")) {
        this.m_cam.viewport.x--;
    } else if (this.keyboard.pressed("RIGHT")) {
        this.m_cam.viewport.x++;
    }

    if (this.keyboard.pressed("UP")) {
        this.m_cam.viewport.y--;
    } else if (this.keyboard.pressed("DOWN")) {
        this.m_cam.viewport.y++;
    }
};

/**
 * Resets all cameras and moves the game controller to its original position.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputReset = function() {
    if (this.keyboard.pressed("R")) {
        this.m_initCamera();
        this.m_controller.center = this.application.screen.center;
    }
};

/**
 * Mirror the camera.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputMirror = function() {
    if (this.keyboard.justPressed("M")) {
        this.m_cam.flippedX = !this.m_cam.flippedX;
    }
};

/**
 * Zoom in/out.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInputZoom = function() {
    if (this.keyboard.pressed("Z")) {
        this.m_cam.viewport.zoomBy(0.01);
    } else if (this.keyboard.pressed("X")) {
        this.m_cam.viewport.zoomBy(-0.01);
    }
};

/**
 * Scene select.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateSceneSelect = function() {
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
demo.scene.Scene002.prototype.m_toggleControls = function() {
    this.m_controlsVisible = !this.m_controlsVisible;
    this.m_controls.visible = this.m_controlsVisible;
};

/**
 * Prepare the game controller object for removal.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_disposeGamepad = function() {
    if (this.m_controller instanceof demo.entity.Controller) {
        this.m_controller.dispose();
        this.m_controller = null;
    }
};

/**
 * Removes and destroys the keyboard reference.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_disposeControls = function() {
    if (this.m_controls instanceof rune.text.BitmapField) {
        this.m_controls.parent.removeChild(this.m_controls, true);
        this.m_controls = null;
    }
};
