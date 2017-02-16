Class: Myou
===========

.. highlight:: coffeescript

===========
Constructor
===========

:code:`new Myou(root, MYOU_PARAMS)`

Source: **myou.coffee**, `line 9 <https://github.com/myou-engine/myou-engine/blob/master/engine/myou.coffee#L10>`_

+-----------+-----------+------------------------------------------------+
|Name       | Type      |Description                                     |
+===========+===========+================================================+
|MYOU_PARAMS|Array      |Determines certain settings for Myou's behaviour|
+-----------+-----------+------------------------------------------------+

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


.. code-block:: coffeescript
  :linenos:

  class Myou
      constructor: (root, MYOU_PARAMS)->
          @scenes = {}
          @loaded_scenes = []
          @active_sprites = []
          @objects = {}
          @actions = {}
          @groups = {}
          @log = []
          @textures = {}
          @video_textures = {}
          @debug_loader = null
          @canvas = null
          @root = null
          @all_materials = []
          @mesh_datas = {}
          @embed_meshes = {}
          @SHADER_LIB = ''
          @active_animations = []
          @root = root
          @MYOU_PARAMS = MYOU_PARAMS
          @use_physics = not MYOU_PARAMS.disable_physics
          @hash = Math.random()
          @initial_scene_loaded = false
          @mesh_lod_min_length_px = 13
