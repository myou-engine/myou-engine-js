Viewport
========

.. toctree::

  Compositor <compositor>

===============
Class: Viewport
===============

Is where rendering happens.

constructor: (@render_manager, @camera, @rect, @custom_size, @dest_buffer)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

+------------------+------------+----------------------------------------------+
|Argument          |Type        |Description                                   |
+==================+============+==============================================+
|@render_manager   |Myou        |The myou object                               |
+------------------+------------+----------------------------------------------+
|@camera           |Camera      |Main camera                                   |
+------------------+------------+----------------------------------------------+
|@rect             |Number array|Takes parameters x1, y1, and x2, y2 for       |
|                  |            |the x and y positions of the top left, and    |
|                  |            |bottom right corners of a rectangle.          |
+------------------+------------+----------------------------------------------+
|@custom_size      |Number array|An array for width and height                 |
+------------------+------------+----------------------------------------------+
|@dest_buffer      |Framebuffer |Destination :ref:`framebuffer <Framebuffer>`  |
+------------------+------------+----------------------------------------------+

=======
Methods
=======

recalc_aspect
^^^^^^^^^^^^^

Recalculates the aspect ratio of the target viewport.

Calls :ref:`camera.recalculate_projection <cameraRecalcProjection>`


set_clear: (color, depth)
^^^^^^^^^^^^^^^^^^^^^^^^^
Clears the GL color and depth buffers (will wipe the drawing surface clear).

+------------------+------------+----------------------------------------------+
|Argument          |Type        |Description                                   |
+==================+============+==============================================+
|color             |Boolean     |Whether to clear the color buffer or not.     |
+------------------+------------+----------------------------------------------+
|depth             |Boolean     |Whether to clear the depth buffer or not.     |
+------------------+------------+----------------------------------------------+


clone
^^^^^

Makes a copy of the target viewport, and returns it.

    Source: **viewport.coffee**, `line 43 <https://github.com/myou-engine/myou-engine/blob/master/engine/viewport.coffee#L43>`_

get_size_px
^^^^^^^^^^^

Returns an array of size_x and size_y for the target viewport.

    Source: **viewport.coffee**, `line 46 <https://github.com/myou-engine/myou-engine/blob/master/engine/viewport.coffee#L46>`_
