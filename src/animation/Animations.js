//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Animations class.
 *
 * @constructor
 *
 * @param {rune.display.Sprite} target The Sprite object to which the animation is linked.
 *
 * @class
 * @classdesc
 * 
 * The Animations class represents a subsystem for managing keyframe-based 
 * animation within a Sprite object.
 */
rune.animation.Animations = function(target) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Current animation.
     *
     * @type {rune.animation.Animation}
     * @private
     */
    this.m_animation = null;
    
    /**
     * List of available animations.
     *
     * @type {Array.<rune.animation.Animation>}
     * @private
     */
    this.m_animations = [];
    
    /**
     * Frame data that describes which part of the Sprite object's texture 
     * data is to be used.
     *
     * @type {rune.geom.Rectangle}
     * @private
     */
    this.m_frame = new rune.geom.Rectangle(0, 0, target['canvas']['width'], target['canvas']['height']);
    
    /**
     * Atlas index.
     *
     * @type {number}
     * @private
     */
    this.m_atlasIndex = 0;
    
    /**
     * Target Sprite object.
     *
     * @type {rune.display.Sprite}
     * @private
     */
    this.m_target = target;
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Current animation. If this reference is null, no animation has been added.
 *
 * @member {rune.animation.Animation} current
 * @memberof rune.animation.Animations
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animations.prototype, "current", {
    /**
     * @this rune.animation.Animations
     * @ignore
     */
    get : function() {
        return this.m_animation;
    }
});

