Class: Myou
===========

.. highlight:: coffeescript

===========
Constructor
===========

:code:`new Myou(root, MYOU_PARAMS)`

Source: **myou.coffee**, `line 9 <https://github.com/myou-engine/myou-engine/blob/master/engine/myou.coffee#L10>`_

+-----------------------+-----------+----------------------------------------------------------+
|Name                   | Type      |Description                                               |
+=======================+===========+==========================================================+
|scenes                 |List       |A list of scenes from the scenes folder.                  |
+-----------------------+-----------+----------------------------------------------------------+
|loaded_scenes          |Array      |An array of scenes that have been loaded.                 |
+-----------------------+-----------+----------------------------------------------------------+
|active_sprites         |Array      |An array of sprites to be rendered and animated.          |
+-----------------------+-----------+----------------------------------------------------------+
|objects                |List       |A list of objects in the scene.                           |
+-----------------------+-----------+----------------------------------------------------------+
|actions                |List       |A list of actions that make up an animation.              |
+-----------------------+-----------+----------------------------------------------------------+
|groups                 |List       |A list of `Groups <group.html>`_.                         |
+-----------------------+-----------+----------------------------------------------------------+
|log                    |Array      |                                                          |
+-----------------------+-----------+----------------------------------------------------------+
|textures               |List       |A list of textures from the textures folder.              |
+-----------------------+-----------+----------------------------------------------------------+
|video_textures         |List       |A list of video textures.                                 |
+-----------------------+-----------+----------------------------------------------------------+
|debug_loader           |           |A websockets based loader for debugging                   |
+-----------------------+-----------+----------------------------------------------------------+
|canvas                 |HTML canvas|An HTML5 canvas element                                   |
+-----------------------+-----------+----------------------------------------------------------+
|root                   |HTML canvas|The canvas element to be used.                            |
+-----------------------+-----------+----------------------------------------------------------+
|all_materials          |Array      |An array of all the materials.                            |
+-----------------------+-----------+----------------------------------------------------------+
|mesh_datas             |List       |A list of the data related to each mesh, paired by a hash.|
+-----------------------+-----------+----------------------------------------------------------+
|embed_meshes           |List       |A list of meshes to be embedded.                          |
+-----------------------+-----------+----------------------------------------------------------+
|SHADER_LIB             |String     |The shader library.                                       |
+-----------------------+-----------+----------------------------------------------------------+
|active_animations      |Array      |An array of currently ongoing animations                  |
+-----------------------+-----------+----------------------------------------------------------+
|root                   |HTML canvas|The canvas element to be used.                            |
+-----------------------+-----------+----------------------------------------------------------+
|MYOU_PARAMS            |List       |Parameters that affect the creation of the Myou object.   |
+-----------------------+-----------+----------------------------------------------------------+
|use_physics            |Boolean    |Takes the opposite of MYOU_PARAMS.disable_physics.        |
+-----------------------+-----------+----------------------------------------------------------+
|hash                   |Number     |Calls math.random to use as a hash value for meshes.      |
+-----------------------+-----------+----------------------------------------------------------+
|initial_scene_loaded   |Boolean    |Defaults to False.                                        |
+-----------------------+-----------+----------------------------------------------------------+
|mesh_lod_min_length_px |Number     |Defines the level of detail in a mesh.                    |
+-----------------------+-----------+----------------------------------------------------------+

..
  Line 51 repeats line 39. This reflects the actual myou.coffee source.

=======
Members
=======

+-----------+-----------+--------------+-------------------------------------------------------------------------------------------------------+
|Name       | Type      |Description   |Source                                                                                                 |
+===========+===========+==============+=======================================================================================================+
|hasVR      |Boolean    |Checks for VR |**myou.js**, `line 81 <https://github.com/myou-engine/myou-engine/blob/master/engine/myou.coffee#L81>`_|
+-----------+-----------+--------------+-------------------------------------------------------------------------------------------------------+
|initVR     |Boolean    |              |**myou.js**, `line 82 <https://github.com/myou-engine/myou-engine/blob/master/engine/myou.coffee#L82>`_|
+-----------+-----------+--------------+-------------------------------------------------------------------------------------------------------+
|exitVR     |Boolean    |              |**myou.js**, `line 83 <https://github.com/myou-engine/myou-engine/blob/master/engine/myou.coffee#L83>`_|
+-----------+-----------+--------------+-------------------------------------------------------------------------------------------------------+

=======
Methods
=======

------------------------------------------------
load_scene: (name, load_physics=true) -> promise
------------------------------------------------

Loads the scene by calling loader.load_scene

Parameters:

+------------------+--------+-------------------------------+
|Name              |Type    |Description                    |
+==================+========+===============================+
|name              |String  |The name of the scene          |
+------------------+--------+-------------------------------+
|load_physics      |Boolean |Load physics. Defaults to true.|
+------------------+--------+-------------------------------+

    Source: **myou.js**, `line 74 <https://github.com/myou-engine/myou-engine/blob/master/engine/myou.coffee#L74>`_

------------------
update_canvas_rect
------------------

Updates canvas rectangles
