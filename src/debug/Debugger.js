//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Debugger class.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {number} [width=0.0] Debugger width in pixels.
 * @param {number} [height=0.0] Debugger height in pixels.
 *
 * @class
 * @classdesc
 * 
 * The Debugger class represents a tool for visualizing debug data; such as 
 * frame rate, rendering and update time, and the use of audio channels.
 */
rune.debug.Debugger = function(width, height) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Visualizes framerate.
     *
     * @type {rune.debug.Framerate}
     * @private
     */
    this.m_framerate = null;
    
    /**
     * Visualizes framerate over time.
     *
     * @type {rune.debug.Histogram}
     * @private
     */
    this.m_histogram = null;
    
    /**
     * Describes how many sounds are registered to the master channel.
     *
     * @type {rune.debug.Master}
     * @private
     */
    this.m_master = null;
    
    /**
     * Visualizes memory consumption.
     *
     * @type {rune.debug.Memory}
     * @private
     */
    this.m_memory = null;
    
    /**
     * Describes how many sounds are registered to the music channel.
     *
     * @type {rune.debug.Music}
     * @private
     */
    this.m_music = null;
    
    /**
     * Visualizes rendering time.
     *
     * @type {rune.debug.Render}
     * @private
     */
    this.m_render = null;
    
    /**
     * Visualizes update time.
     *
     * @type {rune.debug.Update}
     * @private
     */
    this.m_update = null;
    
    /**
     * Describes how many sounds are registered to the sound channel.
     *
     * @type {rune.debug.Sound}
     * @private
     */
    this.m_sound = null;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend DisplayObjectContainer
     */
    rune.display.DisplayObjectContainer.call(this, 0, 0, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.debug.Debugger.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.debug.Debugger.prototype.constructor = rune.debug.Debugger;

//------------------------------------------------------------------------------
// Private static constants
//------------------------------------------------------------------------------

/**
 * Key used to enable and disable the debugger.
 *
 * @const {string}
 * @private
 */
rune.debug.Debugger.TOGGLE_KEY = "D";

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Debugger.prototype.update = function(step) {
    rune.display.DisplayObjectContainer.prototype.update.call(this, step);
    this.m_updateInput();
};

/**
 * @inheritDoc
 */
rune.debug.Debugger.prototype.dispose = function() {
    this.m_disposeMemory();
    this.m_disposeRender();
    this.m_disposeUpdate();
    this.m_disposeHistogram();
    this.m_disposeFramerate();
    rune.display.DisplayObjectContainer.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.debug.Debugger.prototype.m_construct = function() {
    rune.display.DisplayObjectContainer.prototype.m_construct.call(this);
    this.m_constructFramerate();
    this.m_constructHistogram();
    this.m_constructUpdate();
    this.m_constructRender();
    this.m_constructMemory();
    this.m_constructSound();
    this.m_constructMusic();
    this.m_constructMaster();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the object for calculating and visualizing the frame rate.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructFramerate = function() {
    this.m_disposeFramerate();
    if (this.m_framerate == null) {
        this.m_framerate = new rune.debug.Framerate();
        this.addChild(this.m_framerate);
    } else throw new Error();
};

/**
 * Creates histograms that visualize framerate over time.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructHistogram = function() {
    this.m_disposeHistogram();
    if (this.m_histogram == null) {
        this.m_histogram = new rune.debug.Histogram(28, 0, 40, 10);
        this.addChild(this.m_histogram);
    } else throw new Error();
};

/**
 * Creates an object to visualize update time.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructUpdate = function() {
    this.m_disposeUpdate();
    if (this.m_update == null) {
        this.m_update = new rune.debug.Update();
        this.m_update.x = 72;
        this.addChild(this.m_update);
    } else throw new Error();
};

/**
 * Creates an object to visualize rendering time.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructRender = function() {
    this.m_disposeRender();
    if (this.m_render == null) {
        this.m_render = new rune.debug.Render();
        this.m_render.x = 100;
        this.addChild(this.m_render);
    } else throw new Error();
};

/**
 * Creates an object to visualize memory consumption.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructMemory = function() {
    this.m_disposeMemory();
    if (this.m_memory == null) {
        this.m_memory = new rune.debug.Memory();
        this.m_memory.x = 128;
        this.addChild(this.m_memory);
    } else throw new Error();
};

/**
 * Creates the object that represents the debug data for the sound channel.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructSound = function() {
    this.m_disposeSound();
    if (this.m_sound == null) {
        this.m_sound = new rune.debug.Sound();
        this.m_sound.x = 186;
        this.addChild(this.m_sound);
    } else throw new Error();
};

/**
 * Creates the object that represents the debug data for the music channel.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructMusic = function() {
    this.m_disposeMusic();
    if (this.m_music == null) {
        this.m_music = new rune.debug.Music();
        this.m_music.x = 214;
        this.addChild(this.m_music);
    } else throw new Error();
};

/**
 * Creates the object that represents the debug data for the master channel.
 *
 * @throws {Error} If the object already exists.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_constructMaster = function() {
    this.m_disposeMaster();
    if (this.m_master == null) {
        this.m_master = new rune.debug.Master();
        this.m_master.x = 242;
        this.addChild(this.m_master);
    } else throw new Error();
};

/**
 * Listens for keyboard input to show and hide debug data.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_updateInput = function() {
    if (this['keyboard'].pressed("SHIFT")) {
        if (this['keyboard'].justPressed(rune.debug.Debugger.TOGGLE_KEY)) {
            this['visible'] = !this['visible'];
        }
    }
};

/**
 * Removes the object that represents the debug data for the master channel.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeMaster = function() {
    if (this.m_master != null) {
        if (this.m_master['parent']) {
            this.m_master['parent'].removeChild(this.m_master, true);
        }
        
        this.m_master = null;
    }
};

/**
 * Removes the object that represents the debug data for the music channel.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeMusic = function() {
    if (this.m_music != null) {
        if (this.m_music['parent']) {
            this.m_music['parent'].removeChild(this.m_music, true);
        }
        
        this.m_music = null;
    }
};

/**
 * Removes the object that represents the debug data for the sound channel.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeSound = function() {
    if (this.m_sound != null) {
        if (this.m_sound['parent']) {
            this.m_sound['parent'].removeChild(this.m_sound, true);
        }
        
        this.m_sound = null;
    }
};

/**
 * Removes objects and frees up memory.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeMemory = function() {
    if (this.m_memory != null) {
        if (this.m_memory['parent']) {
            this.m_memory['parent'].removeChild(this.m_memory, true);
        }
        
        this.m_memory = null;
    }
};

/**
 * Removes objects and frees up memory.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeRender = function() {
    if (this.m_render != null) {
        if (this.m_render['parent']) {
            this.m_render['parent'].removeChild(this.m_render, true);
        }
        
        this.m_render = null;
    }
};

/**
 * Removes objects and frees up memory.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeUpdate = function() {
    if (this.m_update != null) {
        if (this.m_update['parent']) {
            this.m_update['parent'].removeChild(this.m_update, true);
        }
        
        this.m_update = null;
    }
};

/**
 * Removes objects and frees up memory.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeHistogram = function() {
    if (this.m_histogram != null) {
        if (this.m_histogram['parent']) {
            this.m_histogram['parent'].removeChild(this.m_histogram, true);
        }
        
        this.m_histogram = null;
    }
};

/**
 * Removes objects and frees up memory.
 *
 * @return {undefined}
 * @private
 */
rune.debug.Debugger.prototype.m_disposeFramerate = function() {
    if (this.m_framerate != null) {
        if (this.m_framerate['parent']) {
            this.m_framerate['parent'].removeChild(this.m_framerate, true);
        }
        
        this.m_framerate = null;
    }
};