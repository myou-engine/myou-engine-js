Render
======

.. toctree::

  Framebuffer <framebuffer>
  Viewport <viewport>

====================
Class: RenderManager
====================

Handles rendering. Is created in the `Myou <myou.html>`_ constructor.

-----------
Constructor
-----------
.. highlight:: coffeescript

::

  new RenderManager(context, canvas, width, height, glflags)

+----------+-------------------------------+
|Argument  |Description                    |
+==========+===============================+
|context   |The myou object                |
+----------+-------------------------------+
|canvas    |The canvas to be used          |
+----------+-------------------------------+
|width     |The width in pixels            |
+----------+-------------------------------+
|height    |The height in pixels           |
+----------+-------------------------------+
|glflags   |GL arguments                   |
+----------+-------------------------------+

Source: render.coffee, `line 14 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L14>`_


This is called in myou.coffee, `line 50 <https://github.com/myou-engine/myou-engine/blob/master/engine/myou.coffee#L50>`_

-------
Methods
-------

initialize
^^^^^^^^^^
Initializes values for the render manager.

Source: render.coffee, `line 111 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L111>`_

clear_context
^^^^^^^^^^^^^
Removes `textures <texture.html>`_ from the context.

Source: render.coffee, `line 194 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L194>`_

restore_context
^^^^^^^^^^^^^^^
Restores `textures <texture.html>`_ to the context.

Source: render.coffee, `line 200 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L200>`_

set_cull_face (boolean)
^^^^^^^^^^^^^^^^^^^^^^^
Enables or disables face culling.


Source: render.coffee, `line 210 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L210>`_

resize (width, height, pixel_ratio_x, pixel_ratio_y)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Resizes the rendering canvas and viewports.

+--------------+-------------------------------+
|Argument      |Description                    |
+==============+===============================+
|width         |The myou object                |
+--------------+-------------------------------+
|height        |The canvas to be used          |
+--------------+-------------------------------+
|pixel_ratio_x |The width in pixels            |
+--------------+-------------------------------+
|pixel_ratio_y |The height in pixels           |
+--------------+-------------------------------+

Source: render.coffee, `line 216 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L216>`_

resize_soft: (width, height)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Resizes viewports.

+--------------+-------------------------------+
|Argument      |Description                    |
+==============+===============================+
|width         |The myou object                |
+--------------+-------------------------------+
|height        |The canvas to be used          |
+--------------+-------------------------------+

Source: render.coffee, `line 236 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L236>`_

request_fullscreen
^^^^^^^^^^^^^^^^^^

Requests the browser to enable fullscreen.

Source: render.coffee, `line 216 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L216>`_

recalculate_fb_size
^^^^^^^^^^^^^^^^^^^

Recalculates the size of the framebuffer to the smallest possible power of two


Source: render.coffee, `line 250 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L250>`_

change_enabled_attributes
^^^^^^^^^^^^^^^^^^^^^^^^^

Source: render.coffee, `line 281 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L281>`_

draw_all
^^^^^^^^^^^^^^^^^^^^^^^^^

Draw everything in the scene

Source: render.coffee, `line 300 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L300>`_

draw_mesh: (mesh, mesh2world, pass\_=-1)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Returns true if the frame should continue

+------------------------------------------------+--------------------------------------------------------------+
|Argument                                        |Description                                                   |
+================================================+==============================================================+
|mesh                                            |The mesh object                                               |
+------------------------------------------------+--------------------------------------------------------------+
|mesh2world                                      |A matrix for the mesh                                         |
+------------------------------------------------+--------------------------------------------------------------+
|pass\_                                          |Just a flag                                                   |
+------------------------------------------------+--------------------------------------------------------------+

Source: render.coffee, `line 348 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L348>`_


draw_viewport: (viewport, rect, dest_buffer, passes)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Draw into the viewport

+------------------------------------------------+--------------------------------------------------------------+
|Argument                                        |Description                                                   |
+================================================+==============================================================+
|viewport                                        |Target viewport                                               |
+------------------------------------------------+--------------------------------------------------------------+
|rect                                            |Viewport rectangle                                            |
+------------------------------------------------+--------------------------------------------------------------+
|dest_buffer                                     |Destination buffer                                            |
+------------------------------------------------+--------------------------------------------------------------+
|passes                                          |Used to determine the method of rendering                     |
+------------------------------------------------+--------------------------------------------------------------+


Source: render.coffee, `line 589 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L589>`_


type_debug
^^^^^^^^^^

This function makes sure that all vectors/matrices are typed arrays

Source: render.coffee, `line 863 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L863>`_


polycount_debug
^^^^^^^^^^^^^^^

Checks for discrepancies between the total amount of 'poly's, the total visibal 'poly's, and total invisible 'poly's.

Source: render.coffee, `line 881 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L881>`_


restore_polycount_debug
^^^^^^^^^^^^^^^^^^^^^^^

Source: render.coffee, `line 902 <https://github.com/myou-engine/myou-engine/blob/2980dbfe919b94d61eb105e479f1fed9059bd7dd/engine/render.coffee#L902>`_


Screens
=======
