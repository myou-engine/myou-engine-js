Mesh
====

.. highlight:: coffeescript

Meshes make use of `GameObject <gameobject.html>`_ and `material <material.html>`_.

===============
Class: MeshData
===============
Constructor:
::

  new MeshData (@context)

+----------+------------+-------------------------------+
|Argument  |Type        |Description                    |
+==========+============+===============================+
|context   |Myou        |The myou object                |
+----------+------------+-------------------------------+

    Source: **mesh.coffee**, `line 57 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L57>`_

-------
Methods
-------

reupload
^^^^^^^^

Removes and re-adds data.

    Source: **mesh.coffee**, `line 76 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L76>`_


remove (ob)
^^^^^^^^^^^

Finds and removes the object :code:`ob` from the users array.

If :code:`ob` is the only object in the context, then this also deletes the hash.

+----------+------------+-------------------------------+
|Argument  |Type        |Description                    |
+==========+============+===============================+
|ob        |Mesh        |Object in the users array      |
+----------+------------+-------------------------------+


    Source: **mesh.coffee**, `line 86 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L86>`_

===========
Class: Mesh
===========

extends `GameObject <gameobject.html>`_

-----------
constructor
-----------

::

  new Mesh (@context)

    Source: **mesh.coffee**, `line 93 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L93>`_

-------
Methods
-------

load_from_arraybuffer: (data)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Creates vertex and index arrays to pass into load_from_va_ia from the arraybuffer.

+----------+------------+-------------------------------+
|Argument  |Type        |Description                    |
+==========+============+===============================+
|data      |Arraybuffer |Data taken from the arraybuffer|
+----------+------------+-------------------------------+


    Source: **mesh.coffee**, `line 127 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L127>`_


load_from_lists: (vertices, indices)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Creates a vertex array from vertices, and an index array from indices, and then calls load_from_va_ia with them as arguments.

+----------+------------+-------------------------------+
|Argument  |Type        |Description                    |
+==========+============+===============================+
|vertices  |List        |List of vertices               |
+----------+------------+-------------------------------+
|indices   |List        |List of indices                |
+----------+------------+-------------------------------+

    Source: **mesh.coffee**, `line 138 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L138>`_


load_from_va_ia: (va, ia)
^^^^^^^^^^^^^^^^^^^^^^^^^

Loads data from va and ia into Mesh.data.

+----------+------------+-------------------------------+
|Argument  |Type        |Description                    |
+==========+============+===============================+
|va        |Array       |Array of vertices              |
+----------+------------+-------------------------------+
|ia        |Array       |Array of indices               |
+----------+------------+-------------------------------+

    Source: **mesh.coffee**, `line 142 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L142>`_


update_iarray
^^^^^^^^^^^^^

Updates iarray with new data.

    Source: **mesh.coffee**, `line 196 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L196>`_


configure_materials: (materials=[])
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Compiles materials for use.

+----------+------------+-------------------------------+
|Argument  |Type        |Description                    |
+==========+============+===============================+
|materials |Array       |Array of materials,            |
|          |            |defaults to empty.             |
+----------+------------+-------------------------------+


    Source: **mesh.coffee**, `line 209 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L209>`_


get_lod_mesh: (viewport, min_length_px)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Gets the `LOD <https://en.wikipedia.org/wiki/Level_of_detail>`_ version of a mesh.

+---------------+----------+-------------------------------------------------------------+
| Argument      | Type     |                         Description                         |
+===============+==========+=============================================================+
| viewport      | Viewport | Target viewport                                             |
+---------------+----------+-------------------------------------------------------------+
| min_length_px | number   | The minimum length of the average polygon, in screen pixels |
+---------------+----------+-------------------------------------------------------------+


    Source: **mesh.coffee**, `line 396 <https://github.com/myou-engine/myou-engine/blob/master/engine/mesh.coffee#L93>`_

==================
Class: MeshFactory
==================

This is a `singleton <https://en.wikipedia.org/wiki/Singleton_pattern>`_.

-----------
Constructor
-----------

::

  new MeshFactory (@context)
