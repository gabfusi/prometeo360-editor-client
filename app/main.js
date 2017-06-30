"use strict";

const electron = require('electron');
const childProcess = require('child_process');

require('electron-reload')(__dirname, {
    ignored: /node_modules|[\/\\]\.|db/
}); // watch changes


// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let serverProcess;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', waitForServerStart);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit();
});

// On app quit
app.on('quit', function() {
    serverProcess.kill('SIGINT');
});

// Logic

let serverStarted = false;

/**
 * Create the client in a new BrowserWindow
 */
function createClient() {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 800,
        icon: __dirname + '/favicon.ico'
    });
    // win.maximize();

    // Hide the menu
    mainWindow.setMenu(null);

    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:3030/admin/');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    })
}

/**
 * Create a new forked process for the server
 */
function createServer() {

    let serverStartMsg = {
        "type" : "start",
        "payload" : {
            "videosPath": app.getPath('videos') // user Videos folder on user home (cross-os)
        }
    };

    serverProcess = childProcess.fork('./process-server/start');
    serverProcess.send(serverStartMsg);

    serverProcess.on("message", (message) => {

        switch(message.type) {
            case "started":
                serverStarted = true;
                break;

        }
    });
}

/**
 * Wait until server starts
 */
function waitForServerStart() {

    let t = setInterval(() => {
        if(serverStarted) {
            clearInterval(t);
            createClient();
        }
    }, 50);

}

// start the server
createServer();

