//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Scene005 object.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 *
 * Demonstrates raycast navigation, animated actors, doors and keyboard/gamepad input.
 */
demo.scene.Scene005 = function() {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Tilemap owned by the scene and shared with the raycast world.
     *
     * @type {rune.tilemap.Tilemap}
     * @private
     */
    this.m_map = null;

    /**
     * World containing the actors and doors in a single update hierarchy.
     *
     * @type {rune.raycast.World}
     * @private
     */
    this.m_world = null;

    /**
     * Player position and heading used for navigation and viewing.
     *
     * @type {rune.raycast.Camera}
     * @private
     */
    this.m_observer = null;

    /**
     * Display object projecting the world from the player camera.
     *
     * @type {rune.raycast.Viewport}
     * @private
     */
    this.m_view = null;

    /**
     * Describes the scene's keyboard controls.
     *
     * @type {rune.text.BitmapField}
     * @private
     */
    this.m_controls = null;

    /**
     * Named movement actions and analog axes, updated by the input subsystem.
     *
     * @type {rune.input.Actions}
     * @private
     */
    this.m_input = null;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------

    /**
     * Extend rune.scene.Scene.
     */
    rune.scene.Scene.call(this, "scene005");
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.scene.Scene005.prototype = Object.create(rune.scene.Scene.prototype);
demo.scene.Scene005.prototype.constructor = demo.scene.Scene005;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.scene.Scene005.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_initInput();
    this.m_initWorld();
    this.m_initObserver();
    this.m_initActors();
    this.m_initDoors();
    this.m_initSurfaces();
    this.m_initView();
    this.m_initControls();
};

/**
 * @inheritDoc
 */
demo.scene.Scene005.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    this.m_updateMovement(step);
    this.m_updateInput();
};

/**
 * @inheritDoc
 */
