---
currentMenu: getStarted
---

##Getting started with Myou

###Installation
Before you can begin with Myou, you will need two things installed.
 
+ [Node.js](https://nodejs.org/en/ "Node.js homepage") (I recommend you use the LTS version)

+ [Blender](https://www.blender.org/ "Blender homepage")
	+ At the moment there is a slight bug with rendering hemi lighting in Blender 2.78, you may want to use an older version of Blender [here](http://download.blender.org/release/Blender2.77/ "Blender versions 2.77 and 2.77a") if you happen to use that.

Once Blender is installed, download the Myou plugin [here](https://github.com/myou-engine/myou-blender-plugin/archive/master.zip "Myou plugin for Blender"). It will have to be installed in Blender to allow you to export models for Myou. Open Blender, and go to File > User Preferences > Addons > Install from file. Here, use the zip file you downloaded. 

Once the plugin is installed, enable it by scrolling down the list of plugins until you find "Game Engine: Myou game engine", or search for it in the search box at the top right of the plugin window. Make sure the box is ticked. 

After installing these things, check to make sure you have Node.js in your path. The easiest way to do this is to search for the Nodejs Command Prompt on Windows, or open a terminal or CMD and typing in `node -v` and if you have the same version as mine, you should see a response saying `v6.9.1`. If you see this, or any other number that reflects your version of Node, then you're all set to start.

Otherwise, if you see something that says that the command does not exist or cannot be found, you will need to add Node.js to your path. To do this on Windows: 

1. Search for "environment variables" in your start menu or start screen, and click on it. 
2. Click on "Path" and click edit.
3. Click "new" and add the path to the Node.js folder where the .exe is. It is typically saved to `c:\Program Files\nodejs\node_modules\npm\bin`

Once you have Node set up, you can move on to the next step: [Your first project](firstproject.md)