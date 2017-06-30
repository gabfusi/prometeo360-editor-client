"use strict";

define([
        "jquery",
        "config",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "api",
        'hbs!js/src/views/List',
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
             * Loads moovies list from remote
             * @param callback
             */
            loadList : function (callback) {

                Api.getMovies(function(err, data) {

                    if(err) {
                        return callback(false);
                    }

                    for(var i = 0, l = data.length; i < l; i++ ) {
                        data[i].duration = utilities.formatTime(data[i].duration);
                        data[i].modified = utilities.timeAgo(data[i].modified);
                    }

                    callback(data);

                });
            },

            /**
             * Render movies list
             */
            renderList: function () {

                var self = this,
                    html;

                this.loadList(function(data) {

                    html = ListTpl({
                        config: config,
                        lessons: data
                    });

                    self.$list.html(html);
                    self.router.refresh();

                });

            },


            deleteMovie: function(movie_id) {

                var self = this;

                Api.deleteMovie(movie_id, function(err, data) {

                    if(err) {
                        notification.error("Errore", "Il filmato non è stato eliminato, riprova.");
                        return;
                    }

                    notification.success("Filmato eliminato");
                    self.renderList();
                    console.log(err, data);

                });

            }

        };


        return ListController;

    });