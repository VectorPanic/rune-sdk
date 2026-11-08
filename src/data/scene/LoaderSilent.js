//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Creates a new LoaderSilent object.
 *
 * @constructor
 * @extends rune.scene.Scene
 *
 * @param {rune.system.Config} options Application settings.
 *
 * @class
 * @classdesc
 * Loads application resources on an empty black scene, without a logo, sound,
 * progress display or presentation delays. Starts the configured scene as soon
 * as loading completes. Used outside debug mode when splashScreen is false and
 * no custom loader is specified. Intended for rune-os and approved distributions.
 */
rune.data.LoaderSilent = function(options) {

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Application settings, or null after disposal.
     *
     * @type {rune.system.Config}
     * @private
     */
    this.m_options = options;

    //--------------------------------------------------------------------------
    // SUPER CALL
    //--------------------------------------------------------------------------

    /**
     * Extend rune.scene.Scene.
     */
    rune.scene.Scene.call(this);
};

//------------------------------------------------------------------------------
// INHERITANCE
//------------------------------------------------------------------------------

rune.data.LoaderSilent.prototype = Object.create(rune.scene.Scene.prototype);
rune.data.LoaderSilent.prototype.constructor = rune.data.LoaderSilent;

//------------------------------------------------------------------------------
// OVERRIDE PUBLIC PROTOTYPE METHODS (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.data.LoaderSilent.prototype.init = function() {
    rune.scene.Scene.prototype.init.call(this);
    this.m_initResources();
};

/**
 * @inheritDoc
 */
rune.data.LoaderSilent.prototype.dispose = function() {
    this.m_options = null;
    rune.scene.Scene.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// PRIVATE PROTOTYPE METHODS
//------------------------------------------------------------------------------

/**
 * Starts loading immediately through the application's resource library.
 *
 * @returns {undefined}
 * @private
 */
rune.data.LoaderSilent.prototype.m_initResources = function() {
    var Batch = this.m_options.resources || rune.resource.Requests;
    this['application']['resources'].request({
        batch: new Batch(),
        onComplete: this.m_onComplete,
        onError: this.m_onError,
        scope: this
    });
};

/**
 * Requests the starting scene without waiting for presentation effects.
 *
 * @returns {undefined}
 * @private
 */
rune.data.LoaderSilent.prototype.m_onComplete = function() {
    if (this.m_options != null) {
        var Scene = this.m_options.scene || rune.scene.Scene;
        this['application']['scenes'].load([new Scene()]);
    }
};

/**
 * Records a failed resource without opening the console or starting the game.
 *
 * @param {string} name Name of the failed resource.
 *
 * @returns {undefined}
 * @private
 */
rune.data.LoaderSilent.prototype.m_onError = function(name) {
    if (this.m_options != null && this['console'] != null) {
        this['console'].log("Error: Could not load " + name + ".");
    }
};
