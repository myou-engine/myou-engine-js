Compositor
==========

=========================
How to use the compositor
=========================
..
  Declare the following objects:
      * buffers hold a reference to input buffers or textures, and output buffers
        Each item is:
        * {buffer} or {buffer, size} if it's a Framebuffer
        * {texture, size} if it's a texture.
        size is in pixels and optional for framebuffers (defaults to framebuffer size)
      * uniforms will generate uniforms that will be pased to filters
        Note: assumes all uniforms are used in the shader
      * filters will be a dict with all filters that will be executed
        on this compositor. The order of evaluation will be inferred from
        input/output dependencies. TODO: not yet; put in required order.

  Each filter has:
      * library: auxiliary GLSL code that the code may use (in a string)
      * inputs: a list of input names, e.g: ["scene"]
        TODO: for now inputs are only buffers, it should accept also uniforms and filters
      * output: the name of a buffer, or null for chaining with another filter
      * code: the inside of a function that will be executed.
          It can use any buffer, uniform or filter using the name declared in
          their respective dict. When referencing a filter, it will use its output.
          It expects to return a vec4.
          Example taking the red channel of the scene:
          "return vec4(scene.r, 0.0, 0.0, 1.0);"

  Implicit variables and functions,
  all of them handle unused buffer borders as if they didn't exist:
      * aspect_ratio: gives the aspect ratio of the camera
      * get_FOO_from_px(x, y) and
        get_FOO_from_px(vec2) gets the value of the buffer/texture FOO
        in the x/y coordinate in pixels
      * get_FOO_from_coord(x, y) and
        get_FOO_from_coord(vec2) gets the value of the buffer/texture FOO
        in the x/y coordinate in the buffer's viewport, [-1, 1] interval
        e.g: get_FOO_from_coord(0.5, 0.5) gets the value in the middle
      * coord: current texture coordinate of viewport
        (if you want pixels, use gl_FragCoord.xy instead)
      * FOO_sampler: Sampler of buffer/texture FOO
      * FOO_size_f: Size of FOO. Multiply coord by FOO_size_f to get the actual
                    coordinate to be used with texture2D()
      * FOO_orig_px_size: Size of a pixel in FOO.
                    Multiply gl_FragCoord.xy by FOO_orig_px_size to get the actual
                    coordinate to be used with texture2D()

  Example:

      buffers = {
          "scene": {buffer: common_filter_fb, size: viewport.get_size_px()}
          "depth": {texture: common_filter_fb.depth_texture, size: viewport.get_size_px()}
          "ssao_buf": {buffer: new Framebuffer(context, size: [128, 128])}
          "screen": {buffer: viewport.dest_buffer}
      }
      uniforms = {
          "test_float": 3,
          "test_vec3": [1,2,3],
      }
      filters = {
          "invert"
              code: 'return vec4(vec3(1.0)-get_scene_from_coord(coord), 1.0);'
              inputs: ["scene"]
              output: "screen"
      }

      viewport.compositor = new Compositor(context, {buffers, uniforms, filters})
      viewport.compositor_enabled = true
  ###

  # '''
  #     Example with big buffer of size 1000 and small buffer of size 700
  #     +--------------+   FOO_size_f = vec2(0.7, 0.7);
  #     |              |   FOO_size_px = vec2(700, 700);
  #     +---------+    |   FOO_px_size = 1/vec2(700, 700);
  #     |         |    |   FOO_orig_px_size = FOO_size_f*FOO_px_size; = 1/1000
  #     |         |    |
  #     |         |    |
  #     +---------+----+
  # 0,0
  #     +--------------+   FOO_size_f = vec2(0.7, 0.7);
  #     | +---------+  |   FOO_size_px = vec2(700, 700);
  #     | |         |  |   FOO_px_size = 1/vec2(700, 700);
  #     | |         |  |   FOO_orig_px_size = FOO_size_f*FOO_px_size
  #     | |0.1,0.1  |  |   FOO_offset_f = vec2(0.1, 0.1);
  #     | +---------+  |
  #     +--------------+
  # 0,0
  # '''


=================
Class: compositor
=================

-----------
Constructor
-----------

.. code-block:: coffeescript

  new Compositor(context, {buffers, uniforms, filters})

+----------+------------+------------------------------------------+
|Argument  |Type        |Description                               |
+==========+============+==========================================+
|context   |Myou        |The myou object                           |
+----------+------------+------------------------------------------+
|options   |List        |A list of options surrounded by brackets. |
|          |            |                                          |
|          |            |+ Buffers: A list of buffers              |
|          |            |+ Filters: A list of filters              |
|          |            |+ Uniforms: A list of uniforms            |
+----------+------------+------------------------------------------+

    Source: **compositor.coffee**, `line 97 <https://github.com/myou-engine/myou-engine/blob/master/engine/compositor.coffee#L97>`_

-------
Methods
-------

assign_uniforms
^^^^^^^^^^^^^^^

Assigns values to uniforms.

    Source: **compositor.coffee**, `line 172 <https://github.com/myou-engine/myou-engine/blob/master/engine/compositor.coffee#L172>`_

compose
^^^^^^^

Binds textures, configures attributes, and assigns custom uniforms to the render_manager.

    Source: **compositor.coffee**, `line 172 <https://github.com/myou-engine/myou-engine/blob/master/engine/compositor.coffee#L172>`_

-------
Example
-------

.. code-block:: coffeescript

  buffers = {
      "scene": {buffer: common_filter_fb, size: viewport.get_size_px()}
      "depth": {texture: common_filter_fb.depth_texture, size: viewport.get_size_px()}
      "ssao_buf": {buffer: new Framebuffer(context, size: [128, 128])}
      "screen": {buffer: viewport.dest_buffer}
  }
  uniforms = {
      "test_float": 3,
      "test_vec3": [1,2,3],
  }
  filters = {
      "invert"
          code: 'return vec4(vec3(1.0)-get_scene_from_coord(coord), 1.0);'
          inputs: ["scene"]
          output: "screen"
  }

  viewport.compositor = new Compositor(context, {buffers, uniforms, filters}) # Compositor constructor is called here
  viewport.compositor_enabled = true
