"use strict";

define([
        "jquery",
        "config",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "api",
        'hbs!../../js/src/views/List',
        'hbs'
    ],

    function ($, config, dispatcher, utilities, notification, Api, ListTpl) {

        var loaded = false;

        /**
         * Movies List Controller
         * @constructor
         */
        var ListController = {

            router: null,
            $list: $('#movies_list'),

            init: function (router) {

                this.router = router;

                if (loaded) return;

                loaded = true;

                // init listeners
                this.initListeners();

            },

            /**
             * Initialize listeners
             */
            initListeners: function () {

                var self = this;

                this.$list.on('click', '.delete-movie', function(e) {
                    e.preventDefault();
                    var movie_id = $(this).data('id');
                    self.deleteMovie(movie_id);
                });

                /**
                 * On movie list response
                 */
                dispatcher.on(dispatcher.apiMovieListResponse, function(e, data) {

                    console.log(e, data);

                    for(var i = 0, l = data.length; i < l; i++ ) {
                        data[i].duration = utilities.formatTime(data[i].duration);
                        data[i].modified = utilities.timeAgo(data[i].modified);
                    }

                    var html = ListTpl({
                        config: config,
                        movies: data
                    });

                    self.$list.html(html);
                    self.router.refresh();
                });

                /**
                 * On movie deleted
                 */
                dispatcher.on(dispatcher.apiMovieDeleteResponse, function(e, data) {

                    if(typeof data.error !== 'undefined') {
                        notification.error("Errore", "Il filmato non è stato eliminato, riprova.");
                        return;
                    }

                    notification.success("Filmato eliminato");
                    self.renderList();

                });

            },

            /**
             * Show movies list
             */
            show: function() {
                this.$list.removeClass('hided');
            },

            /**
             * Hide movies list
             */
            hide: function() {
                this.$list.addClass('hided');
            },


            /**
             * Render movies list
             */
            renderList: function () {
                Api.getMovies();
            },


            deleteMovie: function(movie_id) {
                Api.deleteMovie(movie_id);
            }

        };


        return ListController;

    });