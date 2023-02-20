//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Animation class.
 *
 * @constructor
 *
 * @param {string} name The name of the animation; used as a unique ID.
 * @param {Array} frames List of which frames are included in the animation and in which order.
 * @param {number} [framerate=0] Playback speed specified in frames per second.
 * @param {boolean} [looped=false] Whether or not to loop the animation sequence.
 *
 * @class
 * @classdesc
 * 
 * The Animation class represents a keyframe based animation sequence.
 */
rune.animation.Animation = function(name, frames, framerate, looped) {
	
	//--------------------------------------------------------------------------
	// Public properties
	//--------------------------------------------------------------------------
	
	/**
	 * List of animation key frames. The list dictates which frames are 
	 * included in the animation and in which order the frames are played.
	 *
	 * @type {Array}
	 */
	this.frames = frames || [];
	
	/**
	 * Whether (true) or not (false) to loop the animation sequence.
	 *
	 * @type {boolean}
	 */
	this.looped = looped || false;
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * Delay between keyframes.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_delay = parseInt(framerate, 10) > 0 ? parseInt((1 / framerate) * 1000, 10) : 0;
	
	/**
	 * Elapsed time.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_elapsed = 0;
	
	/**
	 * Index of current keyframe.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_index = 0;
	
	/**
	 * The name of the animation.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_name = name || "unnamed";
	
	/**
	 * Whether the animation is paused or not.
	 *
	 * @type {boolean}
	 * @private
	 */
	this.m_paused = false;
	
	//--------------------------------------------------------------------------
	// Constructor call
	//--------------------------------------------------------------------------
	
	/**
	 * Invokes secondary class constructor.
	 */
	this.m_construct();
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Describes the current frame based on the animation's atlas texture.
 *
 * @member {number} atlasIndex
 * @memberof rune.animation.Animation
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animation.prototype, "atlasIndex", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this.frames[this['index']];
	}
});

/**
 * The display time (in milliseconds) of each keyframe.
 *
 * @member {number} delay
 * @memberof rune.animation.Animation
 * @instance
 */
Object.defineProperty(rune.animation.Animation.prototype, "delay", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this.m_delay;
	},
	
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	set : function(value) {
		this.m_delay = rune.util.Math.clamp(parseInt(value, 10), 0, Number.MAX_SAFE_INTEGER);
	}
});

/**
 * The total length of the animation specified in milliseconds.
 *
 * @member {number} duration
 * @memberof rune.animation.Animation
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animation.prototype, "duration", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this['delay'] * this.frames.length;
	}
});

/**
 * Index of current keyframe within current animation sequence.
 *
 * @member {number} frameIndex
 * @memberof rune.animation.Animation
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animation.prototype, "frameIndex", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this['index'];
	}
});

/**
 * Playback speed specified in frames per second.
 *
 * @member {number} framerate
 * @memberof rune.animation.Animation
 * @instance
 */
Object.defineProperty(rune.animation.Animation.prototype, "framerate", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return (this['delay'] > 0) ? parseInt(1000 / this['delay'], 10) : 0;
	},
	
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	set : function(value) {
		this['delay'] = parseInt((1 / value) * 1000, 10);
	}
});

/**
 * Length of animation, indicated in number of frames.
 *
 * @member {number} length
 * @memberof rune.animation.Animation
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animation.prototype, "length", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this.frames.length;
	}
});

/**
 * The name of the animation. This value is used as a unique ID and thus there 
 * can be no two animations with the same name.
 *
 * @member {string} name
 * @memberof rune.animation.Animation
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animation.prototype, "name", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this.m_name;
	}
});

/**
 * A Boolean value that indicates whether an animation is currently playing.
 *
 * @member {boolean} isPlaying
 * @memberof rune.animation.Animation
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animation.prototype, "isPlaying", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return !this.m_paused;
	}
});

/**
 * Refers to a subsystem that enables the inclusion of scripts in frames. 
 * Use this reference to add, or delete, scripts for the current animation.
 *
 * @member {rune.animation.AnimationScripts} scripts
 * @memberof rune.animation.Animation
 * @instance
 * @readonly
 */
