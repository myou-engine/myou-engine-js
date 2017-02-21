Framebuffer
===========

Is what renders images.

==================
Class: Framebuffer
==================

Allows the user to create custom framebuffers to render images off-screen without disturbing the current image.

-----------
Constructor
-----------

.. highlight::coffeescript

::

  new Framebuffer (@context, @options)

+----------+------------------------------------------+
|Argument  |Description                               |
+==========+==========================================+
|context   |The myou object                           |
+----------+------------------------------------------+
|options   |A list of options surroinded by brackets. |
|          |                                          |
|          |+ Size: An array for [width, height]      |
|          |+ use_depth: true/false                   |
|          |+ color_type: defaults to 'FLOAT'         |
|          |+ depth_type: defaults to null            |
+----------+------------------------------------------+

Source: **framebuffer.coffee**, `line 20 <https://github.com/myou-engine/myou-engine/blob/374be28bef3948ec6315c5284e494973e1e8341b/engine/framebuffer.coffee#L20>`_

-------
Methods
-------

recreate()
^^^^^^^^^^

Remake the framebuffer.

Source: **framebuffer.coffee**, `line 84 <https://github.com/myou-engine/myou-engine/blob/374be28bef3948ec6315c5284e494973e1e8341b/engine/framebuffer.coffee#L84>`_


enable (rect)
^^^^^^^^^^^^^

Enables the framebuffer

+----------+------------------------------------------+
|Argument  |Description                               |
+==========+==========================================+
|rect      |Defaults to null                          |
+----------+------------------------------------------+

Source: **framebuffer.coffee**, `line 88 <https://github.com/myou-engine/myou-engine/blob/374be28bef3948ec6315c5284e494973e1e8341b/engine/framebuffer.coffee#L88>`_


disable()
^^^^^^^^^

Disables the framebuffer.

Source: **framebuffer.coffee**, `line 108 <https://github.com/myou-engine/myou-engine/blob/374be28bef3948ec6315c5284e494973e1e8341b/engine/framebuffer.coffee#L108>`_


draw_with_filter (filter, src_rect)
^^^^^^^

+----------+-------------------------------------------+
|Argument  |Description                                |
+==========+===========================================+
|filter    |The intended `filter <filter.html>`_ object|
+----------+-------------------------------------------+
|src_rect  |Takes parameters x1, y1, and x2, y2 for    |
|          |the x and y positions of the top left, and |
|          |bottom right corners of a rectangle.       |
+----------+-------------------------------------------+


Source: **framebuffer.coffee**, `line 112 <https://github.com/myou-engine/myou-engine/blob/374be28bef3948ec6315c5284e494973e1e8341b/engine/framebuffer.coffee#L112>`_


destroy()
^^^^^^^^^

Destroys the framebuffer.

Source: **framebuffer.coffee**, `line 130 <https://github.com/myou-engine/myou-engine/blob/374be28bef3948ec6315c5284e494973e1e8341b/engine/framebuffer.coffee#L130>`_


==========================================
Class: MainFramebuffer extends FrameBuffer
==========================================

The main framebuffer.

-----------
Constructor
-----------

::

  new MainFramebuffer (@context)
