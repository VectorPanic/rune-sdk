//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Scene003 object.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 *
 * Demonstrates animated astronauts, collisions and automatic camera framing.
 */
demo.scene.Scene003 = function() {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * A group of astronauts sprites.
     *
     * @type {demo.entity.Astronauts}
     * @private
     */
    this.m_astronauts;

    /**
     * Displays the current number of astronauts.
     *
     * @type {rune.ui.Counter}
     * @private
     */
    this.m_counter;

    /**
     * Describes the scene's keyboard controls.
     *
     * @type {rune.text.BitmapField}
     * @private
     */
    this.m_controls;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.scene.Scene.
     */
    rune.scene.Scene.call(this, "scene003");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.scene.Scene003.prototype = Object.create(rune.scene.Scene.prototype);
demo.scene.Scene003.prototype.constructor = demo.scene.Scene003;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.scene.Scene003.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_initAstronauts();
    this.m_initCounter();
    this.m_initControls();
    this.m_initAutoZoom();
};

/**
 * @inheritDoc
 */
demo.scene.Scene003.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    this.m_updateCounter();
    var camera = this.cameras.getCameraAt(0);

    // TOGGLE KEYBOARD REFERENCE
    if (this.keyboard.justPressed("H")) {
        this.m_toggleControls();
    }

    // TOGGLE AUTOMATIC CAMERA ZOOM
    if (this.keyboard.justPressed("A")) {
        this.m_toggleAutoZoom();
    }

    // CAMERA MOVEMENT
    if (this.keyboard.pressed("RIGHT")) {
        camera.viewport.x += 1;
    }

    if (this.keyboard.pressed("LEFT")) {
        camera.viewport.x -= 1;
    }

    if (this.keyboard.pressed("UP")) {
        camera.viewport.y -= 1;
    }

    if (this.keyboard.pressed("DOWN")) {
        camera.viewport.y += 1;
    }

    // CAMERA ZOOM OUT
    if (!camera.autoZoom.enabled && this.keyboard.pressed("X")) {
        camera.viewport.zoomBy(-0.01);
    }

    // CAMERA ZOOM IN
    if (!camera.autoZoom.enabled && this.keyboard.pressed("Z")) {
        camera.viewport.zoomBy(0.01);
    }

    // CAMERA RESET
    if (this.keyboard.pressed("R")) {
        camera.autoZoom.enabled = false;
        camera.targets.clear();
        camera.viewport.zoom = 1;
        camera.viewport.x = 0;
        camera.viewport.y = 0;
    }

    // BACK TO MAIN MENU
    if (this.keyboard.justPressed("ESCAPE")) {
        this.application.transitions.select(0, new rune.transition.Iris({
            duration: 600
        }));
    }
};

/**
 * @inheritDoc
 */
demo.scene.Scene003.prototype.dispose = function() {
    this.m_disposeControls();
    this.m_disposeCounter();
    this.m_disposeAstronauts();
    rune.scene.Scene.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Configures automatic framing without enabling it. Press A to toggle it;
 * manual zoom remains available while automatic zoom is disabled.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_initAutoZoom = function() {
    var autoZoom = this.cameras.getCameraAt(0).autoZoom;
    autoZoom.min = 0.25;
    autoZoom.max = 3.0;
    autoZoom.padding = 32;
    autoZoom.smoothing = 250;
};

/**
 * Creates, and adds the group of astronauts.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_initAstronauts = function() {
    this.m_disposeAstronauts();
    if (this.m_astronauts == null) {
        this.m_astronauts = this.groups.add(new demo.entity.Astronauts());
        this.m_astronauts.useQuadtree = true;
        this.m_astronauts.add();
    } else {
        throw new Error();
    }
};

/**
 * Creates the astronaut counter in the camera's upper-left corner.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_initCounter = function() {
    this.m_disposeCounter();
    if (this.m_counter == null) {
        this.m_counter = new rune.ui.Counter();
        this.m_counter.x = 8;
        this.m_counter.y = 8;
        this.cameras.getCameraAt(0).addChild(this.m_counter);
        this.m_updateCounter();
    } else {
        throw new Error();
    }
};

/**
 * Creates a keyboard reference below the counter, fixed to the camera.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_initControls = function() {
    this.m_disposeControls();
    if (this.m_controls == null) {
        this.m_controls = new rune.text.BitmapField([
            "CONTROLS (H: SHOW / HIDE)",
            "+ / - : ADD / REMOVE ASTRONAUT",
            "ARROWS: MOVE CAMERA (AUTO OFF)",
            "Z / X : ZOOM IN / OUT (AUTO OFF)",
            "A     : TOGGLE AUTO ZOOM",
            "R     : RESET CAMERA / AUTO OFF",
            "SHIFT+F: TOGGLE DEBUG",
            "G     : GLITCH FIRST ASTRONAUT",
            "ESC   : MAIN MENU"
        ].join("\n"), rune.text.BitmapFormat.FONT_SMALL);
        this.m_controls.autoSize = true;
        this.m_controls.x = 8;
        this.m_controls.y = this.m_counter.bottom + 8;
        this.cameras.getCameraAt(0).addChild(this.m_controls);
    } else {
        throw new Error();
    }
};

/**
 * Updates the counter to match the number of astronauts.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_updateCounter = function() {
    this.m_counter.value = this.m_astronauts.numMembers;
};

/**
 * Toggles automatic zoom for all current astronauts. Removing the targets
 * when disabled restores manual camera movement and retains the current view.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_toggleAutoZoom = function() {
    var camera = this.cameras.getCameraAt(0);
    camera.autoZoom.enabled = !camera.autoZoom.enabled;
    camera.targets.clear();
    if (camera.autoZoom.enabled) {
        this.m_astronauts.forEachMember(function(astronaut) {
            camera.targets.add(astronaut);
        }, this);
    }
};

/**
 * Toggles the visibility of the keyboard reference.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_toggleControls = function() {
    this.m_controls.visible = !this.m_controls.visible;
};

/**
 * Removes and destroys the group of astronauts.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_disposeAstronauts = function() {
    if (this.m_astronauts instanceof demo.entity.Astronauts) {
        this.cameras.getCameraAt(0).targets.clear();
        this.groups.remove(this.m_astronauts, true);
        this.m_astronauts = null;
    }
};

/**
 * Removes and destroys the astronaut counter.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_disposeCounter = function() {
    if (this.m_counter instanceof rune.ui.Counter) {
        this.m_counter.parent.removeChild(this.m_counter, true);
        this.m_counter = null;
    }
};

/**
 * Removes and destroys the keyboard reference.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_disposeControls = function() {
    if (this.m_controls instanceof rune.text.BitmapField) {
        this.m_controls.parent.removeChild(this.m_controls, true);
        this.m_controls = null;
    }
};
