//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Sounds class.
 *
 * @constructor
 *
 * @class
 * @classdesc
 * 
 * The Sounds class represents a system for playing sound effects and music. 
 * The system is divided into three audio channels; Sound, Music and Master. 
 * Playback and handling are done via Sound objects that are retrieved from the 
 * sound channel to which the object is to be connected.
 */
rune.media.Sounds = function() {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * The master channel.
     *
     * @type {rune.media.SoundChannel}
     * @private
     */
    this.m_master = null;
    
    /**
     * The music channel.
     *
     * @type {rune.media.SoundChannel}
     * @private
     */
    this.m_music = null;
    
    /**
     * The sound channel.
     *
     * @type {rune.media.SoundChannel}
     * @private
     */
    this.m_sound = null;
    
    //--------------------------------------------------------------------------
    // Constructor call
    //--------------------------------------------------------------------------

    /**
     * The class constructor.
     */
    this.m_construct();
};

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * The Master Channel. This channel is for special cases and can therefore 
 * contain both sound and / or music. This channel does not stop playback when 
 * the application switches from one set of scenes to another. The channel is 
 * also limited to only shared audio objects, ie the channel can thus not 
 * contain "unique" Sound objects. This is so that the same Sound object can 
 * be retrieved between scene changes.
 *
 * @member {rune.media.soundChannel} master
 * @memberof rune.media.Sounds
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sounds.prototype, "master", {
    /**
     * @this rune.media.Sounds
     * @ignore
     */
    get : function() {
        return this.m_master;
    }
});

/**
 * The music channel. This channel is intended for playing background music so 
 * that it can be easily isolated from sound effects. The channel allows both 
 * "unique" and "shared" audio objects. When the application switches between a 
 * set of scenes, the sound channel is stopped and emptied of all existing 
 * Sound objects.
 *
 * @member {rune.media.soundChannel} music
 * @memberof rune.media.Sounds
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sounds.prototype, "music", {
    /**
     * @this rune.media.Sounds
     * @ignore
     */
    get : function() {
        return this.m_music;
    }
});

/**
 * The sound channel. This channel is intended for sound effects. The channel 
 * allows both "unique" and "shared" audio objects. Just like the Music 
 * channel, the channel is emptied when the application switches from one set 
 * of scenes to another.
 *
 * @member {rune.media.soundChannel} sound
 * @memberof rune.media.Sounds
 * @instance
 * @readonly
 */
Object.defineProperty(rune.media.Sounds.prototype, "sound", {
    /**
     * @this rune.media.Sounds
     * @ignore
     */
    get : function() {
        return this.m_sound;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Clears all Sound objects from the Sound and Music channels.
 *
 * @returns {undefined}
 * @ignore
 */
rune.media.Sounds.prototype.clear = function() {
    this.m_sound.clear();
    this.m_music.clear();
};

/**
 * Removes this object and frees allocated memory.
 *
 * @returns {undefined}
 * @ignore
 */
rune.media.Sounds.prototype.dispose = function() {
    this.m_disposeSound();
    this.m_disposeMusic();
    this.m_disposeMaster();
};

/**
 * Updates all audio channels.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @ignore
 */
rune.media.Sounds.prototype.update = function(step) {
    this.m_updateMaster(step);
    this.m_updateMusic(step);
    this.m_updateSound(step);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Class constructor method. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_construct = function() {
    this.m_constructMaster();
    this.m_constructMusic();
    this.m_constructSound();
};

/**
 * Creates the master channel. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_constructMaster = function() {
    this.m_disposeMaster();
    if (this.m_master == null) {
        this.m_master = new rune.media.SoundChannel(true);
    } else throw new Error();
};

/**
 * Creates the music channel. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_constructMusic = function() {
    this.m_disposeMusic();
    if (this.m_music == null) {
        this.m_music = new rune.media.SoundChannel(false);
    } else throw new Error();
};

/**
 * Creates the sound channel. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_constructSound = function() {
    this.m_disposeSound();
    if (this.m_sound == null) {
        this.m_sound = new rune.media.SoundChannel(false);
    } else throw new Error();
};

/**
 * Updates the master channel.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_updateMaster = function(step) {
    if (this.m_master) {
        this.m_master.update(step);
    }
};

/**
 * Updates the music channel.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_updateMusic = function(step) {
    if (this.m_music) {
        this.m_music.update(step);
    }
};

/**
 * Updates the sound channel.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_updateSound = function(step) {
    if (this.m_sound) {
        this.m_sound.update(step);
    }
};

/**
 * Removes the sound channel. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_disposeSound = function() {
    if (this.m_sound instanceof rune.media.SoundChannel) {
        this.m_sound.dispose();
        this.m_sound = null;
    }
};

/**
 * Removes the music channel. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_disposeMusic = function() {
    if (this.m_music instanceof rune.media.SoundChannel) {
        this.m_music.dispose();
        this.m_music = null;
    }
};

/**
 * Removes the master channel. 
 *
 * @returns {undefined}
 * @protected
 * @ignore
 */
rune.media.Sounds.prototype.m_disposeMaster = function() {
    if (this.m_master instanceof rune.media.SoundChannel) {
        this.m_master.dispose();
        this.m_master = null;
    }
};