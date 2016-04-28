# Myou

Myou is a __game engine for web__, it features an __editor based on Blender__
(It will be added soon).

It is built as a platform with __collaborative__ groups in mind, enabling a fast working environment which allows editing, prototyping, testing and also deployment of both __2D__ and __3D__ interactive content.

The __simplicity__ of Myou allows it to be suitable for people with or without any technical knowledge or a background in programming.

In the future the optimizations for __VR__ together with __Blender__ integration makes Myou inherently excellent for making __animated VR movies__ and engaging, interactive game cutscenes.

Myou is being used on some projects such as: [VidaBody](http://vidasystems.com/vidabody/) or [pixelements.net] (http://pixelements.net)

The first version of myou engine was written on Pyva (a python based languaje) and compiled to a javascript file.

This version of the myou engine has been ported to coffee-script and modified to
get it working as a node package. The node version of myou also allows the creation of
multiple instances of the engine.

## Features
* Blender exporter plugin
* Meshes with n-gons in a fast and compact binary format.
* Blender GLSL materials (plus some additional features available as material nodes).
* Soft shadows.
* Armatures with constraints (including IK).
* Shape keys.
* Animation of any attribute, including any material parameters
* Support for armature and material drivers from Blender.
* Automatic LoD based on multi-resolution, subsurf and decimation.
* Dynamic loading of assets without framerate reduction (even in WebGL).
* Physics: Currently Bullet (ammo.js when running in JS) is supported.
* Multiple self-contained engine instances are allowed on the same webpage.
* Multi-touch gestures (Only in chrome. Other browsers support will be added soon).


## Future features
* Physics: Cannon.js and Box2D engines will be suported soon.
* Debug server with live update of all scene data within Blender.
* 2D tools with SVG group separation for animation.
* Graphical programming of game logic with nodes, which is converted to code
you can learn from or expand.
* VR support.
* Generic and xInput Joystics.


## Supported platforms
Web browsers with __WebGL__ support (no plugins required).

In the future, Windows (DirectX), Linux, Mac, Android, iOS and SteamOS
and game consoles will be supported.

-----
## Usage
### Install the pagckage
```
npm install --save myou-engine
```

### Install the blender plugin
The blender plugin is currently supported in __Blender 2.71__.

Only the exporter is available on the blender plugin but the live server and other
tools will be added soon.

To install the blender plugin just copy the __myou_bl_plugin__ folder to the __blender addons__ folder (or link it, see below).

#### Blender addons folders####

Windows
```
C:\Users\%username%\AppData\Roaming\Blender Foundation\Blender\2.71\scripts\addons
```

Linux
```
/home/$user/.config/blender/$version/scripts/addons
```

#### (optional) Linking myou_bl_plugin to blender addons folder instead of copying

Windows (cmd)
```
mklink /j "%APPDATA%/Blender Foundation/Blender/2.71/scripts/addons/myou_bl_plugin" "[Path to myou_engine]/myou_bl_plugin"
```

Windows (cygwin)
```
 cmd /c mklink /j "%APPDATA%/Blender Foundation/Blender/2.71/scripts/addons/myou_bl_plugin" "[Path to myou_engine]/myou_bl_plugin"
```

Linux
```
ln -s "[path to myou_engine]/myou_bl_plugin" "/home/$user/.config/blender/2.71/scripts/addons"
```

### Export your blender scene
The exporter is available here: *__File > Export > Myou engine__*

#### WARNING:
Currently the blender export interface only supports exporting to file but the
myou plugin exports to a folder. To avoid this bug you have to create a "dumb"
file in the same directory where you want to export the scene with the chosen name.

Alternatively you can save your \*.blend file in the same directory
where you will export the scene and export using the same name of the \*.blend file.

### Use the package in your code
The example code in this page was written in coffee-script:
```coffee-script
MyouEngine = require 'myou-engine'
```

#### Define the root element
This element is used to capture the mouse and keyboard events.

You can use a canvas as root element, but if you will use an HTML based UI in
you game we recommend to create the canvas inside the root element.

```coffee-script
root  = document.getElementById 'app'
```

#### Create a canvas.
You can create a canvas by yourself, but this function creates and configures
the canvas directly to be used on myou.

```coffee-script
MyouEngine.create_canvas root
```
The "create_canvas" function returns a canvas, but if you set the root element
as parameter the canvas will also be inserted on it.

#### Api configuration
You can set some parameters to configure myou's behaviour.

```coffee-script
MYOU_PARAMS =
    debug: false # If true, it enables the debug features
    data_dir: "./data" # Path to the folder exported from blender that contains <scenes> and <texture> folders
    inital_scene: "" # If present, it will load this scene at the beginning. (deprecated option)
    load_physics_engine: true # if true, it will load the physic engine (Ammo.js).
    no_mipmaps: false # If true, it disables the mipmaps
    no_s3tc: true # Disable s3tc support
```
The boolean options are optional, false by default.

#### Create a myou instance and load the scene and objects
The myou object contains the scenes, game objects, MYOU_PARAMS, render manager, etc.
```coffee-script
myou = new myou.Myou root, MYOU_PARAMS
```
You can create any number of myou engine instances in your project but you will
need to create a root element for each of the instances.

We now proceed to load the scene and objects. The load_* functions returns a promise,
so we need to chain them in order to ensure they're available

```coffee-script
myou.load_scene('Scene').then (scene) ->
    console.log 'Scene has loaded and all objects exist, but meshes are not loaded'
    scene.load_visible_objects().then ->
        console.log 'All visible objects have loaded, now we enable the scene'
        scene.enable_render()
        scene.enable_physics()

    # Instead of load_visible_objects(), you can load all objects
    scene.load_all_objects().then ->

    # or you can load specific objects ->
    scene.load_objects([scene.objects.Cube]).then ->
```

## Documentation
We are working on the documentation. It will be added soon.

## Examples
Try it from:
<http://pixelements.net/myou/examples/>

To run the example locally, you can choose one of these two alternatives:

1. From the browser using __Webpack__

    ```
    cd [myou-engine]/examples/[example]
    webpack
    node run_server.js
    ```

    Alternatively, you can configure your browser to allow file access to avoid using the server.

2. Natively using __Electron__

    ```
    cd [myou-engine]/examples/[example]
    node electron_launcher.js
    ```

## Feedback

You can send any feedback or question to:
* Julio Manuel López <julio@pixlements.net>
* Alberto Torres Ruiz <kungfoobar@gmail.com>
