Texture
=======

==============
Class: Texture
==============

-----------
constructor
-----------

.. highlight::coffeescript

::

  new Texture (@context, tex_data)

+----------+------------+------------------------------+
|Argument  |Type        |Description                   |
+==========+============+==============================+
|context   |Myou        |The myou object               |
+----------+------------+------------------------------+
|tex_data  |List        |A list containing texture data|
+----------+------------+------------------------------+

    Source: **texture.coffee**, `line 20 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L20>`_

-------
Methods
-------

load
^^^^
Loads the texture.
Returns a promise.

    Source: **texture.coffee**, `line 47 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L47>`_

restore
^^^^^^^
To be used after a context is lost.

Deletes the old texture, and recreates it.

    Source: **texture.coffee**, `line 206 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L206>`_

upload
^^^^^^
Determines what type the texture is,
`generates a mipmap <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/generateMipmap>`_
(or `compressed texture image <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/compressedTexImage2D>`_),
and `binds it <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindTexture>`_.

    Source: **texture.coffee**, `line 214 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L214>`_


configure
^^^^^^^^^

Configures texture settings.

    Source: **texture.coffee**, `line 246 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L246>`_

destroy
^^^^^^^

`Deletes <https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/deleteTexture>`_
the texture from the render_manager, and sets texture members to null.

    Source: **texture.coffee**, `line 269 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L269>`_

is_power_of_two
^^^^^^^^^^^^^^^
Checks if the dimensions of the texture are a power of two and returns true or false.

    Source: **texture.coffee**, `line 283 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L283>`_

get_texture_from_path_legacy = (name, path, filter, wrap, file_size=0, context)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Legacy code to obtain textures from a path.

+-----------+-----------+------------------------------------------+
| Argument  | Type      |                Description               |
+===========+===========+==========================================+
| name      | String    | Texture name                             |
+-----------+-----------+------------------------------------------+
| path      | String    | Path to the texture                      |
+-----------+-----------+------------------------------------------+
| filter    | Filter    | Filter to apply to the texture           |
+-----------+-----------+------------------------------------------+
| wrap      | Character | C (clamp), R (repeat), or M (mirrored)   |
+-----------+-----------+------------------------------------------+
| file_size | Number    | Size of the texture file. Defaults to 0. |
+-----------+-----------+------------------------------------------+
| context   | Myou      | The myou object                          |
+-----------+-----------+------------------------------------------+

    Source: **texture.coffee**, `line 291 <https://github.com/myou-engine/myou-engine/blob/master/engine/texture.coffee#L291>`_
