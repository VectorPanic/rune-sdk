//------------------------------------------------------------------------------
// Global scope aliases
//------------------------------------------------------------------------------

/**
 * This code exports the application code to the global scope of JavaScripts 
 * (window). Note that this code is only functional when the project is 
 * compiled with Google Closure Compilers IIFE settings.
 */
if (typeof window !== "undefined") {
    if (typeof window.demo === "undefined") {
        window.demo = demo;
    }
}