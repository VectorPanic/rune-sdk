//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new configuration object. The options argument is used to 
 * override default settings.
 *
 * @constructor
 *
 * @param {Object} [options=null] Application settings.
 * 
 * @class
 * @classdesc
 * 
 * The Config class contains global settings for an application. The settings 
 * are used primarily during start-up to give the application the right 
 * conditions; resolution, image refresh rate, etc.
 */
rune.system.Config = function(options) {
    
    //--------------------------------------------------------------------------
    // Default argument values
    //--------------------------------------------------------------------------

    /**
     * @ignore
     */
    options = options || {};

    /**
     * @ignore
     */
    var option = function(name, value) {
        return options[name] !== undefined ? options[name] : value;
    };
    
    //--------------------------------------------------------------------------
    // Public properties
    //--------------------------------------------------------------------------
    
    /**
     * The bundle name of the application. The name must correspond to the root 
     * object of the application.
     *
     * @type {string}
     */
    this.app = option("app", "");
    
    /**
     * The build ID is used to identify a particular version, build or state of 
     * the application. Suggestedly, semantic versioning is used to design a 
     * build ID.
     *
     * @type {string}
     * @default 0.0.0
     */
    this.build = option("build", "0.0.0");
    
    /**
     * Whether to execute the application in debug mode (true), or not (false).
     *
     * @type {boolean}
     * @default false
     */
    this.debug = Boolean(option("debug", false));
    
    /**
     * The Developer ID is used to uniquely identify the developer/origin of 
     * the application. The ID is designed according to the Reverse Domain 
     * Name System (R-DNS), as follows: extension.name. Example: 
     * "com.vectorpanic".
     *
     * @type {string}
     */
    this.developer = option("developer", "");
    
    /**
     * Requested frame rate for the application.
     *
     * @type {number}
     * @default 60
     */
    this.framerate = option("framerate", 60);
    
    /**
     * Refers to the Scene to be used to load the application's resources. 
     *
     * @type {Function}
     * @default null
     */
    this.loader = options.loader || rune.data.Loader;
    
    /**
     * The number of places on the highscore list.
     *
     * @type {number}
     * @default 5
     */
    this.numHighscores = option("numHighscores", 5);
    
    /**
     * The number of highscore lists that the application should allocate.
     *
     * @type {number}
     * @default 1
     */
    this.numHighscoreTables = option("numHighscoreTables", 1);
    
    /**
     * A Requests object containing a list of the resources to be included in 
     * the application.
     *
     * @type {Function}
     */
    this.resources = options.resources || null;
    
    /**
     * Reference to the scene class to be used after the start-up process is 
     * completed. This class thus constitutes the starting point for the 
     * current application.
     *
     * @type {Function}
     * @default rune.scene.Scene
     */
    this.scene = options.scene || rune.scene.Scene;
    
    /**
     * The native pixel width of the application.
     *
     * @type {number}
     * @default 384
     */
    this.screenResolutionX = option("screenResolutionX", 400); //320; //384;
    
    /**
     * The native pixel height of the application.
     *
     * @type {number}
     * @default 216
     */
    this.screenResolutionY = option("screenResolutionY", 225); //180; //216;

    /**
     * DOM target where the application's primary canvas element should be
     * attached. Use null to attach the canvas to document.body.
     *
     * @type {HTMLElement|string}
     * @default null
     */
    this.target = option("target", null);
    
    /**
     * If the application is to be started with support for gamepad devices.
     *
     * @type {boolean}
     * @default false
     */
    this.useGamepads = Boolean(options.useGamepads);
    
    /**
     * If the application is to be started with keyboard input support.
     *
     * @type {boolean}
     * @default false
     */
    this.useKeyboard = Boolean(options.useKeyboard);
};