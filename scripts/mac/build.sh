#!/bin/bash

npx google-closure-compiler \
--language_in ECMASCRIPT5_STRICT \
--language_out ECMASCRIPT5_STRICT \
--warning_level VERBOSE \
--compilation_level SIMPLE_OPTIMIZATIONS \
--isolation_mode IIFE \
--js "./../../src/scope/Manifest.js" \
--js "./../../src/util/Executable.js" \
--js "./../../src/util/Filter.js" \
--js "./../../src/util/Math.js" \
--js "./../../src/util/Palette.js" \
--js "./../../src/util/Path.js" \
--js "./../../src/util/Paths.js" \
--js "./../../src/util/Stack.js" \
--js "./../../src/util/URL.js" \
--js "./../../src/net/URLResponse.js" \
--js "./../../src/net/URLRequest.js" \
--js "./../../src/net/URLLoader.js" \
--js "./../../src/color/ColorComponent.js" \
--js "./../../src/color/Color24.js" \
--js "./../../src/color/Color32.js" \
--js "./../../src/timer/TimerOptions.js" \
--js "./../../src/timer/Timer.js" \
--js "./../../src/timer/Timers.js" \
--js "./../../src/tween/transition/Circular.js" \
--js "./../../src/tween/transition/Cubic.js" \
--js "./../../src/tween/transition/Expo.js" \
--js "./../../src/tween/transition/Linear.js" \
--js "./../../src/tween/transition/Quad.js" \
--js "./../../src/tween/transition/Quart.js" \
--js "./../../src/tween/transition/Quint.js" \
--js "./../../src/tween/transition/Sine.js" \
--js "./../../src/tween/TweenValue.js" \
--js "./../../src/tween/Tween.js" \
--js "./../../src/tween/Tweens.js" \
--js "./../../src/geom/Point.js" \
--js "./../../src/geom/Vector2D.js" \
--js "./../../src/geom/Rectangle.js" \
--js "./../../src/physics/Velocity.js" \
--js "./../../src/physics/Space.js" \
--js "./../../src/input/keyboard/KeyboardOptions.js" \
--js "./../../src/input/keyboard/KeyboardKey.js" \
--js "./../../src/input/keyboard/Keyboard.js" \
--js "./../../src/input/gamepad/GamepadsOptions.js" \
--js "./../../src/input/gamepad/Gamepad.js" \
--js "./../../src/input/gamepad/Gamepads.js" \
--js "./../../src/input/Inputs.js" \
--js "./../../src/resource/Request.js" \
--js "./../../src/resource/Requests.js" \
--js "./../../src/resource/Resource.js" \
--js "./../../src/resource/Resources.js" \
--js "./../../src/resource/RequesterOptions.js" \
--js "./../../src/resource/Requester.js" \
--js "./../../src/state/State.js" \
--js "./../../src/state/States.js" \
--js "./../../src/animation/AnimationScripts.js" \
--js "./../../src/animation/Animation.js" \
--js "./../../src/animation/Animations.js" \
--js "./../../src/display/Quadtree.js" \
--js "./../../src/display/DisplayGroup.js" \
--js "./../../src/display/DisplayGroups.js" \
--js "./../../src/display/Frame.js" \
--js "./../../src/display/Hitbox.js" \
--js "./../../src/display/InteractiveObject.js" \
--js "./../../src/display/Canvas.js" \
--js "./../../src/display/Flicker.js" \
--js "./../../src/display/DisplayObject.js" \
--js "./../../src/display/Graphics.js" \
--js "./../../src/display/Artboard.js" \
--js "./../../src/display/DisplayObjectContainer.js" \
--js "./../../src/display/Texture.js" \
--js "./../../src/display/Graphic.js" \
--js "./../../src/display/RepeatedGraphic.js" \
--js "./../../src/display/Sprite.js" \
--js "./../../src/display/Stage.js" \
--js "./../../src/display/Screen.js" \
--js "./../../src/particle/Particle.js" \
--js "./../../src/particle/EmitterOptions.js" \
--js "./../../src/particle/Emitter.js" \
--js "./../../src/tilemap/Block.js" \
--js "./../../src/tilemap/Tile.js" \
--js "./../../src/tilemap/TilemapLayer.js" \
--js "./../../src/tilemap/Tilemap.js" \
--js "./../../src/text/bitmapfont/BitmapFormat.js" \
--js "./../../src/text/bitmapfont/BitmapField.js" \
--js "./../../src/debug/Master.js" \
--js "./../../src/debug/Music.js" \
--js "./../../src/debug/Sound.js" \
--js "./../../src/debug/Memory.js" \
--js "./../../src/debug/Render.js" \
--js "./../../src/debug/Update.js" \
--js "./../../src/debug/Histogram.js" \
--js "./../../src/debug/Framerate.js" \
--js "./../../src/debug/Debugger.js" \
--js "./../../src/console/ConsoleCommand.js" \
--js "./../../src/console/ConsoleCommands.js" \
--js "./../../src/console/ConsoleHistory.js" \
--js "./../../src/console/ConsoleCursor.js" \
--js "./../../src/console/ConsoleOutput.js" \
--js "./../../src/console/ConsoleInput.js" \
--js "./../../src/console/Console.js" \
--js "./../../src/console/ConsoleManager.js" \
--js "./../../src/camera/CameraViewport.js" \
--js "./../../src/camera/CameraTargets.js" \
--js "./../../src/camera/CameraTint.js" \
--js "./../../src/camera/CameraTintTween.js" \
--js "./../../src/camera/CameraFlash.js" \
--js "./../../src/camera/CameraFade.js" \
--js "./../../src/camera/CameraShake.js" \
--js "./../../src/camera/Camera.js" \
--js "./../../src/camera/Cameras.js" \
--js "./../../src/scene/Scene.js" \
--js "./../../src/scene/Scenes.js" \
--js "./../../src/ui/counter/CounterDigit.js" \
--js "./../../src/ui/counter/Counter.js" \
--js "./../../src/ui/progressbar/Progressbar.js" \
--js "./../../src/ui/list/VTListElement.js" \
--js "./../../src/ui/list/VTList.js" \
--js "./../../src/ui/menu/VTMenuPointer.js" \
--js "./../../src/ui/menu/VTMenu.js" \
--js "./../../src/media/sound/Sound.js" \
--js "./../../src/media/sound/SoundChannel.js" \
--js "./../../src/media/sound/Sounds.js" \
--js "./../../src/data/highscore/Highscores.js" \
--js "./../../src/data/graphics/Logo.js" \
--js "./../../src/data/resource/Requests.js" \
--js "./../../src/data/scene/Loader.js" \
--js "./../../src/data/scene/LoaderDebug.js" \
--js "./../../src/system/Time.js" \
--js "./../../src/system/Config.js" \
--js "./../../src/system/Application.js" \
--js "./../../src/scope/Alias.js" \
--js_output_file "./../../dist/rune.js";