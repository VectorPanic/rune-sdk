//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instances the Scene002 class.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 * 
 * The Scene002 class is a test scene within the Demo application.
 */
demo.scene.Scene002 = function() {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Contains the camera objects used by the scene.
     *
     * @type {Array}
     * @private
     */
    this.m_cams = null;

    /**
     * Sprite representing a game controller and its input.
     *
     * @type {rune.data.Logo}
     * @private
     */
    this.m_controller = null;

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
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @override
 */
demo.scene.Scene002.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_initGamepad();
};

/**
 * @override
 */
demo.scene.Scene002.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    this.m_updateInput(step);
};

//------------------------------------------------------------------------------
// Override protected prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @override
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
 * Updates user input.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene002.prototype.m_updateInput = function() {
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
