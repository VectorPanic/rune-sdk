//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Instances the Scene003 class.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @class
 * @classdesc
 * 
 * The Scene003 class is a test scene within the Demo application.
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
};

/**
 * @inheritDoc
 */
demo.scene.Scene003.prototype.update = function(step) {
    rune.scene.Scene.prototype.update.call(this, step);
    var camera = this.cameras.getCameraAt(0);
    
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
    if (this.keyboard.pressed("X")) {
        var tmp = rune.geom.Rectangle.clone(camera.viewport.center);
        camera.viewport.zoom -= 0.01;
        camera.viewport.center = tmp;
    }
    
    // CAMERA ZOOM IN
    if (this.keyboard.pressed("Z")) {
        var tmp = rune.geom.Rectangle.clone(camera.viewport.center);
        camera.viewport.zoom += 0.01;
        camera.viewport.center = tmp;
    }
    
    // CAMERA RESET
    if (this.keyboard.pressed("R")) {
        camera.viewport.zoom = 1;
        camera.viewport.x = 0;
        camera.viewport.y = 0;
    }
    
    // BACK TO MAIN MENU
    if (this.keyboard.pressed("ESCAPE")) {
        this.application.scenes.select(0);
    }
};

/**
 * @inheritDoc
 */
demo.scene.Scene003.prototype.dispose = function() {
    this.m_disposeAstronauts();
    rune.scene.Scene.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

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
    } else throw new Error();
};

/**
 * Removes and destroys the group of astronauts.
 *
 * @returns {undefined}
 * @private
 */
demo.scene.Scene003.prototype.m_disposeAstronauts = function() {
    if (this.m_astronauts instanceof demo.entity.Astronauts) {
        this.groups.remove(this.m_astronauts, true);
        this.m_astronauts = null;
    }
};