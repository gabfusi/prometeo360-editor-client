var path = require('path');

module.exports = function (grunt) {

    var target = grunt.option('target') || false;

    grunt.initConfig({

        requirejs: {

            editor: {
                options: {
                    baseUrl: 'public',
                    mainConfigFile: './public/js/app-editor.js',
                    optimize: 'uglify',
                    findNestedDependencies: true,
                    preserveLicenseComments: false,
                    namespace: 'pre',
                    wrap: true,
                    name: path.join(__dirname, 'node_modules/almond/almond.js'),
                    include: ['js/app/editor/_main'],
                    insertRequire: ['js/app/editor/_main'],
                    out: 'public/min/editor.min.js'
                }
            },

            player: {
                options: {
                    baseUrl: 'public',
                    mainConfigFile: './public/js/app-viewer.js',
                    optimize: 'uglify',
                    findNestedDependencies: true,
                    preserveLicenseComments: false,
                    namespace: 'prp',
                    wrap: true,
                    name: path.join(__dirname, 'node_modules/almond/almond.js'),
                    include: ['js/app/viewer/_main'],
                    insertRequire: ['js/app/viewer/_main'],
                    out: 'public/min/player.min.js'
                }
            }

        },

        concat: {
            options: {
                stripBanners: true,
                banner: '/*! Prometeo - @ Gabriele Fusi - http://gabrielefusi.com - Last build: <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            editor: {
                src: ['public/min/editor.min.js'],
                dest: 'public/min/editor.min.js'
            },
            player: {
                src: ['public/min/player.min.js'],
                dest: 'public/min/player.min.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-concat');

    switch(target) {

        case 'editor':
        case 'player':
            grunt.registerTask("build", [
                "requirejs:" + target,
                "concat:" + target
            ]);
            break;

        case 'all' :
            grunt.registerTask("build", [
                "requirejs:editor",
                "concat:editor",
                "requirejs:player",
                "concat:player"
            ]);
            break;

        default:
            console.log('Prometeo builder');
            console.log('Usage:');
            console.log('Build Editor: grunt build --target=editor');
            console.log('Build Player: grunt build --target=player');
            console.log('Build Both: grunt build --target=all');
            console.log('');

    }


};