/**
 * Frame data. This is information that describes which part of the Sprite 
 * object's texture data is to be used for the current animation's current 
 * frame. This reference is primarily intended for internal use, but may be 
 * used for specific purposes.
 *
 * @member {rune.geom.Rectangle} frame
 * @memberof rune.animation.Animations
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animations.prototype, "frame", {
    /**
     * @this rune.animation.Animations
     * @ignore
     */
    get : function() {
        return this.m_frame;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds an animation. An animation needs to use a unique ID (name) to be added. 
 * If an animation with the same name already exists, the new animation will 
 * not be added.
 *
 * @param {rune.animation.Animation} animation Animation to be added.
 *
 * @throws {TypeError} If incorrect data type is used.
 *
 * @returns {boolean}
 */
rune.animation.Animations.prototype.add = function(animation) {
	if (animation instanceof rune.animation.Animation) {
        if (this.find(animation['name']) == null) {
            if (this.m_animations.push(animation) === 1) {
                this.m_animation = this.m_animations[0];
            }
            
            return true;
        }
        
        return false;
    } else throw new TypeError();
};

/**
 * Removes all animations.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.clear = function() {
    this.m_animation = null;
    while (this.m_animations.length) {
        this.m_animations[0].dispose();
        this.m_animations[0] = null;
        this.m_animations.splice(0, 1);
    }
};

/**
 * Creates a new animation. After an animation is created, it is automatically 
 * added to the animation system.
 *
 * @param {string} name The name of the animation.
 * @param {Array.<number>} frames Frame sequence.
 * @param {number} framerate Playback speed specified in frames per second.
 * @param {boolean} looped Whether or not to loop the animation sequence.
 *
 * @returns {boolean}
 */
rune.animation.Animations.prototype.create = function(name, frames, framerate, looped) {
	var animation = new rune.animation.Animation(
        name,
        frames,
        framerate,
        looped
    );
    
    return this.add(animation);
};

/**
 * Search for an animation in the animation system by its name. If no animation 
 * is found, null is returned.
 *
 * @param {string} name The name of the animation requested.
 *
 * @returns {rune.animation.Animation}
 */
rune.animation.Animations.prototype.find = function(name) {
    var i = this.m_animations.length;
    while (i--) {
        if (this.m_animations[i]['name'] == name) {
            return this.m_animations[i];
        }
    }
    
    return null;
};

/**
 * Changes the animation sequence and goes to a specific frame in that sequence.
 *
 * @param {string} name Requested animation.
 * @param {number} frame Frame to go to.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.goto = function(name, frame) {
    if (this.m_animation != null && this.m_animation['name'] != name) {
        this.m_animation = this.find(name);
        if (this.m_animation != null) {
            this.m_animation.goto(frame);
        }
    }
};

/**
 * Switches animation sequence and goes to a specific frame in that sequence 
 * and resumes playback from there.
 *
 * @param {string} name Requested animation.
 * @param {number} frame Frame to go to.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.gotoAndPlay = function(name, frame) {
    this.goto(name, frame);
    if (this.m_animation != null) {
        this.m_animation.play();
    }
};

/**
 * Changes the animation sequence and goes to a specific frame in that sequence 
 * and stops playback on that frame.
 *
 * @param {string} name Requested animation.
 * @param {number} frame Frame to go to.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.gotoAndStop = function(name, frame) {
    this.goto(name, frame);
    if (this.m_animation != null) {
        this.m_animation.stop();
    }
};

/**
 * Goes to the next frame in the current animation sequence.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.gotoNextFrame = function() {
    if (this.m_animation != null) {
        this.m_animation.gotoNextFrame();
    }
};

/**
 * Goes to the previous frame in the current animation sequence.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.gotoPreviousFrame = function() {
    if (this.m_animation != null) {
        this.m_animation.gotoPreviousFrame();
    }
};

/**
 * Goes to a random frame in the current animation sequence.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.gotoRandomFrame = function() {
    if (this.m_animation != null) {
        this.m_animation.gotoRandomFrame();
    }
};

/**
 * Plays the current animation sequence. If the animation is stopped, playback 
 * resumes from the previous position. If the animation is already playing, 
 * playback continues.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.play = function() {
    if (this.m_animation != null) {
        this.m_animation.play();
    } 
};

/**
 * Removes an animation.
 *
 * @param {string} name Animation to remove.
 *
 * @returns {boolean}
 */
rune.animation.Animations.prototype.remove = function(name) {
    var i = this.m_animations.length;
    while (i--) {
        if (this.m_animations[i]['name'].toLowerCase() == name.toLowerCase()) {
            if (this.m_animation == this.m_animations[i]) {
                this.m_animation = null;
            }
            
            this.m_animations.splice(i, 1)[0].dispose();
            return true;
        }
    }
    
    return false;
};

/**
 * Stops playback of current animation sequence.
 *
 * @returns {undefined}
 */
rune.animation.Animations.prototype.stop = function() {
    if (this.m_animation != null) {
        this.m_animation.stop();
    } 
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Clears memory allocated by this instance.
 *
 * @returns {undefined}
 * @ignore
 */
rune.animation.Animations.prototype.dispose = function() {
    this.m_target = null;
    this.m_frame  = null;
    
    this.clear();
};

/**
 * Updates the animation system.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.animation.Animations.prototype.update = function(step) {
	this.m_updateAnimation(step);
    this.m_updateFrame(step);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Updates current animation.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.animation.Animations.prototype.m_updateAnimation = function(step) {
    if (this.m_animation != null) {
        this.m_animation.update(step);
    }
};

/**
 * Updates which frame to display in the animation sequence.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.animation.Animations.prototype.m_updateFrame = function(step) {
    if (this.m_animation != null && this.m_animation['atlasIndex'] != this.m_atlasIndex) {
        this.m_atlasIndex = this.m_animation['atlasIndex'];
        
        this.m_frame.x = this.m_frame.width * this.m_atlasIndex;
        this.m_frame.y = 0;
        
        while (this.m_frame.x + this.m_frame.width > this.m_target["texture"]["width"]) {
            this.m_frame.y += this.m_frame.height;
            this.m_frame.x -= this.m_target["texture"]["width"];
        }
        
        this.m_target.breakCache();
    }
};