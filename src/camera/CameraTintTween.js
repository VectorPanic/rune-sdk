//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of CameraTintTween.
 *
 * @constructor
 * @extends rune.camera.CameraTint
 * @abstract
 * 
 * @class
 * @classdesc
 * 
 * The CameraTintTween class is an abstract base class for camera effects that 
 * change color tone (tint) over time. Effects such as (camera) Fade and 
 * (camera) Flash are based on this class.
 */
rune.camera.CameraTintTween = function() {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Handler for Tween objects.
     *
     * @type {rune.tween.Tweens}
     * @protected
     * @ignore
     */
    this.m_tweens = null;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend CameraTint.
     */
    rune.camera.CameraTint.call(this);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.camera.CameraTintTween.prototype = Object.create(rune.camera.CameraTint.prototype);
rune.camera.CameraTintTween.prototype.constructor = rune.camera.CameraTintTween;

//------------------------------------------------------------------------------
// Override public getter and setter methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
Object.defineProperty(rune.camera.CameraTintTween.prototype, "opacity", {
    /**
     * @this rune.camera.CameraTintTween
     * @ignore
     * @suppress {accessControls}
     */
    get : function() {
        return this.m_opacity;
    },
    
    /**
     * @this rune.camera.CameraTintTween
     * @ignore
     * @suppress {accessControls}
     */
    set : function(value) {
        this.m_tweens.clear();
        this.m_opacity = rune.util.Math.clamp(value, 0.0, 1.0);
    }
});

//------------------------------------------------------------------------------
// Override internal prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.camera.CameraTintTween.prototype.update = function(step) {
    rune.camera.CameraTint.prototype.update.call(this, step);
    this.m_tweens.update(step);
}

/**
 * @inheritDoc
 */
rune.camera.CameraTintTween.prototype.dispose = function() {
    this.m_disposeTweens();
    rune.camera.CameraTint.prototype.dispose.call(this);
}

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * Class constructor.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.CameraTintTween.prototype.m_construct = function() {
    rune.camera.CameraTint.prototype.m_construct.call(this);
    this.m_constructTweens();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the handler for Tween objects.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.CameraTintTween.prototype.m_constructTweens = function() {
    this.m_disposeTweens();
    if (this.m_tweens == null) {
        this.m_tweens = new rune.tween.Tweens();
    }
};

/**
 * Removes the Tween object handler.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.camera.CameraTintTween.prototype.m_disposeTweens = function() {
    if (this.m_tweens instanceof rune.tween.Tweens) {
        this.m_tweens.dispose();
        this.m_tweens = null;
    }
};