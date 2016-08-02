var path = require('path');

module.exports = function (grunt) {

    grunt.initConfig({

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'public',
                    mainConfigFile: './public/js/app-viewer.js',
                    optimize: 'uglify',
                    findNestedDependencies: true,
                    namespace: 'prp',
                    wrap: true,
                    name: path.join(__dirname, 'node_modules/almond/almond.js'),
                    include: ['js/app/viewer/_main'],
                    insertRequire: ['js/app/viewer/_main'],
                    out: 'public/min/player.min.js'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
};