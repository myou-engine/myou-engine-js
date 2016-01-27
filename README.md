# Myou

Myou is a __game engine for web__, it features an __editor based on Blender__
(It will be added soon).

It is built as a platform with __collaborative__ groups in mind, enabling a fast working environment which allows editing, prototyping, testing and also deployment of both __2D__ and __3D__ interactive content.

The __simplicity__ of Myou allows it to be suitable for people with or without any technical knowledge or a background in programming.

In the future the optimizations for __VR__ together with __Blender__ integration makes Myou inherently excellent for making __animated VR movies__ and engaging, interactive game cutscenes.

Myou is being used on some projects such as: [VidaBody](http://vidasystems.com/vidabody/) or [pixelments.net] (http://pixelements.net)

The first version of myou engine was written on Pyva (a python based languaje) and compiled to a javascript file.

This version of the myou engine has been ported to coffee-script and modified to
get it working as a node package. The node version of myou also allows the creation of
multiple instances of the engine.

## Features

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

### Use the package in your code
The example code in this page was written in coffee-script:
```coffee-script
myou = require 'myou'
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
myou.create_canvas root
```
The "create_canvas" function returns a canvas, but if you set the root element
as parameter the canvas will also be inserted on it.

#### Api configuration
You can set some parameters to configure myou's behaviour.

```coffee-script
MYOU_PARAMS =
    total_size: 26775095 #Total size of the app to be used on the loading progress bar.
    debug: false # If true, it enables the debug features
    live_server: false # True when you are using the blender live server.
    data_dir: "./data" # Path to the folder that contains <scenes> and <texture> folders
    scripts_dir: "./scripts" # Where the physics engine, and other JS scripts are placed.
    inital_scene: "Scene" # "Scene" by default. It is the name of the scene that will be loaded at the beginning.
    load_physics_engine: true # if true, it allows to load the physic engine.
    no_mipmaps: false # If true, it disables the mipmaps
    no_s3tc: navigator.userAgent.toString().indexOf('Edge/12.')!=-1
    #This code disables s3tc only if you are using Edge.
```
The boolean options are optional, false by default.

#### Create a myou instance
The myou object contains the scenes, game objects, MYOU_PARAMS, render manager, etc.
```coffee-script
myou_instance = new myou.Myou root, MYOU_PARAMS
```
You can create any number of myou engine instances in your project but you will
need to create a root element for each of the instances.

## Documentation
We are working on the documentation. It will be added soon.

## Examples
You can compile an example included in the package.
You just have to run this command in the root dir of the package:
```
webpack --config webpack.config.example
```

And run this simple python server from this bash script in the example directory.
```
cd example
sh server.sh
```
And then you can enter in your browser to:

<http://localhost:8000/build/example.html>

Alternatively, you can configure your browser to allow file access.

## Feedback

You can send any feedback or question to:
* Julio Manuel López <julio@pixlements.net>
* Alberto Torres Ruiz <kungfoobar@gmail.com>
