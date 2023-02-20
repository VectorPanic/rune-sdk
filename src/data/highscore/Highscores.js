//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object.
 *
 * @constructor
 *
 * @param {string} id The App ID.
 * @param {number} length The number of positions per highscore table.
 * @param {number} tables The number of highscore tables.
 *
 * @class
 * @classdesc
 * 
 * Represents one (or more) (local) highscore tables. A highscore consists of 
 * name, score and a timestamp (given in Unix time.) The table is sorted in 
 * numerical descending order, based on score. The actual data is saved in 
 * localstorage under a (for the application) unique key.
 */
rune.data.Highscores = function(id, length, tables) {
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------
    
    /**
     * List containing objects where each object is a high score.
     *
     * @type {Array.<Object>}
     * @private
     */
    this.m_data = null;
    
    /**
     * App ID.
     *
     * @type {string}
     * @private
     */
    this.m_id = id;
    
    /**
     * The number of positions per highscore table.
     *
     * @type {number}
     * @private
     */
    this.m_length = length || 10;
    
    /**
     * The number of highscore tables.
     *
     * @type {number}
     * @private
     */
    this.m_tables = tables || 1;
    
    //--------------------------------------------------------------------------
    // Private constants
    //--------------------------------------------------------------------------
    
    /**
     * ID suffix used to generate the highscore key.
     *
     * @const {string}
     * @private
     */
    this.SUFFIX = ".highscores";
    
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
 * A string value that uniquely identifies the highscore data in localstorage. 
 * Useful when several applications are distributed via the same domain.
 *
 * @member {string} key
 * @memberof rune.data.Highscores
 * @instance
 * @readonly
 */
Object.defineProperty(rune.data.Highscores.prototype, "key", {
    /**
     * @this rune.data.Highscores
     * @ignore
     */
    get : function() {
        return this.m_id + this.SUFFIX;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Removes all highscore data associated with the current application. 
 * Note that this action cannot be undone.
 *
 * @return {undefined}
 */
rune.data.Highscores.prototype.clear = function() {
    window.localStorage.removeItem(this['key']);
    this.m_constructData();
};

/**
 * Gets a specific high score based on ranking. Note that first places start 
 * with index 0 and not 1.
 *
 * @param {number} ranking Requested ranking.
 * @param {number} [table=0] Which table the data should be retrieved from.
 *
 * @return {Object}
 */
rune.data.Highscores.prototype.get = function(ranking, table) {
    table = table || 0;
    return this.m_data[table][ranking];
};

/**
 * Saves all high-score data in the device's LocalStorage. The method is 
 * called automatically when new data is added to the object. There is thus 
 * no reason to include the method in the public documentation.
 *
 * @return {undefined}
 * @ignore
 */
rune.data.Highscores.prototype.save = function() {
    window.localStorage.setItem(this['key'], JSON.stringify(this.m_data));
};

/**
 * Tests whether a score can qualify as a high score. The method returns the 
 * raking of the score in the form of an integer. The result -1 indicates that 
 * the score is outside the scope of the current high score table and thus not 
 * a high score. Note that a test does not affect the current high score list, 
 * nothing is saved or deleted when a test is performed.
 *
 * @param {number} score Score to test.
 * @param {number} [table=0] Table to test against.
 *
 * @return {number} Current ranking on the highscore list.
 */
rune.data.Highscores.prototype.test = function(score, table) {
    table = table || 0;
    for (var i = 0; i < this.m_data[table].length; i++) {
        if (score > this.m_data[table][i].score) {
            return i;
        }
    }
    
    return -1;
};

/**
 * Sends data to the highscore list. The data is saved if it qualifies as a 
 * highscore.
 *
 * @param {number} score Score to save.
 * @param {string} [name=Rune] Name of score holder.
 * @param {number} [table=0] Which table to use.
 *
 * @return {number} Current ranking on the highscore list.
 */
rune.data.Highscores.prototype.send = function(score, name, table) {
    table = table || 0;
    var index = this.test(score, table);
    if (index > -1) {
        this.m_data[table].splice(index, 0, {
            name: name || "Rune",
            score: score,
            date: Date.now()
        });
        
        this.m_data[table].length = this.m_length;
        this.save();
    }
    
    return index;
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Initiates deallocation of this object.
 *
 * @return {undefined}
 */
rune.data.Highscores.prototype.dispose = function() {
    this.m_data = null;
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * The class constructor.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.data.Highscores.prototype.m_construct = function() {
    this.m_constructData();
};

/**
 * Retrieves highscore data from LocalStorage. If no valid data can be 
 * retrieved, a new one is created.
 *
 * @return {undefined}
 * @protected
 * @ignore
 * @suppress {checkTypes}
 */
rune.data.Highscores.prototype.m_constructData = function() {
    this.m_data = JSON.parse(window.localStorage.getItem(this['key']));
    if (this.m_validate(this.m_data) == false) {
        this.m_data = [];
        for (var i = 0; i < this.m_tables; i++) {
            this.m_data.push(this.m_constructTable(this.m_length));
        }
            
        this.save();
    }
};

/**
 * Creates a new table.
 *
 * @param {number} [length] Length of table.
 *
 * @return {Array}
 * @protected
 * @ignore
 */
rune.data.Highscores.prototype.m_constructTable = function(length) {
    length = parseInt(length, 10) || this.m_length;
    var table = [];
    while (table.length < length) {
        table.push({
            name: "Rune",
            score: 0,
            date: Date.now()
        });
    }
    
    return table;
};

/**
 * Validates highscore data.
 *
 * @param {Array.<Object>} data Data to validate.
 *
 * @return {boolean}
 * @protected
 * @ignore
 */
rune.data.Highscores.prototype.m_validate = function(data) {
    if (Array.isArray(data)) {
        if (data.length == this.m_tables) {
            for (var i = 0; i < data.length; i++) {
                if (!Array.isArray(data[i]) || data[i].length != this.m_length) {
                    return false;
                }
            }
            
            return true;
        }
    }
    
    return false;
};