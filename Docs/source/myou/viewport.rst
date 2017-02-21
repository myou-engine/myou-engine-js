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
