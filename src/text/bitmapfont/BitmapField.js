//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new BitmapField.
 *
 * @constructor
 * @extends rune.display.DisplayObject
 *
 * @param {string} [text=""] A string that is the current text in the text field.
 * @param {string} [resource] Name of the texture to be used for characters.
 *
 * @class
 * @classdesc
 * 
 * The BitmapField class represents a bitmap-based text field. Each character 
 * in the text field is retrieved from a bitmap-based texture file that is 
 * passed as an optional parameter to the constructor. If no texture file is 
 * specified, {@link rune.text.BitmapFormat.FONT_SMALL} is used.
 */
rune.text.BitmapField = function(text, resource) {
	
	//--------------------------------------------------------------------------
	// Private properties
	//--------------------------------------------------------------------------
	
	/**
	 * Controls automatic sizing and alignment of text fields.
	 *
	 * @type {boolean}
	 * @private
	 */
	this.m_autoSize = false;
	
	/**
	 * Represent a font.
	 *
	 * @type {rune.text.BitmapFormat}
	 * @private
	 */
	this.m_format = new rune.text.BitmapFormat(resource);
	
	/**
	 * A number representing the amount of space that is uniformly distributed 
	 * between all characters.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_letterSpacing = 0;
	
	/**
	 * An integer representing the amount of vertical space (called leading) 
	 * between lines.
	 *
	 * @type {number}
	 * @private
	 */
	this.m_leading = 0;
	
	/**
	 * A string that is the current text in the text field.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_text = text || "";
	
	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend DisplayObject.
	 */
	rune.display.DisplayObject.call(this, 0, 0, 140, 10);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.text.BitmapField.prototype = Object.create(rune.display.DisplayObject.prototype);
rune.text.BitmapField.prototype.constructor = rune.text.BitmapField;

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Controls automatic sizing and alignment of text fields. If this property is 
 * set to false, a default width of 140 pixels and a default height of 10 
 * pixels are used to represent the size of the text field.
 *
 * @member {boolean} autoSize
 * @memberof rune.text.BitmapField
 * @instance
 */
Object.defineProperty(rune.text.BitmapField.prototype, "autoSize", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		return this.m_autoSize;
	},
	
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 * @suppress {accessControls}
	 */
	set : function(value) {
		if (this.m_autoSize != value) {
			this.m_autoSize  = value;
			if (this.m_autoSize == true) {
				this.m_refit();
			}
			
			this.breakCache();
		}
	}
});

/**
 * Represents the current font of the text field.
 *
 * @member {rune.text.BitmapFormat} format
 * @memberof rune.text.BitmapField
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapField.prototype, "format", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		return this.m_format;
	}
});

/**
 * Which character spacing to use when rendering text fields.
 *
 * @member {number} letterSpacing
 * @memberof rune.text.BitmapField
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapField.prototype, "letterSpacing", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		return this.m_letterSpacing;
	},
	
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 * @suppress {accessControls}
	 */
	set : function(value) {
		value = ~~value;
		if (this.m_letterSpacing != value) {
			this.m_letterSpacing  = value;
			if (this.m_autoSize == true) {
				this.m_refit();
			}
			
			this.breakCache();
		}
	}
});

/**
 * Which line spacing to use when rendering text fields.
 *
 * @member {number} leading
 * @memberof rune.text.BitmapField
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapField.prototype, "leading", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		return this.m_leading;
	},
	
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 * @suppress {accessControls}
	 */
	set : function(value) {
		value = ~~value;
		if (this.m_leading != value) {
			this.m_leading  = value;
			if (this.m_autoSize == true) {
				this.m_refit();
			}
			
			this.breakCache();
		}
	}
});

/**
 * Current text in the text field.
 *
 * @member {string} text
 * @memberof rune.text.BitmapField
 * @instance
 */
Object.defineProperty(rune.text.BitmapField.prototype, "text", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		return this.m_text;
	},
	
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 * @suppress {accessControls}
	 */
	set : function(value) {
		if (this.m_text != value) {
			this.m_text  = value;
			if (this.m_autoSize == true) {
				this.m_refit();
			}
			
			this.breakCache();
		}
	}
});

/**
 * The height of the text field based on current content.
 *
 * @member {number} textHeight
 * @memberof rune.text.BitmapField
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapField.prototype, "textHeight", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		var numRows = this.m_text.split("\n").length;
		return (numRows * this.m_format['charHeight']) + (numRows * this.m_leading);
	}
});

/**
 * The width of the text field based on current content.
 *
 * @member {number} textWidth
 * @memberof rune.text.BitmapField
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapField.prototype, "textWidth", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		var numChars = 0;
		var rows = this.m_text.split("\n");
		for (var ln = 0; ln < rows.length; ln++) {
			numChars = Math.max(rows[ln].length, numChars); 
		}
		
		return numChars * (this.m_format['charWidth'] + this.m_letterSpacing);
	}
});

//------------------------------------------------------------------------------
// Override public prototype methods (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 * @suppress {accessControls}
 */
rune.text.BitmapField.prototype.render = function() {
	if (this.m_cached == false) {
		this.m_renderBackgroundColor();
		this.m_renderText();
		this.m_renderStates();
		
		this.restoreCache();
	}
};

/**
 * @inheritDoc
 */
rune.text.BitmapField.prototype.dispose = function() {
	this.m_disposeFormat();
	rune.display.DisplayObject.prototype.dispose.call(this);
};

//------------------------------------------------------------------------------
// Private prototype methods
//------------------------------------------------------------------------------

/**
 * Renders a text field.
 *
 * @returns {undefined}
 * @private
 */
rune.text.BitmapField.prototype.m_renderText = function() {
	var text = "";
	var rows = this.m_text.split("\n");
	for (var ln = 0; ln < rows.length; ln++) {
		text = rows[ln];
		var x = 0;
		var y = (this.m_format['charHeight'] * ln) + (this.m_leading * ln);
		for (var col = 0; col < text.length; col++) {
			this.m_renderCharacter(
				text.charCodeAt(col),
				x,
				y
			);
			
			x += this.m_format['charWidth'] + this.m_letterSpacing;
		}
	}
};

/**
 * Renders a character.
 *
 * @param {number} charCode Unicode character code.
 * @param {number} x Position in the x-direction.
 * @param {number} y Position in the y-direction.
 *
 * @return {undefined}
 * @private
 */
rune.text.BitmapField.prototype.m_renderCharacter = function(charCode, x, y) {
	var rect = this.m_format.getCharRect(charCode);
	this.m_canvas.drawImage(
		this.m_format['texture'],
		x,
		y,
		rect.width,
		rect.height,
		rect.x, 
		rect.y,
		rect.width,
		rect.height
	);
};

/**
 * Dispose format.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.text.BitmapField.prototype.m_disposeFormat = function() {
	if (this.m_format instanceof rune.text.BitmapFormat) {
		this.m_format.dispose();
		this.m_format = null;
	}
};

/**
 * Redo the size of the text field.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.text.BitmapField.prototype.m_refit = function() {
	this.width  = this['textWidth'];
	this.height = this['textHeight'];
	this['hitbox'].set(
		0,
		0,
		this['textWidth'],
		this['textHeight']
	);
};