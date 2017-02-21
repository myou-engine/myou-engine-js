Class: GameObject
=================

.. toctree::
   :maxdepth: 2

   Classes that extend this <tocs/gameobjectextends>

.. highlight:: coffeescript

===========
Constructor
===========

:code:`new GameObject(@context, use_physics)`

Source: **gameobject.coffee**, `line 30 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L30>`_

+-----------+-----------+------------------------------------------------+
|Arguments  | Type      |Description                                     |
+===========+===========+================================================+
|@context   |Myou       |Myou context                                    |
+-----------+-----------+------------------------------------------------+
|use_physics|Boolean    |Determine whether to use physics or not         |
+-----------+-----------+------------------------------------------------+

..
  =======
  Members
  =======

  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |Name                    | Type      |Description                                        |Source                                                                                                             |
  +========================+===========+===================================================+===================================================================================================================+
  |debug                   |Boolean    |Debug flag                                         |**gameobject.js**, `line 31 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L31>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |position                |vec3       |GameObject position                                |**gameobject.js**, `line 32 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L32>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |rotation                |quat       |GameObject rotation                                |**gameobject.js**, `line 33 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L33>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |radius                  |int        |GameObject radius                                  |**gameobject.js**, `line 34 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L34>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |rotation_order          |String     |Determines the order of GameObject's rotation      |**gameobject.js**, `line 35 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L35>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |scale                   |vec3       |GameObject scale                                   |**gameobject.js**, `line 36 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L36>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |dimensions              |vec3       |GameObject dimensions (the true size of the object)|**gameobject.js**, `line 37 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L37>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |color                   |vec4       |GameObject color                                   |**gameobject.js**, `line 38 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L38>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |alpha                   |           |GameObject transparency                            |**gameobject.js**, `line 39 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L39>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |offset_scale            |           |                                                   |**gameobject.js**, `line 40 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L40>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |scene                   |           |                                                   |**gameobject.js**, `line 41 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L41>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |dupli_group             |                                                   |**gameobject.js**, `line 42 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L42>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |visible                 |Boolean    |Defauls to true. Set to false to hide object.      |**gameobject.js**, `line 43 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L43>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |_world_position         |vec3       |GameObject position in world                       |**gameobject.js**, `line 44 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L44>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |_sqdist                 |           |Squared distance from camera                       |**gameobject.js**, `line 45 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L45>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |parent                  |GameObject |Parent object                                      |**gameobject.js**, `line 46 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L46>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |children[]              |GameObject |Array of child objects                             |**gameobject.js**, `line 47 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L47>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |static                  |Boolean    |Determines if the GameObject is static             |**gameobject.js**, `line 48 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L48>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |world_matrix            |vec4       |World matrix                                       |**gameobject.js**, `line 49 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L49>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |rotation_matrix         |mat3       |Not used elsewhere                                 |**gameobject.js**, `line 50 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L50>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |normal_matrix           |mat3       |                                                   |**gameobject.js**, `line 51 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L51>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |_m3                     |mat3       |                                                   |**gameobject.js**, `line 52 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L52>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |custom_uniform_values[] |           |Whatever you want them to be                       |**gameobject.js**, `line 53 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L53>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |properties              |           |GameObject properties                              |**gameobject.js**, `line 54 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L54>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |animations              |           |GameObject animations                              |**gameobject.js**, `line 55 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L55>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |name                    |String     |GameObject name                                    |**gameobject.js**, `line 56 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L56>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |original_name           |String     |GameObject original name                           |**gameobject.js**, `line 57 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L57>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |mirrors                 |           |GameObject mirrors                                 |**gameobject.js**, `line 58 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L58>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |lod_objects             |           |                                                   |**gameobject.js**, `line 59 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L59>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |parent_bone_index       |           |Parent's bone index                                |**gameobject.js**, `line 60 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L60>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |body                    |           |Body physics                                       |**gameobject.js**, `line 61 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L61>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |shape                   |           |Shape phyics                                       |**gameobject.js**, `line 62 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L62>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+
  |physics_type            |String     |GameObject physics type                            |**gameobject.js**, `line 63 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L63>`_|
  +------------------------+-----------+---------------------------------------------------+-------------------------------------------------------------------------------------------------------------------+




=======
Methods
=======

-----------------------------------
instance_physics: (use_visual_mesh)
-----------------------------------

Sets the physics settings for that instance of an object.

This function only can be called if the object is in a scene.

+------------------+--------+-------------------------------+
|Arguments         |Type    |Description                    |
+==================+========+===============================+
|use_visual_mesh   |Boolean |Defaults to false.             |
+------------------+--------+-------------------------------+

    Source: **gameobject.js**, `line 105 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L105>`_

------------------
_update_matrices()
------------------

Updates object matrices.

    Source: **gameobject.js**, `line 304 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L304>`_

---------------------------
update_matrices_recursive()
---------------------------

Updates object matrices recursively.

    Source: **gameobject.js**, `line 407 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L407>`_

-------------------
calc_bounding_box()
-------------------

Calculates the bounding box of an object.

    Source: **gameobject.js**, `line 411 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L411>`_


--------------------------------------
get_world_position (out=vec3.create())
--------------------------------------

+------------------+--------+-----------------------------------------------------------------+
|Arguments         |Type    |Description                                                      |
+==================+========+=================================================================+
|out               |vec3    |The target vec3. Defaults to a new vec3.                         |
+------------------+--------+-----------------------------------------------------------------+

Obtains the world position of an object in the form of a `vec3 <http://glmatrix.net/docs/vec3.html>`_.

    Source: **gameobject.js**, `line 421 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L421>`_


--------------------------------------
get_world_rotation (out=quat.create())
--------------------------------------

+------------------+--------+-----------------------------------------------------------------+
|Arguments         |Type    |Description                                                      |
+==================+========+=================================================================+
|scene             |Scene   |Is the target scene. Defaults to the current scene.              |
+------------------+--------+-----------------------------------------------------------------+


Obtains the world rotation of an object in the form of a `quat <http://glmatrix.net/docs/quat.html>`_.

    Source: **gameobject.js**, `line 424 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L424>`_


-----------------
get_world_pos_rot
-----------------

Obtains the world rotation and world position of an object and returns them in the form of an array [position, rotation]

    Source: **gameobject.js**, `line 431 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L431>`_


-----------------
get_world_matrix
-----------------

Returns the world matrix.

    Source: **gameobject.js**, `line 437 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L437>`_


-----------------------------------------
clone (scene, recursive)
-----------------------------------------

Creates a copy of an object.

+------------------+--------+-----------------------------------------------------------------+
|Arguments         |Type    |Description                                                      |
+==================+========+=================================================================+
|scene             |Scene   |Is the target scene. Defaults to the current scene.              |
+------------------+--------+-----------------------------------------------------------------+
|recursively       |Boolean |Determines whether the function runs recursively. Give true if   |
|                  |        |you want to clone child objects of the target. Defaults to false.|
+------------------+--------+-----------------------------------------------------------------+



    Source: **gameobject.js**, `line 442 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L442>`_


------------------
remove (recursive)
------------------

Removes the target object by calling :ref:`Scene.remove_object <sceneRemoveObject>`

    Source: **gameobject.js**, `line 483 <https://github.com/myou-engine/myou-engine/blob/master/engine/gameobject.coffee#L483>`_
