/**
 * Viewer startup
 */
requirejs.config({
    //"baseUrl": "/js",
    "baseUrl": "http://prometeo.duesottozero.com",
    "paths": {
        "app": "js/app",
        "lib": "js/libs",
        "config": "js/app/viewer/config",
        "api": "js/app/viewer/api",
        "dispatcher": "js/app/viewer/dispatcher",
        "model": "js/app/models",
        "controller": "js/app/viewer/controllers",
        "view": "js/app/viewer/views",
        "jquery": "js/libs/jquery.min",
        "handlebars" : "js/libs/hbs/handlebars.min",
        "text" : "js/libs/hbs/text"
    },
    "hbs": {
        base: "http://prometeo.duesottozero.com",
        templateExtension: ".hbs",
        compilerPath: "js/libs/hbs/handlebars.min"
    },
    "shim": {
        handlebars: {
            exports: 'Handlebars'
        }
    },
    "packages": [
        {
            name: 'hbs',
            location: 'js/libs/hbs',
            main: 'hbs'
        }
    ]
});

// Load the main app module to start the app
requirejs([
    "app/viewer/_main"
]);
