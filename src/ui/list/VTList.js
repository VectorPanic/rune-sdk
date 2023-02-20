//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object.
 *
 * @constructor
 * @extends rune.display.DisplayObjectContainer
 *
 * @param {string} resource Name of resource file for the bitmap font.
 *
 * @class
 * @classdesc
 * 
 * Represents a (bitmap-based) vertical text list.
 */
rune.ui.VTList = function(resource) {
    
    //--------------------------------------------------------------------------
    // Protected properties
    //--------------------------------------------------------------------------
    
    /**
     * Text alignment.
     *
     * @type {string}
     * @protected
     * @ignore
     */
    this.m_align = rune.ui.VTList.ALIGN_CENTER;
    
    /**G
     * Resource texture.
     *
     * @type {string}
     * @protected
     * @ignore
     */
    this.m_resource = resource;
    
    /**
     * List element padding.
     *
     * @type {number}
     * @protected
     * @ignore
     */
    this.m_padding = 4;
    
    //--------------------------------------------------------------------------
    // Super call
    //--------------------------------------------------------------------------
    
    /**
     * Extend rune.ui.VTList.
     */
    rune.display.DisplayObjectContainer.call(this, 0, 0, 0, 0);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.ui.VTList.prototype = Object.create(rune.display.DisplayObjectContainer.prototype);
rune.ui.VTList.prototype.constructor = rune.ui.VTList;

//------------------------------------------------------------------------------
// Public static constants
//------------------------------------------------------------------------------

/**
 * Centered text alignment.
 *
 * @const {string}
 * @default center
 */
rune.ui.VTList.ALIGN_CENTER = "center";

/**
 * Text alignment to the left.
 *
 * @const {string}
 * @default left
 */
rune.ui.VTList.ALIGN_LEFT = "left";

/**
 * Text alignment to the right.
 *
 * @const {string}
 * @default right
 */
rune.ui.VTList.ALIGN_RIGHT = "right";

//------------------------------------------------------------------------------
// Public getter and setter methods
//------------------------------------------------------------------------------

/**
 * Text alignment.
 *
 * @member {number} align
 * @memberof rune.ui.VTList
 * @instance
 * @default 1.0
 */
Object.defineProperty(rune.ui.VTList.prototype, "align", {
    /**
     * @this rune.ui.VTList
     * @ignore
     */
    get : function() {
        return this.m_align;
    },
    
    /**
     * @this rune.ui.VTList
     * @ignore
     */
    set : function(value) {
        value = value.toLowerCase();
        if (this.m_align != value) {
            this.m_align  = value;
            this.m_alignElements();
        }
    }
});

/**
 * Padding between list elements.
 *
 * @member {number} padding
 * @memberof rune.ui.VTList
 * @instance
 * @default 1.0
 */
Object.defineProperty(rune.ui.VTList.prototype, "padding", {
    /**
     * @this rune.ui.VTList
     * @ignore
     */
    get : function() {
        return this.m_padding;
    },
    
    /**
     * @this rune.ui.VTList
     * @ignore
     */
    set : function(value) {
        if (this.m_padding != value) {
            this.m_padding  = value;
            this.m_stackElements();
        }
    }
});

//------------------------------------------------------------------------------
// Override public prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.ui.VTList.prototype.addChild = function(child) {
    if (child instanceof rune.ui.VTListElement) {
        rune.display.DisplayObjectContainer.prototype.addChild.call(this, child);
        this.m_stackElements();
    } else throw new TypeError();
    
    return child;
};

/**
 * @inheritDoc
 */
rune.ui.VTList.prototype.addChildAt = function(child, index) {
    if (child instanceof rune.ui.VTListElement) {
        rune.display.DisplayObjectContainer.prototype.addChildAt.call(this, child, index);
        this.m_stackElements();
    } else throw new TypeError();
    
    return child;
};

/**
 * @inheritDoc
 */
rune.ui.VTList.prototype.removeChild = function(child) {
    if (child instanceof rune.ui.VTListElement) {
        rune.display.DisplayObjectContainer.prototype.removeChild.call(this, child);
        this.m_stackElements();
    } else throw new TypeError();
    
    return child;
};

/**
 * @inheritDoc
 */
rune.ui.VTList.prototype.removeChildAt = function(index) {
    var element = rune.display.DisplayObjectContainer.prototype.removeChildAt.call(this, index);
    this.m_stackElements();
    
    return element;
};

/**
 * @inheritDoc
 */
rune.ui.VTList.prototype.sortChildren = function(func) {
    rune.display.DisplayObjectContainer.prototype.sortChildren.call(this, func);
    this.m_stackElements();
};

/**
 * @inheritDoc
 */
