//------------------------------------------------------------------------------
// Namespace
//------------------------------------------------------------------------------

/**
 * The rune package contains all subpackages (namespaces) and classes that 
 * together make up the Rune SDK. All SDK-related operations must therefore be 
 * addressed via this package. Be careful not to overwrite the package's global 
 * memory reference as it renders the SDK unusable.
 * 
 * @namespace rune
 * @global
 *
 * @license
 * Copyright (c) 2022 Henrik Andersen
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
var rune = function() {

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
	 * The animation package contains classes for creating keyframe-based 
	 * animations. The classes are primarily designed for use with the Sprite 
	 * class.
	 *
	 * @namespace animation
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.animation = {};
	
	/**
	 * The rune.camera package contains all classes related to the camera 
	 * system.
	 *
	 * @namespace camera
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.camera = {};
	
	/**
	 * the rune.color package contains classes used to represent digital 
	 * colors.
	 *
	 * @namespace color
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.color = {};
	
	/**
	 * the rune.console package contains classes to represent the rune 
	 * developer console.
	 *
	 * @namespace console
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.console = {};
	
	/**
	 * The rune.data package contains data structures used within Rune.
	 *
	 * @namespace data
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.data = {};
	
	/**
	 * The rune.debug package contains classes to support debugging of 
	 * Rune-based applications.
	 *
	 * @namespace debug
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.debug = {};
	
	/**
	 * The rune.display package contains the core classes that the Rune SDK 
	 * uses to build visual displays.
	 *
	 * @namespace display
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.display = {};
	
	/**
	 * The rune.geom package contains geometry classes, such as points and 
	 * rectangles.
	 *
	 * @namespace geom
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.geom = {};
	
	/**
	 * The rune.input package contains classes for handling input devices such 
	 * as keyboards, gamepads, etc..
	 *
	 * @namespace input
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.input = {};
	
	/**
	 * The rune.media package contains classes for managing and playing audio 
	 * files. Useful for sound effects and background music.
	 *
	 * @namespace media
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.media = {};
	
	/**
	 * The rune.net package contains classes for sending and receiving over a 
	 * network.
	 *
	 * @namespace net
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.net = {};
	
	/**
	 * The rune.particle package contains classes for creating, removing, and 
	 * managing particle effects.
	 *
	 * @namespace particle
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.particle = {};
	
	/**
	 * the rune.physics package contains classes for "box-based" 
	 * two-dimensional physics and collision management.
	 *
	 * @namespace physics
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.physics = {};
	
	/**
	 * The rune.resource package contains classes for storing loaded resources 
	 * such as image and audio files.
	 *
	 * @namespace resource
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.resource = {};
	
	/**
	 * the rune.scene package contains classes for managing scenes. A scene is 
	 * a visual state within the current application.
	 *
	 * @namespace scene
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.scene = {};
	
	/**
	 * The rune.state package contains classes that represent a finite-state 
	 * machine (FSM).
	 *
	 * @namespace state
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.state = {};

	/**
	 * The rune.system package contains classes for accessing system-level 
	 * functionality.
	 *
	 * @namespace system
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.system = {};
	
	/**
	 * The rune.text package contains classes to represent characters and text 
	 * fields.
	 *
	 * @namespace text
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.text = {};
	
	/**
	 * The rune.tilemap package contains classes for managing and rendering tilemaps.
	 *
	 * @namespace tilemap
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.tilemap = {};
	
	/**
	 * The rune.timer package contains countdown classes.
	 *
	 * @namespace timer
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.timer = {};
	
	/**
	 * The rune.tween package contains classes for interpolation.
	 *
	 * @namespace tween
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.tween = {};
	
	/**
	 * The rune.ui package contains classes that represent user interface 
	 * components.
	 *
	 * @namespace ui
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.ui = {};
	
	/**
	 * The rune.utils package contains utility classes, such as data structures 
	 * and mathematical calculations.
	 *
	 * @namespace util
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.util = {};

	//--------------------------------------------------------------------------
	// Return public scope object
	//--------------------------------------------------------------------------

	/**
	 * Public scope.
	 */
	return m_this;

}();