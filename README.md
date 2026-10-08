# Rune SDK

Rune SDK is a free, object-oriented JavaScript game engine for creating
raster-based, two-dimensional applications and games.

Rune is inspired by the Macromedia/Adobe Flash and Adobe AIR era: display
lists, sprites, scenes, bitmap graphics, game loops, and that wonderful feeling
of making something small, weird and playable in a browser-sized window. The
goal is not to imitate the past for nostalgia alone, but to bring back a clear,
class-based way of building 2D software that many older developers remember and
many new developers can still learn to love.

Rune is primarily designed to run inside [Electron](https://www.electronjs.org/).

For the full API reference, see the
[Rune SDK reference manual](https://vectorpanic.github.io/rune-docs/).

## Philosophy

Rune SDK is built around object-oriented programming.

A Rune application is composed from classes: scenes, display objects, sprites,
tilemaps, cameras, inputs, resources and other focused systems. Instead of
treating a game as a loose collection of scripts, Rune encourages developers to
model their application as interacting objects with clear responsibilities.

If you enjoyed ActionScript 3, Flash display lists, movie clips, sprites and
frame-based game loops, Rune should feel familiar. If you are new to that way
of working, Rune aims to make object-oriented game development approachable,
practical and fun.

In short: structure matters, pixels matter, and small games deserve good code.

## Getting Started

The easiest way to get started with Rune SDK is to use
[Rune-tools](https://github.com/VectorPanic/rune-tools).

Rune-tools is a command line interface for creating and managing Rune-based
projects.

Install Rune-tools globally:

```shell
npm install -g rune-tools
```

Create a new Rune project:

```shell
rune-tools create -a "MyApp" -d "com.example" -b "1.0.0"
```

Then enter the project directory and install dependencies:

```shell
cd ./MyApp
npm update
npm test
```

To update an existing project to the latest Rune SDK build:

```shell
rune-tools update
```

## Features

Rune SDK includes support for:

- Flash-like display-list rendering.
- Object-oriented display objects and containers.
- Sprites and texture atlas based animation.
- Tweening and interpolation based animation.
- Tilemaps for larger worlds.
- TileGraphic objects for smaller display-list based tilemaps.
- Shared tile collision and pathfinding logic.
- Cameras and split-screen rendering.
- Keyboard and gamepad input.
- Bitmap text fields.
- Rectangle-based hitbox collision.
- Simple physics helpers.
- Sound and music channels.
- Local highscore tables.
- Resource loading and bundling.

## File Structure

Rune's source code is structured as follows:

- `asset`: Project assets and templates.
- `bin`: Runtime entry point using the compiled SDK.
- `bin-debug`: Runtime entry point using source files.
- `demo`: Test and demonstration application.
- `dist`: Compiled Rune SDK distribution.
- `docs`: Documentation resources.
- `scripts`: Build scripts.
- `src`: Source code.

## Development

Rune SDK follows ECMAScript 5 style JavaScript. The codebase favors explicit
constructors, prototype inheritance and clear class boundaries over modern
syntax shortcuts. This is intentional: Rune should remain understandable,
portable and close to the object-oriented style that inspired it.

## Documentation

The full API reference is available here:

[https://vectorpanic.github.io/rune-docs/](https://vectorpanic.github.io/rune-docs/)

## License

Rune SDK is released under the MIT License.