Object.defineProperty(rune.animation.Animation.prototype, "scripts", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this.m_scripts;
	}
});

//------------------------------------------------------------------------------
// Private getter and setter methods
//------------------------------------------------------------------------------

/**
 * Current frame index.
 *
 * @member {number} index
 * @memberof rune.animation.Animation
 * @instance
 * @private
 */
Object.defineProperty(rune.animation.Animation.prototype, "index", {
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	get : function() {
		return this.m_index;
	},
	
	/**
	 * @this rune.animation.Animation
	 * @ignore
	 */
	set : function(value) {
		if (this.looped === true) {
			this.m_index = rune.util.Math.wrap(value, 0, this.frames.length - 1);
		} else {
			this.m_index = rune.util.Math.clamp(value, 0, this.frames.length - 1);
		}
	}
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Jumps to a specific frame within the animation sequence.
 *
 * @param {number} frame Frame to go to.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.goto = function(frame) {
	if (frame > -1) {
		this['index'] = frame;
	}
	
	this.m_elapsed = 0;
};

/**
 * Jumps to a specific frame within the animation sequence and starts playback 
 * from this location.
 *
 * @param {number} frame Frame to go to.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.gotoAndPlay = function(frame) {
	this.goto(frame);
	this.play();
};

/**
 * Jumps to a specific frame within the animation sequence and stops playback 
 * on that frame.
 *
 * @param {number} frame Frame to go to.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.gotoAndStop = function(frame) {
	this.goto(frame);
	this.stop();
};

/**
 * Sends the playhead to the next frame.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.gotoNextFrame = function() {
	this['index']++;
	this.m_elapsed = 0;
};

/**
 * Sends the playhead to the previous frame.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.gotoPreviousFrame = function() {
	this['index']--;
	this.m_elapsed = 0;
};

/**
 * Sends the playhead to a random frame.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.gotoRandomFrame = function() {
	this['index'] = rune.util.Math.randomInt(0, this.frames.length - 1);
	this.m_elapsed = 0;
};

/**
 * Moves the playhead in the timeline of the animation.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.play = function() {
	this.m_paused = false;
};

/**
 * Stops the playhead in the animation.
 *
 * @returns {undefined}
 */
rune.animation.Animation.prototype.stop = function() {
	this.m_paused = true;
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Clears memory allocated by this instance.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.animation.Animation.prototype.dispose = function() {
	this.stop();
	this.m_disposeScripts();
};

/**
 * Updates the playback of the animation.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.animation.Animation.prototype.update = function(step) {
	if (this.m_delay > 0 && this.m_paused == false) {
		this.m_elapsed += step;
		
		while (this.m_elapsed  > this.m_delay) {
			   this.m_elapsed -= this.m_delay;
			   this['index']++;
			   
			   this.m_execScript();
		}
	}
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.animation.Animation.prototype.m_construct = function() {
	this.m_constructScripts();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the script subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.animation.Animation.prototype.m_constructScripts = function() {
	this.m_disposeScripts();
	if (this.m_scripts == null) {
		this.m_scripts = new rune.animation.AnimationScripts();
	} else throw new Error();
};

/**
 * Destroy the subsystem for scripts.
 *
 * @returns {undefined}
 * @private
 */
rune.animation.Animation.prototype.m_disposeScripts = function() {
	if (this.m_scripts instanceof rune.animation.AnimationScripts) {
		this.m_scripts.dispose();
		this.m_scripts = null;
	}
};

/**
 * Executes a script within the subsystem.
 *
 * @returns {undefined}
 * @private
 */
rune.animation.Animation.prototype.m_execScript = function() {
	if (this.m_scripts != null) {
		this.m_scripts.exec(this['index']);	
	}
};