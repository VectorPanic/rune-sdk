//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new Sound object.
 *
 * @constructor
 * @package
 *
 * @param {rune.media.SoundChannel} channel The channel that "owns" the object.
 * @param {string} resource The name of the audio resource to be used.
 * @param {boolean} [unique=false] Whether the object should be unique or shared.
 *
 * @class
 * @classdesc
 * 
 * The Sound class represents a sound that can be played in an audio channel. 
 * The class offers an interface for playing a specific sound. It is the sound 
 * channel that does the actual playback.
 */
rune.media.Sound = function(channel, resource, unique) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Name of the resource file used as the audio source.
     *
     * @type {string}
     * @private
     */
    this.m_resource = resource;
    
    /**
     * The audio channel object that created the Sound object.
     *
     * @type {rune.media.SoundChannel}
     * @private
     */
    this.m_channel = channel;
    
    /**
     * Playback speed.
     *
     * @type {number}
     * @private
     */
    this.m_rate = 1.0;
    
    /**
     * Sound source.
     *
     * @type {MediaElementAudioSourceNode}
     * @private
     */
    this.m_source = null;
    
    /**
     * Stereo panner node.
     *
     * @type {StereoPannerNode}
     * @private
     */
    this.m_stereoPanner = null;
    
    /**
     * Whether the object is unique or shared.
     *
     * @type {boolean}
     * @private
     */
    this.m_unique = Boolean(unique);
    
    /**
     * Tween system used for volume management.
     *
     * @type {rune.tween.Tweens}
     * @private
     */
    this.m_tweens = null;

    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    /**
     * Invokes secondary class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Refers to the audio channel that created the audio object and thus the 
 * object is bound to.
 *
 * @member {rune.media.SoundChannel} channel
 * @memberof rune.media.Sound
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sound.prototype, "channel", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_channel;
    }
});

/**
 * A boolean value which is true if the media contained in the element has 
 * finished playing.
 *
 * @member {boolean} ended
 * @memberof rune.media.Sound
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sound.prototype, "ended", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_source['mediaElement'].ended;
    }
});

/**
 * Whether the Sound object should start over when it reaches the end. This can 
 * for example be useful for background music.
 *
 * @member {boolean} loop
 * @memberof rune.media.Sound
 * @instance
 */
Object.defineProperty(rune.media.Sound.prototype, "loop", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_source['mediaElement'].loop;
    },
    
    /**
     * @this rune.media.Sound
     * @ignore
     */
    set : function(value) {
        this.m_source['mediaElement'].loop = value;
    }
});

/**
 * The name of the resource file used as the audio source for the Sound object.
 *
 * @member {string} name
 * @memberof rune.media.Sound
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sound.prototype, "name", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_resource;
    }
});

/**
 * Pan represented by a floating point number between -1 (left) and 1 (right). 
 * The default value is 0 and distributes the sound evenly between the left 
 * and right speakers.
 *
 * @member {number} pan
 * @memberof rune.media.Sound
 * @instance
 */
Object.defineProperty(rune.media.Sound.prototype, "pan", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_stereoPanner['pan'].value;
    },
    
    /**
     * @this rune.media.Sound
     * @ignore
     */
    set : function(value) {
        this.m_stereoPanner['pan'].value = rune.util.Math.clamp(value, -1.0, 1.0);
    }
});

/**
 * Whether the sound is paused (true) or not (false).
 *
 * @member {boolean} paused
 * @memberof rune.media.Sound
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sound.prototype, "paused", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_source['mediaElement'].paused;
    }
});

/**
 * The object's true playback speed, ie the speed relative to the playback 
 * speed of the audio channel to which the object is connected.
 *
 * @member {number} playbackRate
 * @memberof rune.media.Sound
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sound.prototype, "playbackRate", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_source['mediaElement'].playbackRate;
    }
});

/**
 * Whether or not the browser should adjust the pitch of the audio to 
 * compensate for changes to the playback rate.
 *
 * @member {boolean} preservesPitch
 * @memberof rune.media.Sound
 * @instance
 * @default true
 */
Object.defineProperty(rune.media.Sound.prototype, "preservesPitch", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_source['mediaElement'].preservesPitch;
    },
    
    /**
     * @this rune.media.Sound
     * @ignore
     */
    set : function(value) {
        this.m_source['mediaElement'].preservesPitch = value;
    }
});

/**
 * Sets the rate at which the media is being played back. This is used to 
 * implement user controls for fast forward, slow motion, and so forth. The 
 * normal playback rate is multiplied by this value to obtain the current 
 * rate, so a value of 1.0 indicates normal speed.
 *
 * @member {number} rate
 * @memberof rune.media.Sound
 * @instance
 * @default 1.0
 */
Object.defineProperty(rune.media.Sound.prototype, "rate", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_rate;
    },
    
    /**
     * @this rune.media.Sound
     * @ignore
     */
    set : function(value) {
        this.m_rate = value;
        //this.m_source['mediaElement'].playbackRate = this.m_rate * this.m_channel['rate'];
    }
});

/**
 * A double-precision floating-point value indicating the current playback 
 * time in seconds; if the media has not started to play and has not been 
 * seeked, this value is the media's initial playback time. Setting this value 
 * seeks the media to the new time. The time is specified relative to the 
 * media's timeline.
 *
 * @member {number} time
 * @memberof rune.media.Sound
 * @instance
 */
Object.defineProperty(rune.media.Sound.prototype, "time", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_source['mediaElement'].currentTime;
    },
    
    /**
     * @this rune.media.Sound
     * @ignore
     */
    set : function(value) {
        this.m_source['mediaElement'].currentTime = value;
    }
});

