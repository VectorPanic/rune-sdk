//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new instance of the Filter class. Note that this class is intended 
 * as a static library of methods, thus instantiation results in a warning.
 * 
 * @constructor
 * 
 * @class
 * @classdesc
 * 
 * The Filter class contains static methods that can be used with the Array 
 * object's filter method.
 */
rune.util.Filter = function() {
	console.warn("This class is not meant to be instantiated.");
};

//------------------------------------------------------------------------------
// Public static methods
//------------------------------------------------------------------------------

/**
 * Filter out duplicates in the Array object.
 * 
 * @param {Object} element The current element being processed in the array.
 * @param {number} [index] The index of the current element being processed in the array.
 * @param {Array} [array] The array on which filter() was called.
 * @param {Object} [thisArg] Value to use as this when executing callbackFn.
 * 
 * @returns {boolean}
 */
rune.util.Filter.unique = function(element, index, array, thisArg) {
	return array.indexOf(element) === index;
};