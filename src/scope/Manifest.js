//------------------------------------------------------------------------------
// Namespace
//------------------------------------------------------------------------------

/**
 * The root namespace for the Rune SDK. Groups the components used to build
 * browser-based games, including rendering, input, audio and scene management.
 * Access SDK classes through rune and its package namespaces.
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
	 * Sprite animation sequences, playback control and frame-specific callbacks.
	 * Coordinates keyframes and timing without owning the animated display object.
	 *
	 * @namespace animation
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.animation = {};
	
	/**
	 * Two-dimensional cameras with target tracking, zoom and viewport control.
	 * Includes camera effects such as shake, fade, flash, tint and glitch.
	 *
	 * @namespace camera
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.camera = {};
	
	/**
	 * Color representations with RGB and alpha components.
	 * Provides access to individual channels and packed numeric color values.
	 *
	 * @namespace color
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.color = {};
	
	/**
	 * An in-application developer console with command execution and history.
	 * Includes text input, output and cursor handling.
	 *
	 * @namespace console
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.console = {};
	
	/**
	 * Built-in SDK assets, resource declarations and loading scenes.
	 * Also provides application-scoped local storage and highscore tables.
	 *
	 * @namespace data
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.data = {};
	
	/**
	 * Runtime diagnostics for frame rate, timing, memory and rendering.
	 * Includes diagnostic views for resolution and audio settings.
	 *
	 * @namespace debug
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.debug = {};
	
	/**
	 * The display hierarchy and core two-dimensional rendering components.
	 * Includes sprites, graphics, drawing buffers, groups and visual effects.
	 *
	 * @namespace display
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.display = {};
	
	/**
	 * Points, rectangles and two-dimensional vectors for spatial calculations.
	 * Provides geometry shared by rendering, movement and collision queries.
	 *
	 * @namespace geom
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.geom = {};
	
	/**
	 * Keyboard and gamepad input with configurable device handling.
	 * Tracks button states and exposes gamepad axes for application controls.
	 *
	 * @namespace input
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.input = {};
	
	/**
	 * Audio playback for sound effects and music.
	 * Manages sounds, playback channels and echo effects.
	 *
	 * @namespace media
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.media = {};
	
	/**
	 * URL requests, asynchronous loading and response data.
	 * Provides the network transport used by resource loading.
	 *
	 * @namespace net
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.net = {};
	
	/**
	 * Two-dimensional particle effects using display objects and emitters.
	 * Configures particle emission and manages particle lifecycles.
	 *
	 * @namespace particle
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.particle = {};
	
	/**
	 * Two-dimensional velocity, acceleration, drag and collision handling.
	 * Resolves display-object collisions using rectangular hitboxes.
	 *
	 * @namespace physics
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.physics = {};
	
	/**
	 * Resource requests, loading and lookup by resource name.
	 * Maintains the shared library of loaded image, audio and other asset data.
	 *
	 * @namespace resource
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.resource = {};

	/**
	 * Raycast rendering of tile-based worlds through independent camera views.
	 * Includes animated billboards, fixed surfaces, doors, collision queries and
	 * actor navigation. Integrates with the SDK display and tilemap components.
	 *
	 * @namespace raycast
	 * @memberof rune
	 */
	m_this.raycast = {};
	
	/**
	 * Application scenes and transitions between active scenes.
	 * Coordinates scene initialization, updates, rendering and disposal.
	 *
	 * @namespace scene
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.scene = {};
	
	/**
	 * Finite-state machines for organizing application and object behavior.
	 * Manages states and transitions through their lifecycle methods.
	 *
	 * @namespace state
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.state = {};

	/**
	 * Application setup, configuration and frame timing.
	 * Coordinates the main loop and the SDK services used by an application.
	 *
	 * @namespace system
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.system = {};
	
	/**
	 * Bitmap text rendering, formatting and animated text effects.
	 * Includes typewriter playback, scrambling and numeric text counters.
	 *
	 * @namespace text
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.text = {};
	
	/**
	 * Tile-based maps with visual layers, data layers and collision metadata.
	 * Provides cell queries and pathfinding alongside two-dimensional rendering.
	 *
	 * @namespace tilemap
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.tilemap = {};
	
	/**
	 * Countdown timers with scheduled callbacks and repeat options.
	 * Manages timer updates and lifecycles through timer collections.
	 *
	 * @namespace timer
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.timer = {};
	
	/**
	 * Time-based interpolation of object properties.
	 * Provides tween management and linear, polynomial and other easing functions.
	 *
	 * @namespace tween
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.tween = {};
	
	/**
	 * Reusable interface components built on the display hierarchy.
	 * Includes buttons, counters, progress bars, vertical lists and menus.
	 *
	 * @namespace ui
	 * @memberof rune
	 * @since 1.0
	 */
	m_this.ui = {};
	
	/**
	 * Shared helpers for mathematics, paths, stacks and callback execution.
	 * Also includes palette, filtering and URL utilities.
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