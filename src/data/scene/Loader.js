//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the Loader class.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @param {rune.system.Config} options
 *
 * @class
 * @classdesc
 * 
 * The Loader class is a Scene that loads and encodes the resource files used 
 * by the current application. The class is used by Rune to ensure that all the 
 * necessary resources are available in the resource library before the 
 * application logic begins.
 */
rune.data.Loader = function(options) {

    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * The primary (and only) camera.
     *
     * @type {rune.camera.Camera}
     * @private
     */
    this.m_camera = null;
    
    /**
     * Logo graphics.
     *
     * @type {rune.display.Graphic}
     * @private
     */
    this.m_logo = null;
    
    /**
     * The stage consists of two stages; load resources and fade-in / -out 
     * transitions. When both are completed, the next scene is activated.
     *
     * @type {number}
     * @private
     */
    this.m_numStepCompleted = 0;

    /**
     * An instance of the Config class.
     *
     * @type {rune.system.Config}
     * @private
     */
    this.m_options = options;
    
    /**
     * The progress bar.
     *
     * @type {Object}
     * @private
     */
    this.m_progressbar = null;
    
    /**
     * Boot sound.
     *
     * @type {rune.media.Sound}
     * @private
     */
    this.m_sound = null;

    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend Scene.
     */
    rune.scene.Scene.call(this);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.data.Loader.prototype = Object.create(rune.scene.Scene.prototype);
rune.data.Loader.prototype.constructor = rune.data.Loader;

//------------------------------------------------------------------------------
// Private static constants
//------------------------------------------------------------------------------

/**
 * Start and stop delay.
 *
 * @constant {number}
 * @private
 */
rune.data.Loader.DELAY_DURATION = 1000;

/**
 * The length of the fade effects.
 *
 * @constant {number}
 * @private
 */
rune.data.Loader.FADE_DURATION = 2500;

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.data.Loader.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_initLogo();
    this.m_initProgressbar();
    this.m_initSound();
};

/**
 * @inheritDoc
 */
rune.data.Loader.prototype.dispose = function() {
    this.m_disposeSound();
    this.m_disposeProgressbar();
    this.m_disposeLogo();
    rune.scene.Scene.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.data.Loader.prototype.m_initCamera = function() {
    rune.scene.Scene.prototype.m_initCamera.call(this);
    this.m_camera = this['cameras'].getCameraAt(0);
    this.m_camera['fade']['opacity'] = 1.0;
    this['timers'].create({
        duration: rune.data.Loader.DELAY_DURATION,
        onComplete: this.m_fadeIn,
        scope: this
    });
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the logo.
 *
 * @throws {Error} If a logo already exists.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_initLogo = function() {
    this.m_disposeLogo();
    if (this.m_logo == null) {
        this.m_logo = new rune.data.Logo();
        
        if (this['application']['screen']['width']  >= 1280 && 
            this['application']['screen']['height'] >= 720) {
            this.m_logo.scaleX = 2.0;
            this.m_logo.scaleY = 2.0;
        }
        
        this.m_logo["center"] = this["application"]["screen"]["center"];
        this["stage"].addChild(this.m_logo);
        
    } else throw new Error();
};

/**
 * Creates the progress bar.
 *
 * @throws {Error} If a progress bar already exists.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_initProgressbar = function() {
    this.m_disposeProgressbar();
    if (this.m_progressbar == null) {
        this.m_progressbar = new rune.ui.Progressbar(
            this["application"]["screen"]["width"],
            1
        );
        
        if (this['application']['screen']['width']  >= 1280 && 
            this['application']['screen']['height'] >= 720) {
            this.m_progressbar.scaleX = 2.0;
            this.m_progressbar.scaleY = 2.0;
        }
        
        this.m_progressbar.bottom = this["application"]["screen"]["height"];
        this.m_progressbar.progress = 0.0;
        this.m_camera.addChild(this.m_progressbar);
    } else throw new Error();
};

/**
 * Creates the Sound object used to play the startup sound.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_initSound = function() {
    this.m_disposeSound();
    if (this.m_sound == null) {
        this.m_sound = this['application']['sounds']['sound'].get("rune_sound_startup");
    }
};

/**
 * Removes the Sound object used to play the startup sound.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_disposeSound = function() {
    if (this.m_sound != null) {
        this.m_sound.dispose();
        this.m_sound = null;
    }
};

/**
 * Removes the progress bar.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_disposeProgressbar = function() {
    if (this.m_progressbar != null) {
        this.m_progressbar.parent.removeChild(this.m_progressbar, true);
        this.m_progressbar = null;
    }
};

/**
 * Removes the logo.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_disposeLogo = function() {
    if (this.m_logo != null) {
        this.m_logo['parent'].removeChild(this.m_logo, true);
        this.m_logo = null;
    }
};

/**
 * Fade in.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_fadeIn = function() {
    if (this.m_camera instanceof rune.camera.Camera) {
        this.m_camera['fade'].in(
            rune.data.Loader.FADE_DURATION,
            this.m_onFadeInComplete,
            this
        );
    }
    
    this.m_sound.play();
};

/**
 * Called when the camera fade-in effect is completed.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_onFadeInComplete = function() {
    this.m_loadResources();
    this['timers'].create({
        duration: rune.data.Loader.DELAY_DURATION,
        scope: this,
        onComplete: function() {
            if (++this.m_numStepCompleted === 2) {
                this.m_fadeOut();
            }
        }
    });
};

/**
 * Loads application resources to the resource library.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_loadResources = function() {
    var Batch = this.m_options.resources || rune.resource.Requests;
    this['application']['resources'].request({
        batch: new Batch(),
        onComplete: this.m_onLoadComplete,
        onProgress: this.m_onResourcesProgress,
        scope: this
    });
};

/**
 * Called on two occasions: 1. When all resources have been loaded. 2. When 
 * the delay time has expired.
 *
 * @returns {undefined}
 * @private
 */
rune.data.Loader.prototype.m_onLoadComplete = function() {
    if (++this.m_numStepCompleted === 2) {
        this.m_fadeOut();
    }
};

/**
 * Called when a requested resource has been successfully loaded by the 
 * application.
 *
 * @param {number} progress Indicates the progress of the loading process.
 * @param {string} name The name of the loaded resource.
 * @param {number} size The size of the loaded resource (in bytes).
 * @param {string} type The loaded resource MIME type.
 * @param {Object} resource The loaded resource (in encoded format).
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_onResourcesProgress = function(progress, name, size, type, resource) {
    if (this.m_progressbar != null) {
        this.m_progressbar.progress = progress;
    }
};

/**
 * Fade out.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_fadeOut = function() {
    if (this.m_camera instanceof rune.camera.Camera) {
        this.m_camera['fade'].out(
            rune.data.Loader.FADE_DURATION,
            this.m_onFadeOutComplete,
            this
        );
        
        if (this.m_progressbar != null) {
            this.m_progressbar.progress = 1.0;
        }
    }
};

/**
 * Called when the camera fade-out effect is completed.
 *
 * @return {undefined}
 * @private
 */
rune.data.Loader.prototype.m_onFadeOutComplete = function() {
    var scenes = (this.m_options.scene != null) ? [new this.m_options.scene()] : [new rune.scene.Scene()];
    this['application']['scenes'].load(scenes);
};