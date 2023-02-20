//------------------------------------------------------------------------------
// Global scope aliases
//------------------------------------------------------------------------------

/**
 * This code is used to export the SDK to the global scope of JavaScript as the 
 * source code is compiled using IIFE.
 */
if (typeof window !== "undefined") {
	if (typeof window.rune === "undefined") {
		window.rune = rune;
	}
}