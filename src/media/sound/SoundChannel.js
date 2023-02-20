//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new sound channel. 
 *
 * @constructor
 * @package
 *
 * @param {boolean} [shared=false] Whether the channel should only use shared audio objects (true) or not (false).
 *
 * @class
 * @classdesc
 * 
 * The SoundChannel class represents an sound channel for playing sound effects 
 * and / or music. The class is used to create and bind Sound objects to the 
 * channel. Each Sound object must be connected to an audio channel in order to 
 * be played. There are two types of Sound objects; unique and shared. With 
 * shared Sound objects, it is possible to reuse the same object for several 
 * different sound sources. Note that there can be no multiple playbacks of a 
 * shared audio object at one time, in which case a unique object must be used.
 */
rune.media.SoundChannel = function(shared) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * The audio context that represents the audio channel.
     *
     * @type {AudioContext}
     * @private
     */
    this.m_context = null;

    /**
     * Used for volume control.
     *
     * @type {GainNode}
     * @private
     */
    this.m_gain = null;
    
    /**
     * create stereo panner
     *
     * @type {StereoPannerNode}
     * @private
     */
    this.m_panner = null;
    
    /**
     * Playback rate.
     *
     * @type {number}
     * @private
     */
    this.m_rate = 1.0;
    
    /**
     * Whether the object is shared or not.
     *
     * @type {boolean}
     * @private
     */
    this.m_shared = Boolean(shared);

    /**
     * Register of created sound objects. 
     *
     * @type {Array.<rune.media.Sound>}
     * @private
     */
    this.m_sounds = [];
    
    /**
     * Tween system.
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
 * Returns the number of Sound objects registered in the sound channel.
 *
 * @member {number} length
 * @memberof rune.media.SoundChannel
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.SoundChannel.prototype, "length", {
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    get : function() {
        return this.m_sounds.length;
    }
});

/**
 * Whether all sounds in the sound channel are paused (true) or not (false).
 *
 * @member {boolean} paused
 * @memberof rune.media.SoundChannel
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.SoundChannel.prototype, "paused", {
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    get : function() {
        return (this.m_context.state === "suspended");
    }
});

/**
 * Sets the rate at which the audio is being played back. The normal playback 
 * rate is multiplied by this value to obtain the current rate, so a value of 
 * 1.0 indicates normal speed.
 *
 * @member {number} rate
 * @memberof rune.media.SoundChannel
 * @instance
 */
Object.defineProperty(rune.media.SoundChannel.prototype, "rate", {
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    get : function() {
        return this.m_rate;
    },
    
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    set : function(value) {
        this.m_rate = value;
        /*
        var i = this.m_sounds.length;
        while (i--) {
            this.m_sounds[i].rate = this.m_sounds[i].rate;
        }
        */
    }
});

/**
 * Returns whether the sound channel is limited to shared Sound objects only 
 * (true) or not (false). If the channel is "shared", all requests for unique 
 * Sound objects are denied.
 *
 * @member {boolean} shared
 * @memberof rune.media.SoundChannel
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.SoundChannel.prototype, "shared", {
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    get : function() {
        return this.m_shared;
    }
});


/**
 * The global sound level for all Sound objects requested by this channel.
 *
 * @member {number} volume
 * @memberof rune.media.SoundChannel
 * @instance
 */
Object.defineProperty(rune.media.SoundChannel.prototype, "volume", {
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    get : function() {
        return this.m_gain.gain.value;
    },
    
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    set : function(value) {
        this.m_gain.gain.value = rune.util.Math.clamp(value, 0.0, 1.0);
    }
});

//------------------------------------------------------------------------------
// Internal prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The audio context.
 *
 * @member {boolean} context
 * @memberof rune.media.SoundChannel
 * @instance
 * @readonly
 * @package
 * @ignore
 */
