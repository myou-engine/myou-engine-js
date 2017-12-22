# Myou

Myou Engine is a game engine for web, for mobile and for VR (soon).

It's designed for easy of use with **Blender**, packing as many features as possible in a small package of **120 kb** (gzipped) and an approachable source code for both beginners and experts.

It supports both **Cycles/Eevee materials** (WYSIWYG with [Blender PBR branch] and the future Blender 2.8), and **Blender internal/Blender game** materials.

It's [FOSS](https://en.wikipedia.org/wiki/Free_and_open-source_software) published under the industry-friendly MIT license.

## Features
* Blender based exporter and editor.
* Efficient data formats.
* Pluggable API for mesh modifiers and materials.
* Support for Blender internal/Blender game GLSL materials and nodes.
* Support for Blender Cycles nodes (WYSIWYG with [Blender PBR branch] and the future Blender 2.8).
* Environment maps, soft shadows, reflection, refraction, etc.
* Armatures with constraints (including IK).
* Shape keys.
* Support for animations including mixing with Blender NLA.
* Animation of any attribute, including any material parameter.
* Support for animation drivers from Blender.
* Automatic LoD based on multi-resolution, subsurf and decimation.
* Physics: Currently Bullet (ammo.js when running in JS) is supported.
* Deferred loading of the physics engine and physic objects, for fast startup times.
* Multiple self-contained engine instances are allowed on the same webpage.
* Simple game-oriented event system for mouse, touch, keyboard and game input devices.
* WebVR support.
* Native Vulkan support with VR (soon).

For a more visual introduction see http://myou.cat/#engine/features

## Supported platforms
* Web browsers with __WebGL__ support, including mobile devices. It can use WebGL 2 where available.
* Any platform supported by Rust-lang and with Vulkan (soon).

-----
## Usage
Go to http://myou.cat/#engine/tutorials

## Documentation
We are working on the documentation. It will be added soon.

## Feedback

You can send any feedback or question to:
* Julio Manuel López <julio@pixlements.net>
* Alberto Torres Ruiz <kungfoobar@gmail.com>
