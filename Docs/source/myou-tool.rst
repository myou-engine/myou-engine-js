Myou-tool
=========
..
  Myou-tool is a command line utility to be used while operating with Myou.


  init: Generate basic boilerplate of a project (something MUCH simpler than current examples).

  run: Opens the game in the preferred runtime (currently only Electron).

  electron: Opens the game in Electron.

  serve: Runs a server with proper cache control that also runs webpack --watch (should make run-server.js obsolete).

  install-addon: Downloads and installs myou exporter for Blender. Updates the add-on if it's already installed.

  help [topic]: Opens the documentation and optionally searches for a topic, such a function name.

=====
Usage
=====
.. code-block:: shell

  myou-tool <command> [options]

========
Commands
========

----------
  Default
----------

    Outputs usage instructions and a list of commands.

------
  init
------

    Generates a boilerplate of a project, ie. helps you get started with a barebones instance.

-----
  run
-----

    Runs your project in the prefered runtime (currently only Electron)
----------
  electron
----------

    Runs your project in Electron.
-------
  serve
-------

    Creates a HTTP server for development in the current directory.
    Optionally you can pass a command and arguments, e.g:
    myou-tool serve webpack --watch
