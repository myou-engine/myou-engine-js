var fs=require('fs'), path=require('path')
var isElectron = /^electron/.test(process.execPath.split(path.sep).pop())

// Run electron code if we're in electron, spawn it otherwise.

if(isElectron){
    var app = require('app');  // Module to control application life.
    var BrowserWindow = require('browser-window');  // Module to create native browser window.

    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is GCed.
    var mainWindow = null;

    // Quit when all windows are closed.
    app.on('window-all-closed', function() {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform != 'darwin') {
            app.quit();
        }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    app.on('ready', function() {
        // Create the browser window.
        mainWindow = new BrowserWindow({width: 800, height: 600});

        // and load the index.html of the app.
        mainWindow.loadURL('file://' + __dirname + '/static_files/myou.html');

        // Open the devtools.
        // mainWindow.openDevTools();

        // Emitted when the window is closed.
        mainWindow.on('closed', function() {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null;
        });
    });
}else{
    var electron = require('electron-prebuilt')
    var proc = require('child_process')

    // spawn electron
    var child = proc.spawn(electron, [__filename])
}
