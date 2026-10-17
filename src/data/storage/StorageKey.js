//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Provides shared application identifiers for local storage handlers.
 * @constructor
 * @class
 * @classdesc
 * Requires an explicit developer.app identifier matching Application configuration.
 * IDs are preserved verbatim and never derived from page location. Each game
 * must supply its own unique ID; this helper validates format, not uniqueness.
 */
rune.data.StorageKey = function() {
    console.warn("This class is not meant to be instantiated; all content is static.");
};

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Creates an application-scoped localStorage key using a subsystem suffix.
 * Both Highscores and Storage use this method to keep key construction aligned.
 *
 * @param {string} id Application ID, for example "com.vectorpanic.demo".
 * @param {string} suffix Subsystem suffix, including its leading period.
 * @return {string} The complete localStorage key.
 * @throws {Error} If the application ID is missing or invalid.
 */
rune.data.StorageKey.create = function(id, suffix) {
    return rune.data.StorageKey.createID(id) + suffix;
};

/**
 * Validates and returns an explicit application ID without changing it.
 * The developer and app segments follow Application's configuration rules.
 *
 * @param {string} id Application ID, for example "com.vectorpanic.demo".
 * @return {string} The validated identifier.
 * @throws {Error} If the application ID is missing or invalid.
 */
rune.data.StorageKey.createID = function(id) {
    if (typeof id !== "string" || /\s/.test(id) || !/^[a-z]{2,3}\.[a-z0-9-]{1,50}\.[a-zA-Z0-9_-]+$/.test(id)) {
        throw new Error("Invalid application ID. Expected developer.app, for example com.vectorpanic.demo.");
    }
    return id;
};
