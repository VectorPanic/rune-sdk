//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Astronauts object.
 *
 * @constructor
 * @extends rune.display.DisplayGroup
 * 
 * @class
 * @classdesc
 * 
 * The Astronauts class represents a handler for astronaut sprites.
 */
demo.entity.Astronauts = function() {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether or not to display debug data.
     *
     * @type {boolean}
     * @private
     */
    this.m_debug = false;
    
    /**
     * Sound effect for when astronauts collide with each other.
     *
     * @type {rune.sound.Sound}
     * @private
     */
    this.m_sound = this.application.sounds.sound.get("demo_astronaut_sound_collision", true);

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.display.DisplayGroup.
     */
    rune.display.DisplayGroup.call(this, this.application.scenes.find("scene003").stage);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.entity.Astronauts.prototype = Object.create(rune.display.DisplayGroup.prototype);
demo.entity.Astronauts.prototype.constructor = demo.entity.Astronauts;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Whether or not debug mode is enabled.
 *
 * @member {boolean} debug
 * @memberof demo.entity.Astronauts
 * @instance
 * @readonly
 */
Object.defineProperty(demo.entity.Astronauts.prototype, "debug", {
    /**
     * @this demo.entity.Astronauts
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_debug;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Creates a new astronaut and adds it to the group.
 *
 * @returns {undefined}
 */
demo.entity.Astronauts.prototype.add = function() {
    var astronaut = new demo.entity.Astronaut();
        astronaut.centerX  = rune.util.Math.random(0, this.application.scenes.selected.cameras.getCameraAt(0).width);
        astronaut.centerY  = rune.util.Math.random(0, this.application.scenes.selected.cameras.getCameraAt(0).height);
        astronaut.rotation = rune.util.Math.random(0, 360);
        astronaut.debug = this.m_debug;
        astronaut.hitbox.debug = this.m_debug;
        astronaut.flicker.start();
        
    this.addMember(astronaut);
};

/**
 * Removes the oldest astronaut from the group.
 *
 * @returns {undefined}
 */
demo.entity.Astronauts.prototype.remove = function() {
    if (this.numMembers > 0) {
        this.removeMember(this.getMemberAt(0), true);
    }
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.entity.Astronauts.prototype.update = function(step) {
    rune.display.DisplayGroup.prototype.update.call(this, step);
    this.m_updateInputs(step);
    this.m_updateBounds(step);
    this.m_updateCollision(step);
    this.m_updateDebugRect(step);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Check for keyboard input.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
demo.entity.Astronauts.prototype.m_updateInputs = function(step) {
    if (this.keyboard.pressed("SHIFT")) {
        if (this.keyboard.justPressed("F")) {
            this.m_debug = !this.m_debug;
            this.forEachMember(function(member, index) {
                member.debug = this.m_debug;
                member.hitbox.debug = this.m_debug;
            }, this);
        }
    }
    
    if (this.keyboard.justPressed("PLUS")) {
        this.add();
    }

    if (this.keyboard.justPressed("MINUS")) {
        this.remove();
    }
};

/**
 * Make sure all astronauts stay within the camera's field of view.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
demo.entity.Astronauts.prototype.m_updateBounds = function(step) {
    var camera = this.cameras.getCameraAt(0);
    for (var i = 0; i < this.container.numChildren; i++) {
        var astronaut = this.container.getChildAt(i);
        
        //@note: Updates the values twice in order to set the previous position to the same as the current position.
        if (astronaut.left > camera.viewport.right) {
            astronaut.right = camera.viewport.left;
            astronaut.right = camera.viewport.left;
        } else if (astronaut.right < camera.viewport.left) {
            astronaut.left = camera.viewport.right;
            astronaut.left = camera.viewport.right;
        }
        
        if (astronaut.top > camera.viewport.bottom) {
            astronaut.bottom = camera.viewport.top;
            astronaut.bottom = camera.viewport.top;
        } else if (astronaut.bottom < camera.viewport.top) {
            astronaut.top = camera.viewport.bottom;
            astronaut.top = camera.viewport.bottom;
        }
    }
};

/**
 * Hit detects and separates all stronauts against each other.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
demo.entity.Astronauts.prototype.m_updateCollision = function(step) {
    this.hitTestAndSeparate(this, function(a, b) {
        var ca = this.application.scenes.selected.cameras.getCameraAt(0);
        var cx = Math.abs(a.velocity.x - b.velocity.x);
        var cy = Math.abs(a.velocity.y - b.velocity.y);
        
        if (cx > 0.4 || cy > 0.4) {
            
            ca.shake.start(350, 5 * ca.viewport.zoom, 5 * ca.viewport.zoom, true);
            this.m_sound.volume = ca.viewport.zoom * 0.5;
            this.m_sound.rate = rune.util.Math.random(0.5, 2.0);
            this.m_sound.play();
            
            this.gamepads.vibrate();
        }
    }, this);
};

/**
 * Draws the astronauts' "member area".
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 */
demo.entity.Astronauts.prototype.m_updateDebugRect = function(step) {
    this.cameras.getCameraAt(0).graphics.clear();
    if (this.m_debug == true) {
        var area = this.getArea();
        this.cameras.getCameraAt(0).graphics.drawRect(
            area.x - this.cameras.getCameraAt(0)['viewport']['x'],
            area.y - this.cameras.getCameraAt(0)['viewport']['y'],
            area.width,
            area.height,
            rune.util.Palette.RED,
            1
        );
    }
};