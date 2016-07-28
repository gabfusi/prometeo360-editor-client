/**
 * App startup
 */
requirejs.config({
    "baseUrl": "/js",
    "paths": {
        "app": "app",
        "lib": "libs",
        "config": "app/editor/config",
        "router": "app/editor/router",
        "api": "app/editor/api",
        "dispatcher": "app/editor/dispatcher",
        //"socket": "app/editor/socket",
        "model": "app/models",
        "controller": "app/editor/controllers",
        "view": "app/editor/views",
        "navigo": "libs/navigo",
        "bootstrap" : "libs/bootstrap.min",
        "jquery": "libs/jquery.min",
        "jqueryui" : "libs/jquery-ui/ui",
        "pnotify" : "libs/pnotify/pnotify.custom.min",
        "handlebars" : "libs/hbs/handlebars.min",
        "text" : "libs/hbs/text",
        "plupload": "libs/plupload/plupload.full.min",
        // "diff" : "libs/jsondiffpatch",
        "colorpicker" : "libs/colorpicker/minicolors.min"
    },
    "hbs": {
        templateExtension: ".hbs",
        compilerPath: "libs/hbs/handlebars.min"
    },
    "shim": {
        "bootstrap" : {
            deps: ['jquery', 'navigo', 'colorpicker']
        },
        handlebars: {
            exports: 'Handlebars'
        },
        plupload: {
            exports: "plupload"
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
    "bootstrap",
    "app/editor/_main"
]);
