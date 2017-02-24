Material
========

====================
Class: ShadingParams
====================

Sets parameters for the material shader.

-----------
Constructor
-----------

.. code-block:: coffeescript

  new ShadingParams (params)

===============
Class: Material
===============

-----------
Constructor
-----------

.. code-block:: coffeescript

  new Material (@context, @data, @scene)

+----------+------------+------------------------------------------+
|Argument  |Type        |Description                               |
+==========+============+==========================================+
|context   |Myou        |The myou object                           |
+----------+------------+------------------------------------------+
|data      |List        |A list of options:                        |
|          |            | + @name                                  |
|          |            | + uniforms                               |
|          |            | + attributes                             |
|          |            | + params = []                            |
+----------+------------+------------------------------------------+
|scene     |Scene       |The target scene object                   |
+----------+------------+------------------------------------------+

-------
Methods
-------

use
^^^

reupload

destroy

debug_set_uniform: (utype, uname, value)->

debug_set_custom_uniform: (utype, index, value)->

clone_to_scene: (scene)->

debug_blender_material: (varnum) ->
