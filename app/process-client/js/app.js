/**
 * App startup
 */
requirejs.config({
    "baseUrl": "",
    "paths": {
        "app": "js/src",
        "lib": "js/libs",
        "config": "js/src/config",
        "router": "js/src/router",
        "api": "js/src/api",
        "dispatcher": "js/src/dispatcher",

        "model": "js/src/models",
        "view": "js/src/views",
        "controller": "js/src/controllers",

        "navigo": "js/libs/navigo",
        "bootstrap" : "js/libs/bootstrap.min",
        "jquery": "js/libs/jquery.min",
        "jqueryui" : "js/libs/jquery-ui/ui",
        "pnotify" : "js/libs/pnotify/pnotify.custom.min",
        "handlebars" : "js/libs/hbs/handlebars.min",
        "text" : "js/libs/hbs/text",
        // "plupload": "js/libs/plupload/plupload.full.min",
        "colorpicker" : "js/libs/colorpicker/minicolors.min"
    },
    "hbs": {
        base: ".",
        templateExtension: ".hbs",
        compilerPath: "js/libs/hbs/handlebars.min"
    },
    "shim": {
        "bootstrap" : {
            deps: ['jquery', 'navigo', 'colorpicker']
        },
        handlebars: {
            exports: 'Handlebars'
        }/*,
        plupload: {
            exports: "plupload"
        }*/
    },
    "packages": [
        {
            name: 'hbs',
            location: 'js/libs/hbs',
            main: 'hbs'
        }
    ]
});

/**
 * To create the dependencies graph
 * output can be used here: http://yuml.me/diagram/scruffy/class/draw
 * @param context
 * @param map
 * @param depMaps
 */
requirejs.onResourceLoad = function (context, map, depMaps) {
    if (!window.rtree) {
        window.rtree = {
            tree: {},
            map: function() {
                for (var key in this.tree) {
                    if (this.tree.hasOwnProperty(key)) {
                        var val = this.tree[key];
                        for (var i =0; i < val.deps.length; ++i) {
                            var dep = val.deps[i];
                            val.map[dep] = this.tree[dep];
                        }
                    }
                }
            },
            toUml: function() {
                var uml = [];

                for (var key in this.tree) {
                    if (this.tree.hasOwnProperty(key)) {
                        var val = this.tree[key];
                        for (var i = 0; i < val.deps.length; ++i) {
                            uml.push("[" + key + "]->[" + val.deps[i] + "]");
                        }
                    }
                }

                return uml.join("\n");
            }
        };
    }

    var tree = window.rtree.tree;

    function Node() {
        this.deps = [];
        this.map = {};
    }

    if (!tree[map.name]) {
        tree[map.name] = new Node();
    }

    // For a full dependency tree
    if (depMaps) {
        for (var i = 0; i < depMaps.length; ++i) {
            tree[map.name].deps.push(depMaps[i].name);
        }
    }

// For a simple dependency tree

//    if (map.parentMap && map.parentMap.name) {
//        if (!tree[map.parentMap.name]) {
//            tree[map.parentMap.name] = new Node();
//        }
//
//        if (map.parentMap.name !== map.name) {
//            tree[map.parentMap.name].deps.push(map.name);
//        }
//    }

};



// Load the main app module to start the app
requirejs([
    "bootstrap",
    "js/src/_main"
]);
