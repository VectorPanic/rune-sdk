# Rune SDK - Yet another (object-oriented) JavaScript game engine

Rune (SDK) is a **free**, *object-oriented* framework (inspired by *Adobe Flash* / *Adobe AIR*) for creating raster-based, two-dimensional applications and/or games using JavaScript. It is primarily developed to be executed within [Electron](https://www.electronjs.org/).

For more information, see the full [reference manual](https://vectorpanic.github.io/rune-docs/).

## File structure

Rune's source code is structured as follows:

 - bin: *Runs from "binary".*
 - bin-debug: *Runs from source code.*
 - demo: Test application.
 - dist: *The latest compiled version of Rune.*
 - scripts: *Build scripts*
 - src: *Source code.*

## Features

For example, Rune offers support for the following features:

- Flash-like (flash.*) API: *If you liked Flash (as3), you will love Rune.*
- Sprite animation: *Blitting inspired sprite animation via texture atlases.*
- Tweening: *Interpolation based animation.*
- Tilemap: *Grid-based environments.*
- Cameras: *Dynamic camera system with split screen support.*
- Audio: *Support for sound and music via multiple audio channels.*
- Input: *Support for keyboards and gamepads (1-4 players).*
- Text: *Bitmap-based text fields.*
- Hitbox: *Rectangle-based (automated) collision system via dynamic hitboxes.*
- Highscores: *local highscore tables.*
- Physics: *Simple, but existing physics.*
- Pathfinding: *A\* based pathfinding via Rune's tilemap system.*
- Display-list: *Hierarchical rendering of graphical parent and child objects.*

## Getting Started

The easiest way to get started with Rune is to download [Rune-tools](https://github.com/VectorPanic/rune-tools); a command line interface (CLI) tool for creating and managing Rune-based projects.

With `rune-tools` installed, the following command can be used to create a new and executable Rune application, based on the standardized template:

```shell
$ rune-tools create -a "MyApp" -d "com.vectorpanic" -b "0.0.0"
```

The sample code creates a new project directory for the application `MyApp` from developer `com.vectorpanic` with version number `0.0.0`.