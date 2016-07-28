/**
 * Viewer startup
 */
requirejs.config({
    "baseUrl": "/js",
    "paths": {
        "app": "app",
        "lib": "libs",
        "config": "app/viewer/config",
        "api": "app/viewer/api",
        "dispatcher": "app/viewer/dispatcher",
        "model": "app/models",
        "controller": "app/viewer/controllers",
        "view": "app/viewer/views",
        "jquery": "libs/jquery.min",
        "handlebars" : "libs/hbs/handlebars.min",
        "text" : "libs/hbs/text"
    },
    "hbs": {
        templateExtension: ".hbs",
        compilerPath: "libs/hbs/handlebars.min"
    },
    "shim": {
        handlebars: {
            exports: 'Handlebars'
        }
    },
    "packages": [
        {
            name: 'hbs',
            location: 'libs/hbs',
            main: 'hbs'
        }
    ]
});

// Load the main app module to start the app
requirejs([
    "app/viewer/_main"
]);