Object.defineProperty(rune.media.SoundChannel.prototype, "context", {
    /**
     * @this rune.media.SoundChannel
     * @ignore
     */
    get : function() {
        return this.m_context;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Clears the current audio channel on Sound objects. This means that ongoing 
 * playback of Sound objects is stopped and all object references are destroyed.
 *
 * @returns {undefined}
 */
rune.media.SoundChannel.prototype.clear = function() {
    while (this.m_sounds.length) {
        this.remove(this.m_sounds[0], true);
    }
};

/**
 * Adjust the volume of the audio channel to a certain level.
 *
 * @param {number} to Target volume.
 * @param {number} duration Fade duration.
 *
 * @returns {undefined}
 */
rune.media.SoundChannel.prototype.fade = function(to, duration) {
    this.m_tweens.clear();
    this.m_tweens.create({
        target: this,
        transition: rune.tween.Sine.easeIn,
        duration: duration || 2500,
        args: {
            volume: to || 0
        }
    });
};

/**
 * Gets (and binds) a Sound object to the channel. The returned Sound object 
 * contains an interface for handling that particular sound, but all playback 
 * will be tied to the channel from which the object was created.
 *
 * @param {string} name The name of the resource file that the Sound object will use.
 * @param {boolean} [unique=false] Whether the object should be unique (true) or shared (false). 
 *
 * @returns {rune.media.Sound}
 */
rune.media.SoundChannel.prototype.get = function(name, unique) {
    if (this.m_shared) unique = false;
    if (!unique) {
        for (var i = 0; i < this.m_sounds.length; i++) {
            if (this.m_sounds[i]['name'] == name && !this.m_sounds[i]['unique']) {
                return this.m_sounds[i];
            }
        }   
    }
    
    var sound = new rune.media.Sound(this, name, unique);
    sound.connect(this.m_panner);
    this.m_sounds.push(sound);
    
    return sound;
};

/**
 * Pauses playback of all Sound objects on this channel.
 *
 * @returns {undefined}
 */
rune.media.SoundChannel.prototype.pause = function() {
    if (this.m_context && this.m_context.state === "running") {
        this.m_context.suspend();
    }
};

/**
 * Removes a Sound object from the channel. By default, objects are removed 
 * from the channel, but retained in memory. Set the dispose argument to true 
 * to destroy the object as it is removed from the channel. If the object is 
 * destroyed, a null reference is returned.
 *
 * @param {rune.media.Sound} sound Sound object to remove.
 * @param {boolean} dispose Whether the object should be deallocated.
 *
 * @returns {rune.media.Sound}
 */
rune.media.SoundChannel.prototype.remove = function(sound, dispose) {
    var index = this.m_sounds.indexOf(sound);
    if (index > -1) {
        this.m_sounds.splice(index, 1);
        if (dispose) {
            sound.dispose();
            sound = null;
        }
    } 
    
    return sound; 
};

/**
 * Resumes playback of all Sound objects on this channel.
 *
 * @returns {undefined}
 */
rune.media.SoundChannel.prototype.resume = function() {
    if (this.m_context && this.m_context.state === "suspended") {
        this.m_context.resume();
    }
};

//------------------------------------------------------------------------------
// Internal prototype methods
//------------------------------------------------------------------------------

/**
 * Updating the sound channel.
 *
 * @param {number} step Current time stamp.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.media.SoundChannel.prototype.update = function(step) {
    this.m_updateSounds(step);
    this.m_updateTweens(step);
};

/**
 * Removes the sound channel and clears memory allocated by it.
 *
 * @returns {undefined}
 * @package
 * @ignore
 */
rune.media.SoundChannel.prototype.dispose = function() {
    this.m_disposeSounds();
    this.m_disposePanner();
    this.m_disposeGain();
    this.m_disposeContext();
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
rune.media.SoundChannel.prototype.m_construct = function() {
    this.m_constructContext();
    this.m_constructGain();
    this.m_constructPanner();
    this.m_constructTweens();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the audio context.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_constructContext = function() {
    this.m_disposeContext();
    if (this.m_context == null) {
        this.m_context = new AudioContext();
    } else throw new Error();
};

/**
 * Creates the gain node.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_constructGain = function() {
    this.m_disposeGain();
    if (this.m_gain == null && this.m_context != null) {
        this.m_gain = this.m_context.createGain();
        this.m_gain.connect(this.m_context.destination);
    } else throw new Error();
};

/**
 * Creates the panner node.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_constructPanner = function() {
    this.m_disposePanner();
    if (this.m_panner == null && this.m_gain != null) {
        this.m_panner = this.m_context.createStereoPanner();
        this.m_panner.connect(this.m_gain);
    } else throw new Error();
};

/**
 * Creates the Tween system.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_constructTweens = function() {
    this.m_disposeTweens();
    if (this.m_tweens == null) {
        this.m_tweens = new rune.tween.Tweens();
    } else throw new Error();
};

/**
 * Updates Sound objects.
 *
 * @param {number} step Current time stamp.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_updateSounds = function(step) {
    var i = this.m_sounds.length;
    while (i--) {
        this.m_sounds[i].update(step);
    }
};

/**
 * Updates the Tween system.
 *
 * @param {number} step Current time stamp.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_updateTweens = function(step) {
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
rune.media.SoundChannel.prototype.m_disposeTweens = function() {
    if (this.m_tweens instanceof rune.tween.Tweens) {
        this.m_tweens.dispose();
        this.m_tweens = null;
    }
};

/**
 * Removes registered Sound objects.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_disposeSounds = function() {
    while (this.m_sounds.length) {
        this.remove(this.m_sounds[0], true);
    }
    
    this.m_sounds = null;
};

/**
 * Removes the panner node.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_disposePanner = function() {
    if (this.m_panner != null) {
        this.m_panner.disconnect();
        this.m_panner = null;
    }
};

/**
 * Removes the gain node.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_disposeGain = function() {
    if (this.m_gain != null) {
        this.m_gain.disconnect();
        this.m_gain = null;
    }
};

/**
 * Removes the audio context.
 *
 * @returns {undefined}
 * @private
 */
rune.media.SoundChannel.prototype.m_disposeContext = function() {
    if (this.m_context != null) {
        this.m_context.close();
        this.m_context = null;
    }
};