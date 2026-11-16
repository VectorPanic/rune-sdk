# Rune SDK

**Small engine. Big ideas.**

Rune SDK is a free, open-source, object-oriented JavaScript game engine for creating raster-based, two-dimensional games and applications.

Inspired by the golden age of Macromedia Flash and Adobe AIR, Rune brings together display lists, sprites, tilemaps, bitmap graphics, and frame-based game loops in a familiar, class-based development environment.

No elaborate frameworks. No unnecessary magic. Just JavaScript, pixels, and the freedom to make something worth playing.

Rune SDK has been developed and used in teaching by the Media Technology group within the Department of Computer Science and Media Technology at Linnaeus University, Sweden, since 2020.

**[API Reference](https://vectorpanic.github.io/rune-docs/) · [Rune Tools](https://github.com/VectorPanic/rune-tools) · [Rune OS](https://github.com/VectorPanic/rune-os) · [Rymdsten](https://github.com/VectorPanic/rymdsten)**

---

## Philosophy

**Making games should be as much fun as playing them.**

Rune SDK follows a straightforward, object-oriented approach to game development. Applications are built from classes with clearly defined responsibilities, rather than loosely connected scripts.

Scenes organize the application, display objects form the visual hierarchy, and dedicated systems handle input, graphics, animation, sound, and other aspects of the game.

If you've worked with ActionScript 3, Flash display lists, or movie clips, much of Rune will feel familiar.

If you haven't, that's perfectly fine. Rune is designed to make these concepts approachable, whether you're building your first game or experimenting with more advanced mechanics.

Rune favors clarity over cleverness and encourages developers to understand what happens behind the pixels.

After all, a game engine should help you build games, not become another game you have to figure out.

## Features

Rune provides a collection of tools and systems for building 2D games and interactive applications.

### Graphics & Display

- Flash-inspired display-list architecture.
- Object-oriented display objects and containers.
- Sprites and texture atlas-based animation.
- Bitmap text rendering.
- Tilemaps for constructing larger game worlds.
- TileGraphic objects for smaller display-list-based tilemaps.
- Camera systems with support for split-screen rendering.

### Animation & Movement

- Frame-based game loops.
- Tweening and interpolation.
- Rectangle-based hitbox collision detection.
- Shared tile collision and pathfinding logic.
- Basic physics helpers.

### Input & Audio

- Keyboard input.
- Gamepad support.
- Sound effects and music channels.

### Resources & Game Systems

- Resource loading and bundling.
- Local high-score tables.
- Scene-based application organization.

Rune is primarily designed to run inside **[Electron](https://www.electronjs.org/)**, providing a desktop runtime for JavaScript-based games and applications.

## Getting Started

The easiest way to start developing with Rune SDK is through **[Rune Tools](https://github.com/VectorPanic/rune-tools)**, the command-line toolkit for creating and managing Rune projects.

You'll need Node.js and npm installed.

### 1. Install Rune Tools

Install the command-line toolkit globally:

```bash
npm install -g rune-tools
```

### 2. Create a Project

Generate a new Rune application:

```bash
rune-tools create -a MyApp -d com.example -b 1.0.0
```

This creates a new project named `MyApp`, including the initial directory structure and files needed to get started.

### 3. Run Your Application

Navigate into your new project and install its dependencies:

```bash
cd MyApp
npm update
```

Launch the application:

```bash
npm test
```

You now have a starting point for your first Rune application.

The rest is up to you.

### 4. Keep Rune Updated

To update an existing project's Rune SDK build:

```bash
rune-tools update
```

For additional commands, project management features, and resource compilation, see the [Rune Tools documentation](https://github.com/VectorPanic/rune-tools).

## Development

### Object-Oriented by Design

Rune SDK takes its inspiration from the class-based architecture of ActionScript and the Flash development environment.

Its source code follows an **ECMAScript 5 style**, using explicit constructors, prototype-based inheritance, and clearly defined class boundaries.

This is a deliberate design choice.

Rather than hiding fundamental programming concepts behind layers of abstraction, Rune encourages developers to understand how their applications are structured and how their objects interact.

The result is an environment suitable for both practical game development and learning object-oriented programming.

### Project Structure

The Rune SDK repository is organized into the following directories:

| Directory | Description |
|---|---|
| `asset/` | Assets and project templates. |
| `bin/` | Runtime entry point using the compiled SDK. |
| `bin-debug/` | Runtime entry point using SDK source files. |
| `demo/` | Demonstration and test application. |
| `dist/` | Compiled SDK distribution. |
| `scripts/` | Build and development scripts. |
| `src/` | Rune SDK source code. |

For a closer look at how Rune applications are structured, explore the included demonstrations or the [Rymdsten](https://github.com/VectorPanic/rymdsten) example project.

## The Rune Ecosystem

**Create. Publish. Play.**

Rune SDK is the foundation of a broader open-source ecosystem for developing, distributing, and playing free independent games.

Inspired by the creative freedom of early web development, the simplicity of classic arcade games, and the ambition of open gaming platforms, Rune brings together everything from the first line of code to the finished game.

The ecosystem is designed around a simple principle: anyone should be able to learn, experiment, create, and share games without unnecessary barriers.

| Project | Description |
|---|---|
| **[Rune SDK](https://github.com/VectorPanic/rune-sdk)** | The core JavaScript game engine. |
| **[Rune Tools](https://github.com/VectorPanic/rune-tools)** | Command-line tools for creating, building, and managing Rune projects. |
| **[Rune OS](https://github.com/VectorPanic/rune-os)** | A console-style gaming platform for discovering, managing, and playing Rune games, with support for up to four connected controllers. |
| **[Rune Cloud](https://github.com/VectorPanic/rune-cloud)** | A self-hosted backend for publishing and distributing games to Rune OS installations. |
| **[Rune Cloud Client](https://github.com/VectorPanic/rune-cloud-client)** | A web-based management interface for Rune Cloud. |
| **[Rymdsten](https://github.com/VectorPanic/rymdsten)** | An arcade game built with Rune SDK and a practical example of the ecosystem. |

### From Development to Distribution

Rune provides a connected workflow for bringing games from an idea to a playable experience:

1. **Create** a game using Rune SDK and Rune Tools.
2. **Develop and experiment** with gameplay, graphics, sound, and interaction.
3. **Publish** the finished game through Rune Cloud.
4. **Distribute** the game to connected Rune OS installations.
5. **Discover and play** it in a dedicated console-style environment.

Rune OS can also run locally installed games without requiring a connection to Rune Cloud.

The idea isn't to build another commercial gaming marketplace. It's to provide a welcoming home for free independent games, where creativity and experimentation matter more than commercial success.

Small games deserve a place to shine, too.

## Education & Experimentation

**Learn by making.**

Education has always been part of Rune's DNA.

Rune SDK has been developed and used in teaching by the Media Technology group within the Department of Computer Science and Media Technology at Linnaeus University, Sweden, since 2020.

The engine provides an environment where students can explore programming through interactive applications and game development.

Its object-oriented architecture makes it particularly suitable for experimenting with concepts such as:

- Classes, objects, and inheritance.
- Application architecture and separation of responsibilities.
- Game loops and frame-based execution.
- Graphics, animation, and coordinate systems.
- User input and event handling.
- Collision detection and basic physics.
- Resource management and application state.

Rune encourages experimentation, whether that means creating a simple Pong clone, exploring a new rendering technique, or building an entirely new game.

The broader Rune ecosystem extends this philosophy beyond writing code. It allows students and independent developers to experience the complete process of creating, publishing, distributing, and playing games.

It's a playground for ideas, with enough structure to teach good programming practices along the way.

## Origins & History

### From the Arcade to the Living Room

Rune SDK traces its roots to **StickOS** and **StickOS SDK**, developed and used in education at Linnaeus University, Sweden, between 2011 and 2019.

StickOS was designed to run on **Evertron**, a physical arcade cabinet located in the entrance of Building B at Linnaeus University's Växjö campus.

Powered by an ActionScript-based SDK, the platform gave students an opportunity to develop games and see their creations come to life on a real arcade machine.

It was a simple but powerful idea: write some code, build a game, and let someone else play it.

In 2020, **Rune SDK** carried that legacy into JavaScript, preserving the educational philosophy and many of the concepts that shaped its predecessor.

The ecosystem has since evolved beyond the arcade cabinet.

**Rune OS** takes a more console-oriented approach, providing a dedicated environment for discovering and playing independent games, with support for up to four connected game controllers.

Together with Rune Cloud, the platform makes it possible to publish games and distribute them across multiple Rune OS installations.

While the hardware and technology have changed, the original idea remains: make game development accessible, encourage experimentation, and give small games a place to be played.

Today, Rune SDK continues to be developed and used in teaching by the Media Technology group within the Department of Computer Science and Media Technology at Linnaeus University, Sweden.

### What's in a Name?

The name **Rune** (pronounced /ˈrʉːnɛ/) is a tribute to **Rune Körnefors**, who taught JavaScript at Linnaeus University for many years.

The project is named after him and is pronounced like the Swedish given name, rather than the English word *rune*.

It's a small tribute to someone whose teaching helped inspire the project and a reminder of where Rune comes from.

Some projects are named after gods, mythical creatures, or obscure technical acronyms.

This one is named after a JavaScript teacher.

## Documentation

The Rune SDK API reference provides detailed information about the engine's classes, methods, and properties.

**[Browse the Rune SDK API Reference](https://vectorpanic.github.io/rune-docs/)**

Additional resources:

- [Rune Tools](https://github.com/VectorPanic/rune-tools) — Project creation and development tools.
- [Rune OS](https://github.com/VectorPanic/rune-os) — The Rune gaming platform.
- [Rune Cloud](https://github.com/VectorPanic/rune-cloud) — Game publishing and distribution.
- [Rune Cloud Client](https://github.com/VectorPanic/rune-cloud-client) — Web-based management for Rune Cloud.
- [Rymdsten](https://github.com/VectorPanic/rymdsten) — An arcade game built with Rune SDK.

## Contributing

Rune is an open-source project built around learning, creativity, and experimentation.

Contributions, bug reports, improvements, and new ideas are welcome.

If you discover an issue or have a suggestion, visit the [GitHub issue tracker](https://github.com/VectorPanic/rune-sdk/issues).

Whether you're fixing a small bug, improving documentation, or exploring new functionality, every contribution helps Rune grow.

## License

Rune SDK is released under the **MIT License**.

See the [LICENSE](https://github.com/VectorPanic/rune-sdk/blob/main/LICENSE) file for details.

---

**Rune SDK — Built for the joy of making games.**

*Made with JavaScript. Rooted in ActionScript. Still pushing pixels.*