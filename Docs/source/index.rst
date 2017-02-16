Myou Engine documentation
=======================================

.. toctree::
   :maxdepth: 2

   myou/myou
   tutorial/tutorial
   license

Features
--------
- Blender exporter plugin

- Meshes with n-gons in a fast and compact binary format.

- Blender GLSL materials (plus some additional features available as material nodes).

- Soft shadows.

- Armatures with constraints (including IK).

- Shape keys.

- Animation of any attribute, including any material parameters

- Support for armature and material drivers from Blender.

- Automatic LoD based on multi-resolution, subsurf and decimation.

- Dynamic loading of assets without framerate reduction (even in WebGL).

- Physics: Currently Bullet (ammo.js when running in JS) is supported.

- Multiple self-contained engine instances are allowed on the same webpage.

- Multi-touch gestures (Only in chrome. Other browsers support will be added soon).

- VR support.

Future features
---------------
- Myou Editor which will include: Scenes editor, material editor, Logic editor, assets manager, animations manager.

- Physics: Cannon.js and Box2D engines will be suported soon.

- Debug server with live update of all scene data within Blender.

- 2D tools with SVG group separation for animation.

- Graphical programming of game logic with nodes, which is converted to code you can learn from or expand.

- Generic and xInput Joystics.

Supported platforms
-------------------
Web browsers with WebGL support (no plugins required).

In the future, Windows (DirectX), Linux, Mac, Android, iOS and SteamOS and game consoles will be supported.
