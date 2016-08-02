"use strict";

/**
 * App startup
 */
define([
        "jquery",
        "router",
        "controller/ListController",
        "controller/EditorController"
    ],
    function ($, router, ListController, EditorController) {

        /**
         * Loads movies list
         */
        function loadList() {

            EditorController.hide();
            EditorController.unloadMovie();

            ListController.init(router);
            ListController.show();
            ListController.renderList();

            $(document.body).removeClass('status-editor').addClass('status-movies-list');

        }

        /**
         * Loads movie editor
         * @param params
         */
        function loadEditor(params) {

            ListController.hide();

            EditorController.init(router);
            EditorController.show();

            if (params.id === 'new') {
                EditorController.loadMovie();
            } else {
                EditorController.loadMovie(params.id);
            }

            $(document.body).removeClass('status-movies-list').addClass('status-editor');

        }

        // on document ready
        $(document).ready(function () {

            var $preloader =  $('#main_preloader');

            router.init('/admin');

            router.setRoutes({
                '/editor/:id': loadEditor,
                '/': loadList,
                '*' : function() {
                    router.navigateUri('/');
                }
            });

            // remove global spinner
            $preloader.addClass('hided');
            var t = setTimeout(function() {
                $preloader[0].style.display = 'none';
                clearTimeout(t); t = null;
            }, 218);

        });
    });
