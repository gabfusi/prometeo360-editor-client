"use strict";

const electron = require('electron');
const path = require('path');
const childProcess = require('child_process');
const Store = require('./Store');
const username = require('username');
const Uuid = require('uuid-lib');
const url = require('url');
const ipc = require("node-ipc");
const DatabaseService = require('./process-server/services/DatabaseService.js');
const vrdebug = false;

/*
require('electron-reload')(__dirname, {
    ignored: /node_modules|[\/\\]\.|db/
}); // watch changes
*/

// Module to control application life.
const app = electron.app || electron.remote.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// user Videos folder on user home (cross-os)
let userHome = path.join(app.getPath('videos'), "Prometeo360");
let videosPath = path.join(userHome, "video");
let screenshotsPath = path.join(userHome, "thumbs");
let appHome = __dirname;

// debug vr
if(vrdebug) {
    childProcess.exec('http-server ' + userHome + ' -p 8081 --cors', function(error, stdout, stderr) {
        console.log(error, stdout, stderr);
    });
    userHome = 'http://127.0.0.1:8081';
    videosPath = userHome + '/video';
    screenshotsPath = userHome + '/thumbs';
    appHome = userHome;
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let userData;
let serverStarted = false;

// On electron ready
app.on('ready', waitForServerStart);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit();
});

// On app quit
app.on('quit', function() { });

// Logic

/**
 * Create the client in a new BrowserWindow
 */
function createClient() {

    let { width, height } = userData.get('windowBounds');

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        title: "Prometeo360",
        icon: path.join(__dirname, 'assets', 'icons', 'png', '512x512.png')
    });

    // Hide the menu
    mainWindow.setMenu(null);

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname, 'process-client', 'index.html'),
        protocol:'file:'
    }));

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    mainWindow.customOptions = {
        "userId": userData.get("userId"),
        "appPath" : appHome,
        "videosPath": videosPath,
        "screenshotsPath": screenshotsPath
    };

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // Emitted on resize
    mainWindow.on('resize', () => {
        let { width, height } = mainWindow.getBounds();
        userData.set('windowBounds', { width, height });
    });
}

/**
 * creates the user
 */
function initUser() {

    userData = new Store({
        configName: 'user-data',
        defaults: {
            windowBounds: { width: 1280, height: 800 }
        }
    });

    // create if not esists
    if(!userData.get('userId')) {
        userData.set('userId', username.sync() + "_" + Uuid.raw());
    }

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

/**
 * Start a server in this process
 * @param additionalConfig
 */
function startServer(additionalConfig) {

    // setup ipc 'server'
    ipc.config.id = 'server';
    ipc.config.retry = 1500;
    ipc.config.silent = true;

    const dbPath = additionalConfig.dbPath;
    DatabaseService.setGlobalFolder(dbPath);

    // checks if everything is ok
    if(!additionalConfig.vrdebug) {
        const setup = require('./process-server/setup');
        setup.check(additionalConfig);
    }

    // setup ipc server 'routes'
    ipc.serve(
        function () {

            require("./process-server/handlers/movies")(additionalConfig);

            require("./process-server/handlers/videos")(additionalConfig);

            serverStarted = true;
        }
    );

    ipc.server.start();

}

// init user if not exists
initUser();

// start server
startServer({
    "vrdebug" : vrdebug,
    "userId": userData.get("userId"),
    "videosPath": videosPath,
    "screenshotsPath": screenshotsPath,
    "dbPath": app.getPath('userData')
});