rune.ui.VTList.prototype.swapChildren = function(a, b) {
    var output = false;
    if (a instanceof rune.ui.VTListElement && b instanceof rune.ui.VTListElement) {
        output = rune.display.DisplayObjectContainer.prototype.swapChildren.call(this, a, b);
        this.m_stackElements();
    } else throw new TypeError();
    
    return output;
};

//------------------------------------------------------------------------------
// Public prototype methods
//------------------------------------------------------------------------------

/**
 * Add a new text element to the list.
 *
 * @param {string} text Text to add to the list.
 *
 * @return {rune.display.DisplayObject}
 */
rune.ui.VTList.prototype.add = function(text) {
    var element = new rune.ui.VTListElement(text, this.m_resource);
        element.autoSize = true;
         
    return this.addChild(element);
};

/**
 * Add a new text element to the list at a specified index.
 *
 * @param {string} text Text to add to the list.
 * @param {number} index Index where the text should be inserted.
 *
 * @return {rune.display.DisplayObject}
 */
rune.ui.VTList.prototype.addAt = function(text, index) {
    var element = new rune.ui.VTListElement(text, this.m_resource);
        element.autoSize = true;   
    
    return this.addChildAt(element, index);
};

/**
 * Retrieves an element at a specific index.
 *
 * @param {number} index Index of the element.
 *
 * @return {rune.display.DisplayObject}
 */
rune.ui.VTList.prototype.getAt = function(index) {
    return this.getChildAt(index);
};

/**
 * Remove a list element.
 *
 * @param {rune.ui.VTListElement} element The element to be removed.
 *
 * @returns {rune.display.DisplayObject}
 */
rune.ui.VTList.prototype.remove = function(element) {
    return this.removeChild(element);
};

/**
 * Remove a list element at a specific index.
 *
 * @param {number} index Index of the element to be removed.
 *
 * @return {rune.display.DisplayObject}
 */
rune.ui.VTList.prototype.removeAt = function(index) {
    return this.removeChildAt(index);
};

/**
 * Sets the value of a text element at a specific index.
 *
 * @param {string} text Text to set.
 * @param {number} index Index of the element.
 *
 * @return {undefined}
 */
rune.ui.VTList.prototype.setAt = function(text, index) {
    index = rune.util.Math.clamp(index, 0, this['numChildren'] - 1);
    this.m_children[index]['text'] = text;
    this.m_stackElements();
};

/**
 * Sorts the contents of the list.
 *
 * @param {Function} func Sort function.
 *
 * @return {undefined}
 */
rune.ui.VTList.prototype.sort = function(func) {
    this.sortChildren(func);
};

/**
 * Switch the position of two elements.
 *
 * @param {number} a Index of the first element.
 * @param {number} b Index of the second element.
 *
 * @return {boolean}
 */
rune.ui.VTList.prototype.swap = function(a, b) {
    var ea = this.getChildAt(a);
    var eb = this.getChildAt(b);
    
    return this.swapChildren(ea, eb);
};

//------------------------------------------------------------------------------
// Protected prototype methods
//------------------------------------------------------------------------------

/**
 * Organize the list's elements in y-direction.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.VTList.prototype.m_stackElements = function() {
    var nw = 0;
    var nh = 0;
    
    this.forEachChild(function(child, index) {
        child['top'] = (index * child['height']) + (index * this.m_padding);
        nw = Math.max(nw, child['width']);
        nh = (this['numChildren'] * child['height']) + (this['numChildren'] * this.m_padding);
    }, this);
    
    this['width']  = nw;
    this['height'] = nh;
    
    this.m_alignElements();
};

/**
 * Text align element.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.VTList.prototype.m_alignElements = function() {
    switch (this.m_align) {
        case rune.ui.VTList.ALIGN_LEFT:
            this.m_alignElementsLeft();
            break;
        
        case rune.ui.VTList.ALIGN_CENTER:
            this.m_alignElementsCenter();
            break;
        
        case rune.ui.VTList.ALIGN_RIGHT:
            this.m_alignElementsRight();
            break;
    }
};

/**
 * Align text to the left.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.VTList.prototype.m_alignElementsLeft = function() {
    this.forEachChild(function(child, index) {
        child['left'] = 0;
    }, this);
};

/**
 * Align text to center.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.VTList.prototype.m_alignElementsCenter = function() {
    this.forEachChild(function(child, index) {
        child['centerX'] = this['width'] >> 1;
    }, this);
};

/**
 * Align text to the right.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.ui.VTList.prototype.m_alignElementsRight = function() {
    this.forEachChild(function(child, index) {
        child['right'] = this['width'];
    }, this);
};