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
 * specified, {@link rune.text.BitmapFormat.FONT_SMALL} is used. Each field has
 * its own Texture wrapper so colors can be replaced without changing other
 * fields that use the same font resource.
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
	 * Horizontal alignment of each row within the local pixel buffer.
	 *
	 * @type {string}
	 * @private
	 */
	this.m_align = rune.text.BitmapField.ALIGN_LEFT;
	
	/**
	 * Represent a font.
	 *
	 * @type {rune.text.BitmapFormat}
	 * @private
	 */
	this.m_format = new rune.text.BitmapFormat(resource);

	/**
	 * The field's font texture. Source pixels remain shared until modified.
	 *
	 * @type {rune.display.Texture}
	 * @private
	 */
	this.m_texture = new rune.display.Texture(this, this.m_format['texture']);
	
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
	this.m_text = this.m_formatText(text);
	
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
// Public static constants
//------------------------------------------------------------------------------

/**
 * Aligns text to the left edge of the field.
 * @const {string}
 */
rune.text.BitmapField.ALIGN_LEFT = "left";

/**
 * Centers each row horizontally within the field.
 * @const {string}
 */
rune.text.BitmapField.ALIGN_CENTER = "center";

/**
 * Aligns text to the right edge of the field.
 * @const {string}
 */
rune.text.BitmapField.ALIGN_RIGHT = "right";

//------------------------------------------------------------------------------
// Public prototype getter and setter methods
//------------------------------------------------------------------------------

/**
 * Horizontal text alignment: ALIGN_LEFT (default), ALIGN_CENTER or ALIGN_RIGHT.
 * Each row is aligned within the unscaled buffer width. Overflow is clipped.
 * With autoSize enabled, shorter rows align within the longest row's width.
 * Unsupported values are ignored.
 *
 * @member {string} align
 * @memberof rune.text.BitmapField
 * @instance
 */
Object.defineProperty(rune.text.BitmapField.prototype, "align", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		return this.m_align;
	},

	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 * @suppress {accessControls}
	 */
	set : function(value) {
		if (value !== rune.text.BitmapField.ALIGN_LEFT &&
			value !== rune.text.BitmapField.ALIGN_CENTER &&
			value !== rune.text.BitmapField.ALIGN_RIGHT) return;

		if (this.m_align !== value) {
			this.m_align = value;
			this.breakCache();
		}
	}
});

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
		value = this.m_formatText(value);
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
		return (numRows * this.m_format['charHeight']) + ((numRows - 1) * this.m_leading);
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

		return this.m_getRowWidth(numChars);
	}
});

/**
 * The font texture used to render this field. Calling replaceColor() creates
 * unique pixel data for this field and invalidates its render cache. Other
 * fields and the original font resource remain unchanged.
 *
 * @member {rune.display.Texture} texture
 * @memberof rune.text.BitmapField
 * @instance
 * @readonly
 */
Object.defineProperty(rune.text.BitmapField.prototype, "texture", {
	/**
	 * @this rune.text.BitmapField
	 * @ignore
	 */
	get : function() {
		return this.m_texture;
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
	this.m_disposeTexture();
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
		if (this.m_align === rune.text.BitmapField.ALIGN_CENTER) {
			x = Math.floor((this.m_canvas['width'] - this.m_getRowWidth(text.length)) / 2);
		} else if (this.m_align === rune.text.BitmapField.ALIGN_RIGHT) {
			x = this.m_canvas['width'] - this.m_getRowWidth(text.length);
		}
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
 * Measures a row in local pixels, excluding spacing after its final character.
 * Empty rows have zero width.
 *
 * @param {number} numChars The number of characters in the row.
 * @return {number} The row width in pixels.
 * @private
 */
rune.text.BitmapField.prototype.m_getRowWidth = function(numChars) {
	if (numChars > 0) {
		return numChars * this.m_format['charWidth'] + (numChars - 1) * this.m_letterSpacing;
	}
	return 0;
};

/**
 * Formats a value as text and normalizes Windows and legacy carriage-return
 * line endings to newline characters for consistent layout and rendering.
 *
 * @param {*} value Value to format.
 *
 * @return {string}
 * @private
 */
rune.text.BitmapField.prototype.m_formatText = function(value) {
	if (value == null) return "";
	else return value.toString().replace(/\r\n?/g, "\n");
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
	if (rect instanceof rune.geom.Rectangle) {
		this.m_canvas.drawImage(
			this.m_texture['data'],
			x,
			y,
			rect.width,
			rect.height,
			rect.x,
			rect.y,
			rect.width,
			rect.height
		);
	}
};

/**
 * Disposes the field's texture wrapper and any unique pixel buffer.
 * The shared font resource is retained by the resource collection.
 *
 * @return {undefined}
 * @private
 * @suppress {accessControls}
 */
rune.text.BitmapField.prototype.m_disposeTexture = function() {
	if (this.m_texture != null) {
		this.m_texture.dispose();
		this.m_texture = null;
	}
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
 * Fits the local pixel buffer and hitbox to the text independently of the
 * display object's scale.
 *
 * @return {undefined}
 * @protected
 * @ignore
 */
rune.text.BitmapField.prototype.m_refit = function() {
	var width = this['textWidth'];
	var height = this['textHeight'];

	this['unscaledWidth'] = width;
	this['unscaledHeight'] = height;
	this['hitbox'].set(
		0,
		0,
		width,
		height
	);
};