demo.scene.Scene005.prototype.dispose = function() {
    this.m_disposeControls();
    this.m_disposeInput();
    rune.scene.Scene.prototype.dispose.call(this);
    this.m_disposeWorld();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Binds keyboard actions and gamepad sticks to the movement axes.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initInput = function() {
    this.m_input = this.application.inputs.createActions();
    this.m_input.bindKey("FORWARD", "W");
    this.m_input.bindKey("BACKWARD", "S");
    this.m_input.bindKey("STRAFE_LEFT", "A");
    this.m_input.bindKey("STRAFE_RIGHT", "D");
    this.m_input.bindKey("TURN_LEFT", "LEFT");
    this.m_input.bindKey("TURN_RIGHT", "RIGHT");

    this.m_input.createAxis("MOVE_Y")
        .bindActions("FORWARD", "BACKWARD")
        .bindStick("left", "y");
    this.m_input.createAxis("MOVE_X")
        .bindActions("STRAFE_LEFT", "STRAFE_RIGHT")
        .bindStick("left", "x");
    this.m_input.createAxis("TURN")
        .bindActions("TURN_LEFT", "TURN_RIGHT")
        .bindStick("right", "x");
};

/**
 * Loads the map and puts the world in a single update hierarchy.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initWorld = function() {
    this.m_map = new rune.tilemap.Tilemap();
    this.m_map.load("demo_raycast_map");
    this.m_world = new rune.raycast.World(this.m_map);
    this.stage.addChild(this.m_world);
};

/**
 * Creates the player camera at the map's spawn position.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initObserver = function() {
    var spawn = this.m_map.getProperty("spawn");
    this.m_observer = new rune.raycast.Camera(spawn.x, spawn.y, spawn.angle);
};

/**
 * Places the demo actors and assigns their navigation behaviors.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initActors = function() {
    this.m_world.addChild(new demo.entity.Woman(8.5, 6.5));
    this.m_world.addChild(new demo.entity.Woman(6.5, 4.5));
    this.m_world.addChild(new demo.entity.Desk(8.5, 7.5));
    this.m_world.addChild(new demo.entity.Desk(10.5, 7.5));
    this.m_world.addChild(new demo.entity.Plant(10.5, 1.5));
    this.m_world.addChild(new demo.entity.Plant(4.5, 8.5));

    var man = new demo.entity.Man(4.5, 2.5);
    this.m_world.addChild(man);
    man.navigator.follow(this.m_observer);

    var rat = new demo.entity.Rat(7.5, 3.5);
    this.m_world.addChild(rat);
    rat.navigator.flee(this.m_observer);
};

/**
 * Creates doors from ordinary map metadata. Tilemap does not depend on Door.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initDoors = function() {
    var doors = this.m_map.getProperty("doors", []);
    var observer = this.m_observer;
    var world = this.m_world;
    for (var i = 0; i < doors.length; i++) {
        var data = doors[i];
        var door = new rune.raycast.Door(data.column, data.row, data.texture, data.orientation);
        door.canClose = function() {
            return !world.overlapsCell(observer, this.x, this.y);
        };
        
        this.m_world.addChild(door);
    }
};

/**
 * Places a fixed signboard surface beside the wall.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initSurfaces = function() {
    var surface = new rune.raycast.Surface(
        9.001, 4.5, 16, 16, "demo_raycast_surface_signboard_16x16", Math.PI / 2
    );
    
    surface.worldWidth = 0.65;
    surface.worldHeight = 0.65;
    this.m_world.addChild(surface);
};

/**
 * Creates a half-resolution view using the normal display lifecycle.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initView = function() {
    this.m_view = new rune.raycast.Viewport(
        0, 
        0,
        Math.ceil(this.application.width / 2), 
        Math.ceil(this.application.height / 2),
        this.m_world, this.m_observer
    );
    
    this.m_view.scaleX = 2;
    this.m_view.scaleY = 2;
    
    this.stage.addChild(this.m_view);
};

/**
 * Creates a keyboard reference fixed to the camera.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_initControls = function() {
    this.m_disposeControls();
    this.m_controls = new rune.text.BitmapField([
        "CONTROLS (H: SHOW / HIDE)",
        "W / S : MOVE FORWARD / BACKWARD",
        "A / D : STRAFE LEFT / RIGHT",
        "ARROWS: LEFT / RIGHT TO TURN",
        "SPACE : INTERACT / OPEN / CLOSE DOOR",
        "C     : TOGGLE CEILING / SKY",
        "ESC   : MAIN MENU"
    ].join("\n"), rune.text.BitmapFormat.FONT_SMALL);
    
    this.m_controls.autoSize = true;
    this.m_controls.x = 8;
    this.m_controls.y = 8;
    
    this.cameras.getCameraAt(0).addChild(this.m_controls);
};

/**
 * Applies keyboard and gamepad movement to the player camera.
 *
 * @param {number} step Elapsed time in milliseconds.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_updateMovement = function(step) {
    var forward = -this.m_input.getAxis("MOVE_Y").value;
    var strafe = this.m_input.getAxis("MOVE_X").value;
    var turn = this.m_input.getAxis("TURN").value;

    this.m_observer.turn(turn * 2 * step / 1000);
    this.m_observer.move(this.m_world, strafe, forward, 2 * step / 1000);
};

/**
 * Handles interaction, scene options and returning to the menu.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_updateInput = function() {
    var keys = this.keyboard;
    var pad = this.gamepads.get(0);
    
    if (keys.justPressed("SPACE") || (pad && pad.justPressed(0))) {
        this.m_interact();
    }
    
    if (keys.justPressed("C")) {
        this.m_world.ceilingEnabled = !this.m_world.ceilingEnabled;
    }
    
    if (keys.justPressed("H")) {
        this.m_toggleControls();
    }
    
    if (keys.justPressed("ESCAPE")) {
        this.application.transitions.select(0, new rune.transition.Slide({
            duration: 600,
            direction: "right"
        }));
    }
};

/**
 * Opens or closes the selected door, or flickers the selected actor.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_interact = function() {
    var target = this.m_observer.pick(this.m_world, 2.5);
    if (target instanceof rune.raycast.Door) {
        target.toggle();
    } else if (target) {
        target.flicker.start(1000);
    }
};

/**
 * Toggles the visibility of the keyboard reference.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_toggleControls = function() {
    this.m_controls.visible = !this.m_controls.visible;
};

/**
 * Releases movement bindings without disposing the shared input devices.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_disposeInput = function() {
    if (this.m_input != null) {
        this.m_input.dispose();
        this.m_input = null;
    }
};

/**
 * Removes and destroys the keyboard reference.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_disposeControls = function() {
    if (this.m_controls instanceof rune.text.BitmapField) {
        this.m_controls.parent.removeChild(this.m_controls, true);
        this.m_controls = null;
    }
};

/**
 * Releases the map after the scene has disposed its world and viewport children.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene005.prototype.m_disposeWorld = function() {
    if (this.m_map != null) {
        this.m_map.dispose();
        this.m_map = null;
    }
    this.m_world = null;
    this.m_observer = null;
    this.m_view = null;
};
