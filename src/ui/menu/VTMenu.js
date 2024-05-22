//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {Object} options Menu options.
 *
 * @class
 * @classdesc
 * 
 * The VTMenu class represents a bitmap-based vertical text menu. The class 
 * can be used to imitate menu systems from Nintendo Entertainment System 
 * (NES) games.
 */
rune.ui.VTMenu = function(options) {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Pointer index.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_index = 0;
    
    /**
     * Menu list.
     *
     * @type {rune.ui.VTList}
     * @protected
     * @ignore
     */
    this.m_list = null;
    
    /**
     * Menu options.
     *
     * @type {Object}
     * @protected
     * @ignore
     */
    this.m_options = options || {};
    
    /**
     * Menu pointer.
     *
     * @type {rune.display.Graphic}
     * @protected
     * @ignore
     */
    this.m_pointer = null;
    
    /**
     * Whether the list is interactive or not.
     *
     * @type {boolean}
     * @protected
     * @ignore
     */
    this.m_selectable = true;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.display.DisplayObjectContainer.
     */
    rune.display.DisplayObjectContainer.call(this, 0, 0, 0, 0);
    
    //--------------------------------------------------------------------------
    // Override public properties
    //--------------------------------------------------------------------------
    
    /**
     * @inheritDoc
     */
    this.immovable = true;
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.VTMenu.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.ui.VTMenu.prototype.constructor = rune.ui.VTMenu;

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Reference to the pointer-object indicating the current selection in 
 * the menu. By default, this is a reference to an object of type 
 * rune.ui.VTMenuPointer.
 *
 * @member {rune.display.DisplayObject} pointer
 * @memberof rune.ui.VTMenu
 * @instance
 * @readonly
 */
Object.defineProperty(rune.ui.VTMenu.prototype, "pointer", {
    /**
     * @this rune.ui.VTMenu
     * @ignore
     */
    get : function() {
        return this.m_pointer;
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.VTMenu.prototype.update = function(step) {
    rune.display.DisplayObjectContainer.prototype.update.call(this, step);
};

//------------------------------------------------------------------------------
// Public prototype methods (API)
//------------------------------------------------------------------------------

/**
 * Adds an text option to the menu list.
 *
 * @param {string} text Text to add.
 *
 * @return {undefined}
 */
rune.ui.VTMenu.prototype.add = function(text) {
    this.m_list.add(text);
    this.width  = this.m_list.width + (this.m_pointer.width + (this.m_options.pointerPadding || 4)); //@note: Magic padding.
    this.height = this.m_list.height;
    this.m_list.right = this.width;
    this['hitbox'].set(
        0,
        0,
        this.width,
        this.height
    );
};

/**
 * Move the menu pointer to the next selection.
 *
 * @return {boolean}
 */
rune.ui.VTMenu.prototype.down = function() {
    if ((this.m_selectable == true) && (this.m_list['numChildren'] > 0)) {
        this.m_index++;
        this.m_index = rune.util.Math.wrap(
            this.m_index, 
            0, 
            this.m_list['numChildren'] - 1
        );
        
        var element = this.m_list.getAt(this.m_index);
        this.m_pointer.centerY = element.centerY;
        
        return true; 
    }
    
    return false;
};

/**
 * Adds a handler function that is executed when a selection is made.
 *
 * @param {Function} func Handler function.
 * @param {Object} scope Handler execution scope.
 *
 * @return {undefined}
 */
rune.ui.VTMenu.prototype.onSelect = function(func, scope) {
    this.m_disposeOnSelect();
    this.m_onSelect = new rune.util.Executable(func, scope);
};

/**
 * Make a selection from the list. The selection is based on the pointer's 
 * position in the list.
 *
 * @return {boolean}
 */
rune.ui.VTMenu.prototype.select = function() {
    if ((this.m_selectable == true) && (this.m_list['numChildren'] > 0)) {
        this.m_selectable  = false;
        var element = this.m_list.getAt(this.m_index);
        element['flicker'].start(this.m_options.duration || 2000, this.m_options.frequency || 280, function() {
            this.m_selectable = true;
            if (this.m_onSelect) {
                this.m_onSelect.execute(element);
            }
        }, this);
        
        return true;
    }
    
    return false;
};

/**
 * Move the menu pointer to the previous selection.
 *
 * @return {boolean}
 */
rune.ui.VTMenu.prototype.up = function() {
    if ((this.m_selectable == true) && (this.m_list['numChildren'] > 0)) {
        this.m_index--;
        this.m_index = rune.util.Math.wrap(
            this.m_index, 
            0, 
            this.m_list['numChildren'] - 1
        );
        
        var element = this.m_list.getAt(this.m_index);
        this.m_pointer.centerY = element.centerY;
        
        return true;
    }
    
    return false;
};

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.VTMenu.prototype.m_construct = function() {
    rune.display.DisplayObjectContainer.prototype.m_construct.call(this);
    this.m_constructList();
    this.m_constructPointer();
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Creates the VTList object.
 *
 * @return {undefined}
 */
rune.ui.VTMenu.prototype.m_constructList = function() {
    this.m_disposeList();
    if (this.m_list == null) {
        this.m_list = new rune.ui.VTList(this.m_options.resource || rune.text.BitmapFormat.FONT_MEDIUM);
        this.m_list.align = rune.ui.VTList.ALIGN_LEFT;
        this.addChild(this.m_list);
    }
};

/**
 * Creates the VTMenuPointer object.
 *
 * @return {undefined}
 */
rune.ui.VTMenu.prototype.m_constructPointer = function() {
    var pointerCLS = this.m_options.pointer || rune.ui.VTMenuPointer;
    this.m_disposePointer();
    if (this.m_pointer == null) {
        this.m_pointer = new pointerCLS();
        this.addChild(this.m_pointer);
    }
};

/**
 * Removes the selection handler.
 *
 * @return {undefined}
 */
rune.ui.VTMenu.prototype.m_disposeOnSelect = function() {
    if (this.m_onSelect instanceof rune.util.Executable) {
        this.m_onSelect.dispose();
        this.m_onSelect = null;
    }
};

/**
 * Removes the VTMenuPointer object.
 *
 * @return {undefined}
 */
rune.ui.VTMenu.prototype.m_disposePointer = function() {
    if (this.m_pointer instanceof rune.display.Graphic) {
        this.m_pointer.dispose();
        this.m_pointer = null;
    }
};

/**
 * Removes the VTList object.
 *
 * @return {undefined}
 */
rune.ui.VTMenu.prototype.m_disposeList = function() {
    if (this.m_list instanceof rune.ui.VTList) {
        this.m_list.dispose();
        this.m_list = null;
    }
};