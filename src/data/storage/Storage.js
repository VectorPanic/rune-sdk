//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates application-scoped persistent storage.
 *
 * @constructor
 *
 * @param {string} id Unique application ID, matching Application.id.
 * @throws {Error} If the application ID is missing or invalid.
 *
 * @class
 * @classdesc
 *
 * Stores JSON-compatible values in localStorage under the application ID plus
 * ".storage". Reads current data for each operation so separate instances do
 * not overwrite unrelated values using stale snapshots. Values are returned as
 * independent JSON data; modifying a returned object requires another set().
 * Storage access and serialization errors never escape the public methods.
 * A valid explicit application ID is required at construction.
 */
rune.data.Storage = function(id) {
    
    //--------------------------------------------------------------------------
    // Private constants
    //--------------------------------------------------------------------------
    
    /**
     * ID suffix used to generate the storage key.
     *
     * @const {string}
     * @private
     */
    this.SUFFIX = ".storage";
    
    //--------------------------------------------------------------------------
    // Private properties
    //--------------------------------------------------------------------------

    /**
     * Application-scoped storage key, or null after disposal.
     * @type {?string}
     * @private
     */
    this.m_key = rune.data.StorageKey.create(id, this.SUFFIX);
};

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * The localStorage key used by this handler, or null after disposal.
 *
 * @member {?string} key
 * @memberof rune.data.Storage
 * @instance
 * @readonly
 */
Object.defineProperty(rune.data.Storage.prototype, "key", {
    /**
     * @this rune.data.Storage
     * @ignore
     */
    get : function() {
        return this.m_key;
    }
});

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Reads a named value. Returns the default for missing data, invalid names,
 * unavailable storage or corrupt JSON. Stored false, zero and null are retained.
 *
 * @param {string} name Nonempty value name.
 * @param {*} [defaultValue] Value returned when the name cannot be read.
 *
 * @return {*} The stored value or default.
 */
rune.data.Storage.prototype.get = function(name, defaultValue) {
    if (typeof name !== "string" || name.length === 0) return defaultValue;
    var data = this.m_read();
    return data != null && Object.prototype.hasOwnProperty.call(data, name) ? data[name] : defaultValue;
};

/**
 * Saves a value immediately, preserving other entries in this game's storage.
 * JSON-compatible values are accepted. Undefined, functions, symbols, non-finite
 * numbers and cyclic structures fail without changing the persisted document.
 * Objects with toJSON methods follow normal JSON conversion rules.
 *
 * @param {string} name Nonempty value name.
 * @param {*} value The value to store.
 *
 * @return {boolean} Whether the value was persisted successfully.
 */
rune.data.Storage.prototype.set = function(name, value) {
    var key = this.m_key;
    if (key == null) return false;
    if (typeof name !== "string" || name.length === 0) return false;
    var data = this.m_read();
    if (data == null) return false;
    try {
        var json = JSON.stringify(value, function(key, entry) {
            var type = typeof entry;
            if (type === "undefined" || type === "function" || type === "symbol" ||
                (type === "number" && !isFinite(entry))) {
                throw new TypeError("Storage values must be JSON-compatible.");
            }
            return entry;
        });
        data[name] = JSON.parse(json);
        window.localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Tests whether a named value exists, including stored null values.
 *
 * @param {string} name Nonempty value name.
 *
 * @return {boolean} Whether the value exists and storage is readable.
 */
rune.data.Storage.prototype.has = function(name) {
    if (typeof name !== "string" || name.length === 0) return false;
    var data = this.m_read();
    return data != null && Object.prototype.hasOwnProperty.call(data, name);
};

/**
 * Removes a named value without affecting other entries or highscores.
 * A missing value counts as success if storage can be read.
 *
 * @param {string} name Nonempty value name.
 *
 * @return {boolean} Whether removal succeeded.
 */
rune.data.Storage.prototype.remove = function(name) {
    var key = this.m_key;
    if (key == null) return false;
    if (typeof name !== "string" || name.length === 0) return false;
    var data = this.m_read();
    if (data == null) return false;
    if (!Object.prototype.hasOwnProperty.call(data, name)) return true;
    delete data[name];
    try {
        window.localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Removes this handler's document only. Does not clear other applications or
 * highscore data and never calls localStorage.clear().
 *
 * @return {boolean} Whether removal succeeded.
 */
rune.data.Storage.prototype.clear = function() {
    if (this.m_key == null) return false;
    try {
        window.localStorage.removeItem(this.m_key);
        return true;
    } catch (error) {
        return false;
    }
};

//------------------------------------------------------------------------------
// Public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * Releases this handler without deleting persisted data.
 *
 * @return {undefined}
 */
rune.data.Storage.prototype.dispose = function() {
    this.m_key = null;
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Reads a fresh document into a dictionary with no prototype. Corrupt or absent
 * documents become empty dictionaries, without writing anything during reads.
 * Access failure or disposal returns null so writes cannot claim success.
 *
 * @return {Object} A dictionary, or null when storage cannot be accessed.
 * @private
 */
rune.data.Storage.prototype.m_read = function() {
    if (this.m_key == null) return null;
    var json;
    try {
        json = window.localStorage.getItem(this.m_key);
    } catch (error) {
        return null;
    }
    var data = Object.create(null);
    if (json == null) return data;
    try {
        var parsed = JSON.parse(json);
        if (parsed != null && typeof parsed === "object" && !Array.isArray(parsed)) {
            var keys = Object.keys(parsed);
            for (var i = 0; i < keys.length; i++) data[keys[i]] = parsed[keys[i]];
        }
    } catch (error) {}
    return data;
};