/**
 * Sound The object's sound volume. Volume is given as a floating point number 
 * between 0 (0%) and 1 (100%).
 *
 * @member {number} volume
 * @memberof rune.media.Sound
 * @instance
 */
Object.defineProperty(rune.media.Sound.prototype, "volume", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_source['mediaElement'].volume;
    },
    
    /**
     * @this rune.media.Sound
     * @ignore
     */
    set : function(value) {
        this.m_source['mediaElement'].volume = rune.util.Math.clamp(value, 0.0, 1.0);
    }
});

/**
 * Whether the Sound object is unique (true) or shared (false).
 *
 * @member {boolean} unique
 * @memberof rune.media.Sound
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sound.prototype, "unique", {
    /**
     * @this rune.media.Sound
     * @ignore
     */
    get : function() {
        return this.m_unique;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adjust the volume of the audio channel to a certain level.
 *
 * @param {number} to Target volume.
 * @param {number} duration Fade duration.
 *
 * @returns {undefined}
 */
rune.media.Sound.prototype.fade = function(to, duration) {
    this.m_tweens.clear();
    this.m_tweens.create({
        target: this,
        transition: rune.tween.Sine.easeIn,
        duration: duration || 2500,
        args: {
            volume: to || 0
        },
    });
};

/**
 * Pause audio playback.
 *
 * @returns {undefined}
 */
rune.media.Sound.prototype.pause = function() {
    this.m_source['mediaElement'].pause();
};

/**
 * Start audio playback.
 *
 * @param {boolean} [restart=false] Restarts playback (if it is playing).
 *
 * @returns {undefined}
 */
rune.media.Sound.prototype.play = function(restart) {
    if (restart == true) {
        this.m_source['mediaElement'].currentTime = 0;
    }

    this.m_source['mediaElement'].play();
};

/**
 * Resumes current audio playback.
 *
 * @returns {undefined}
 */
rune.media.Sound.prototype.resume = function() {
    this.play(false);
};

/**
 * Stops current audio playback.
 *
 * @returns {undefined}
 */
rune.media.Sound.prototype.stop = function() {
    this.m_source['mediaElement'].pause();
    this.m_source['mediaElement'].currentTime = 0;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Destroys the audio object and frees allocated memory. The method can be used 
 * to remove and destroy Sound objects, but the recommended way to remove 
 * (and destroy) a Sound object is via the remove method of the sound channel 
 * on which the object was created.
 *
 * @returns {undefined}
 */
rune.media.Sound.prototype.dispose = function() {
    this.m_disposeStereoPanner();
    this.m_disposeSource();
    this.m_disposeChannel();
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Connects the Sound object to an sound channel.
 *
 * @param {AudioNode} node Audio node to connect to.
 *
 * @returns {undefined}
 * @package
 * @ignore
 * @suppress {checkTypes}
 */
rune.media.Sound.prototype.connect = function(node) {
    this.m_stereoPanner.connect(node);
    this['rate'] = 1.0;
};

/**
 * Updates the Sound object.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.media.Sound.prototype.update = function(step) {
    this.m_updateRate(step);
    this.m_updateTweens(step);
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
rune.media.Sound.prototype.m_construct = function() {
    this.m_constructSource();
    this.m_constructStereoPanner();
    this.m_constructTweens();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates an audio source based on the resource used to represent the sound 
 * object.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_constructSource = function() {
    this.m_disposeSource();
    if (this.m_source == null && this.m_channel != null) {
        var resource = rune.system.Application['instance']['resources'].get(this.m_resource);
        this.m_source = this.m_channel['context'].createMediaElementSource(resource['data'].cloneNode());
    } else throw new Error();
};

/**
 * Creates the stereo panner node.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_constructStereoPanner = function() {
    this.m_disposeStereoPanner();
    if (this.m_stereoPanner == null && this.m_channel != null) {
        this.m_stereoPanner = this.m_channel['context'].createStereoPanner();
        this.m_source.connect(this.m_stereoPanner);
    } else throw new Error();
};

/**
 * Creates the Tween system.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_constructTweens = function() {
    this.m_disposeTweens();
    if (this.m_tweens == null) {
        this.m_tweens = new rune.tween.Tweens();
    } else throw new Error();
};

/**
 * Calculates and updates the playback speed (rate) based on the speed of the 
 * audio object and audio channel.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_updateRate = function(step) {
    if (this.m_source && this.m_channel) {
        this.m_source['mediaElement'].playbackRate = this.m_rate * this.m_channel['rate'];
    }
};

/**
 * Updates the Tween system.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_updateTweens = function(step) {
    if (this.m_tweens) {
        this.m_tweens.update(step);
    }
};

/**
 * Removes the Tween system.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_disposeTweens = function() {
    if (this.m_tweens instanceof rune.tween.Tweens) {
        this.m_tweens.dispose();
        this.m_tweens = null;
    }
};

/**
 * Disconnects the object from the audio channel.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_disposeChannel = function() {
    if (this.m_channel != null) {
        this.m_channel.remove(this, false);
        this.m_channel = null;   
    }
};

/**
 * Removes the stereo panner node.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_disposeStereoPanner = function() {
    if (this.m_stereoPanner instanceof StereoPannerNode) {
        this.m_stereoPanner.disconnect();
        this.m_stereoPanner = null;
    }
};

/**
 * Removes the audio source.
 *
 * @returns {undefined}
 * @private
 */
rune.media.Sound.prototype.m_disposeSource = function() {
    if (this.m_source != null) {
        this.m_source.disconnect();
        this.m_source  = null;
    }
};