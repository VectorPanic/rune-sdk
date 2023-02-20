//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/** 
 * Creates a new Requests object.
 * 
 * @constructor
 * @extends rune.resource.Requests
 * 
 * @class
 * @classdesc
 * 
 * The Requests class is used to load and encode resources used by the Demo 
 * application.
 */
demo.data.Requests = function() {

	//--------------------------------------------------------------------------
	// Super call
	//--------------------------------------------------------------------------
	
	/**
	 * Extend rune.resource.Requests
	 */
	rune.resource.Requests.call(this);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

demo.data.Requests.prototype = Object.create(rune.resource.Requests.prototype);
demo.data.Requests.prototype.constructor = demo.data.Requests;

//------------------------------------------------------------------------------
// Override protected prototype methods
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
demo.data.Requests.prototype.m_construct = function() {
	rune.resource.Requests.prototype.m_construct.call(this);
    this.add("demo_astronaut_48x48",                                "./../demo/asset/gif/demo_astronaut_48x48.gif");
    this.add("demo_astronaut_sound_collision",                      "./../demo/asset/wav/demo_astronaut_sound_collision.wav");
    this.add("demo_controller_159x87",                              "./../demo/asset/gif/demo_controller_159x87.gif");
    this.add("demo_controller_button_blue_15x15",                   "./../demo/asset/gif/demo_controller_button_blue_15x15.gif");
    this.add("demo_controller_button_dpad_down_11x10",              "./../demo/asset/gif/demo_controller_button_dpad_down_11x10.gif");
    this.add("demo_controller_button_dpad_left_8x13",               "./../demo/asset/gif/demo_controller_button_dpad_left_8x13.gif");
    this.add("demo_controller_button_dpad_right_8x13",              "./../demo/asset/gif/demo_controller_button_dpad_right_8x13.gif");
    this.add("demo_controller_button_dpad_up_11x10",                "./../demo/asset/gif/demo_controller_button_dpad_up_11x10.gif");
    this.add("demo_controller_button_green_15x15",                  "./../demo/asset/gif/demo_controller_button_green_15x15.gif");
    this.add("demo_controller_button_red_15x15",                    "./../demo/asset/gif/demo_controller_button_red_15x15.gif");
    this.add("demo_controller_button_select_start_16x16",           "./../demo/asset/gif/demo_controller_button_select_start_16x16.gif");
    this.add("demo_controller_button_shoulder_left_40x10",          "./../demo/asset/gif/demo_controller_button_shoulder_left_40x10.gif");
    this.add("demo_controller_button_shoulder_right_40x10",         "./../demo/asset/gif/demo_controller_button_shoulder_right_40x10.gif");
    this.add("demo_controller_button_yellow_15x15",                 "./../demo/asset/gif/demo_controller_button_yellow_15x15.gif");
    this.add("demo_sound_beep",                                     "./../demo/asset/wav/demo_sound_beep.wav");
    this.add("demo_sound_select",                                   "./../demo/asset/wav/demo_sound_select.wav");
};