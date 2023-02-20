//------------------------------------------------------------------------------
// Namespace
//------------------------------------------------------------------------------

/**
 * The demo package is used to include all classes included in the Demo 
 * application.
 * 
 * @namespace demo
 */
var demo = function() {

    //--------------------------------------------------------------------------
    // Public static scope
    //--------------------------------------------------------------------------
    
    /**
     * Public scope.
     *
     * @type {Object}
     * @private
     */
    var m_this = {};

    //--------------------------------------------------------------------------
    // Package structure
    //--------------------------------------------------------------------------

    /**
     * The demo.data package contains data structures that are used to 
     * represent objects and resource files within the application.
     *
     * @namespace data
     * @memberof demo
     * @since 1.0
     */
    m_this.data = {};

    /**
     * the demo.scene package contains all the scenes of the application.
     *
     * @namespace scene
     * @memberof demo
     * @since 1.0
     */
    m_this.scene = {};
    
    /**
     * The demo.entity package contains classes that represent objects within 
     * the application.
     *
     * @namespace entity
     * @memberof demo
     * @since 1.0
     */
    m_this.entity = {};

    /**
     * The demo.system package contains low-level classes that are used to run 
     * the application.
     *
     * @namespace system
     * @memberof demo
     * @since 1.0
     */
    m_this.system = {};

    //--------------------------------------------------------------------------
    // Return public scope object
    //--------------------------------------------------------------------------

    /**
     * Public scope.
     */
    return m_this;

}();