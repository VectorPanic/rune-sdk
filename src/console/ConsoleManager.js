//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new instance of the ConsoleManager class.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {number} [width] Width in pixels.
 * @param {number} [height] Height in pixels.
 * 
 * @class
 * @classdesc
 * 
 * The ConsoleManager class represents the user interface of the developer 
 * console. The class ensures that the console is used correctly within the 
 * Rune ecosystem.
 */
rune.console.ConsoleManager = function(width, height) {
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * Whether or not the user can manually enable or disable the console.
     *
     * @type {boolean}
     * @default true
     */
    this.interactive = true;
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * Reference to console objects that this class handles.
     *
     * @type {rune.console.Console}
     * @private
     */
    this.m_console = null;
    
    /**
     * Whether the console receives text input or not.
     *
     * @type {boolean}
     * @private
     */
    this.m_responsive = true;
    
    /**
     * Used to animate the console.
     *
     * @type {rune.tween.Tweens}
     * @private
     */
    this.m_tweens = null;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extends DisplayObjectContainer.
     */
    rune.display.DisplayObjectContainer.call(this, 0, 0, width, height);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.console.ConsoleManager.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.console.ConsoleManager.prototype.constructor = rune.console.ConsoleManager;

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * The key used to show and hide the console.
 *
 * @constant {string}
 */
rune.console.ConsoleManager.CONSOLE_TRIGGER = "BACKQUOTE";

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the console's command system. Use this reference to add and 
 * delete console commands.
 *
 * @member {rune.console.ConsoleCommands} commands
 * @memberof rune.console.ConsoleManager
 * @instance
 * readonly
 */
Object.defineProperty(rune.console.ConsoleManager.prototype, "commands", {
    /**
     * @this rune.console.ConsoleManager
     * @ignore
     */
    get : function() {
        return this.m_console['commands'];
    }
});

/**
 * Refers to an instance of the console object being handled.
 *
 * @member {rune.console.Console} instance
 * @memberof rune.console.ConsoleManager
 * @instance
 * readonly
 */
Object.defineProperty(rune.console.ConsoleManager.prototype, "instance", {
    /**
     * @this rune.console.ConsoleManager
     * @ignore
     */
    get : function() {
        return this.m_console;
    }
});

/**
 * If the console is passive, it can either be activated manually or receive 
 * input data. A passive console can still present data via its output.
 *
 * @member {boolean} passive
 * @memberof rune.console.ConsoleManager
 * @instance
 */
Object.defineProperty(rune.console.ConsoleManager.prototype, "passive", {
    /**
     * @this rune.console.ConsoleManager
     * @ignore
     */
    get : function() {
        return !(this.interactive && this.m_console['input'].enabled);
    },
    
    /**
     * @this rune.console.ConsoleManager
     * @ignore
     */
    set : function(value) {
        this.interactive = !value;
        this.m_console['input'].enabled = !value;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Show the console.
 *
 * @param {Function} [callback] Called when the animation has reached its end.
 * @param {Object} [scope] Scope of the callback function.
 *
 * @returns {undefined}
 */
rune.console.ConsoleManager.prototype.hide = function(callback, scope) {
    if (this.m_console && this.m_console['parent']) {
        if (this.m_responsive == true) {
            this.m_animate(0.0, 360, function() {
                this.removeChild(this.m_console);
                this['visible'] = false;
                if (typeof callback === "function") {
                    callback.call(scope);
                }
            });
        }
    }
};

/**
 * Adds a test string to the console output.
 *
 * @param {string} str String to add.
 *
 * @returns {undefined}
 */
rune.console.ConsoleManager.prototype.log = function(str) {
    if (this.m_console != null) {
        this.m_console.log(String(str));
    }
};

/**
 * Show the console.
 *
 * @param {Function} [callback] Called when the animation has reached its end.
 * @param {Object} [scope] Scope of the callback function.
 *
 * @returns {undefined}
 */
rune.console.ConsoleManager.prototype.show = function(callback, scope) {
    if (this.m_console && !this.m_console['parent']) {
        if (this.m_responsive == true) {
            this['visible'] = true;
            this.addChild(this.m_console);
            this.m_animate(0.5, 360, function() {
                if (typeof callback === "function") {
                    callback.call(scope);
                }
            });
        }
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Displays part of the console.
 *
 * @param {number} ammount How much of the console to display.
 *
 * @returns {undefined}
 * @ignore
 */
rune.console.ConsoleManager.prototype.set = function(ammount) {
    ammount = ammount || 0.0;
    if (this.m_console) {
        if (ammount > 0) {
            if (this.m_console['parent'] == null) {
                this.addChild(this.m_console);
                this['visible'] = true;
            }
            
            this.m_console['bottom'] = this['height'] * ammount;
        } else {
            this.removeChild(this.m_console, false);
            this['visible'] = false;
        }
    }
};

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.console.ConsoleManager.prototype.update = function(step) {
    rune.display.DisplayObjectContainer.prototype.update.call(this, step);
    this.m_updateTweens(step);
    this.m_updateInputs(step);
};

/**
 * @inheritDoc
 */
rune.console.ConsoleManager.prototype.dispose = function() {
    this.m_disposeConsole();
    this.m_disposeTweens();
    rune.display.DisplayObjectContainer.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.console.ConsoleManager.prototype.m_construct = function() {
    rune.display.DisplayObjectContainer.prototype.m_construct.call(this);
    this.m_constructTweens();
    this.m_constructConsole();
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the tween system used for animation.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleManager.prototype.m_constructTweens = function() {
    this.m_disposeTweens();
    if (this.m_tweens == null) {
        this.m_tweens = new rune.tween.Tweens();
    }
};

/**
 * Creates the console.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleManager.prototype.m_constructConsole = function() {
    this.m_disposeConsole();
    if (this.m_console == null) {
        this.m_console = new rune.console.Console(this.width, this.height);
        this.m_console['bottom'] = 0;
        
        if (this.m_console.width  >= 1280 && 
            this.m_console.height >= 720) {
            this.m_console.width  = this.m_console.width  >> 1;
            this.m_console.height = this.m_console.height >> 1;
            this.m_console.scaleX = 2.0;
            this.m_console.scaleY = 2.0;
        }
    } else throw new Error();
};

/**
 * Updates the tween system.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleManager.prototype.m_updateTweens = function(step) {
    if (this.m_tweens != null) {
        this.m_tweens.update(step);
    }
};

/**
 * Updating input.
 *
 * @param {number} step Current time step.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleManager.prototype.m_updateInputs = function(step) {
    if (this.interactive) {
        if (this['keyboard'] && this['keyboard'].justPressed(rune.console.ConsoleManager.CONSOLE_TRIGGER)) {
            if (this.m_console['parent'] == null) this.show();
            else this.hide();
        }
    }
};

/**
 * Removes the console.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleManager.prototype.m_disposeConsole = function() {
    if (this.m_console instanceof rune.console.Console) {
        this.m_console.dispose();
        this.m_console = null;
    }
};

/**
 * Removes the tween system.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleManager.prototype.m_disposeTweens = function() {
    if (this.m_tweens instanceof rune.tween.Tweens) {
        this.m_tweens.dispose();
        this.m_tweens = null;
    }
};

/**
 * Animate the console.
 *
 * @param {number} p Percent.
 * @param {number} d Duration.
 * @param {Function} [c] Callback.
 *
 * @returns {undefined}
 * @private
 */
rune.console.ConsoleManager.prototype.m_animate = function(p, d, c) {
    this.m_responsive = false;
    this.m_tweens.clear();
    this.m_tweens.create({
        target: this.m_console,
        duration: d,
        scope: this,
        onDispose: function() {
            this.m_responsive = true;
            if (typeof c === "function") {
                c.call(this, console);
            }
        },
        args: {
            bottom: this.height * p
        }
    });
};