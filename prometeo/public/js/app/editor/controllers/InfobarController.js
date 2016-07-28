"use strict";

define([
        "jquery",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "controller/MovieController"
    ],

    function ($, dispatcher, utilities, notification, MovieController) {

        // Inforbar Controller
        var InforbarController = {

            /**
             * Initialize inforbar listeners
             * @param $inforbarElement
             */
            init: function ($inforbarElement) {
                this.$inforbar = $inforbarElement;
                this.$movieForm = this.$inforbar.find('#movie_form');
                this.$movieName = this.$inforbar.find('#movie_name');
                this.$movieSaveStatus = this.$inforbar.find('#movie_save_status');
                this.$moviePublishedBtn = this.$inforbar.find('#movie_publish');
                this.initListeners();
            },

            /**
             * Binds event listeners
             */
            initListeners: function () {
                var self = this;

                this.$moviePublishedBtn.hide();

                dispatcher.on(dispatcher.movieLoaded, function() {
                    var movieModel = MovieController.getModel(),
                        movie_name = movieModel.getName(),
                        movie_published = movieModel.isPublished();

                    self.$movieName.val(movie_name);
                    self.$moviePublishedBtn.show();
                    self.setMoviePublished(movie_published);

                });

                dispatcher.on(dispatcher.movieUnloaded, function() {
                    self.$moviePublishedBtn.hide();
                    self.$movieName.val('');
                    self.setMoviePublished(false);
                });

                dispatcher.on(dispatcher.movieStartSave, function() {
                    self.updateSaveStatus(dispatcher.status.saving);
                });

                dispatcher.on(dispatcher.movieSaved, function() {
                    self.updateSaveStatus(dispatcher.status.saved);
                });

                dispatcher.on(dispatcher.movieFirstSave, function() {
                    self.$moviePublishedBtn.show();
                    self.setMoviePublished(false);
                });

                this.$movieForm.on('submit', function(e) {
                    e.preventDefault();
                    self.editMovieName($(this).val());
                });

                this.$movieName.on('change', function () {
                    self.editMovieName($(this).val());
                });

                this.$moviePublishedBtn.on('click', function () {

                    var isPublished = !MovieController.getModel().isPublished(),
                        verb = isPublished ? "pubblicare" : "nascondere";

                    notification.confirm(
                        "Pubblicazione Filmato",
                        "Sei sicuro di voler " + verb + " questo filmato?",
                        function() {
                            self.setMoviePublished(isPublished);
                            MovieController.getModel().setPublished(isPublished);
                            dispatcher.trigger(dispatcher.movieInfoEdited);
                            if(isPublished) {
                                notification.notice("Filmato pubblicato");
                            } else {
                                notification.notice("Filmato nascosto");
                            }
                        });

                });

            },

            editMovieName: function(name) {
                var movie_name = utilities.stripTags(name);

                if(movie_name !==  MovieController.getModel().getName()) {
                    MovieController.getModel().setName(movie_name);
                    dispatcher.trigger(dispatcher.movieInfoEdited);
                }
            },

            setMoviePublished: function(published) {

                if(published) {

                    this.$moviePublishedBtn
                        .removeClass('btn-primary').addClass('btn-default')
                        .text('Nascondi')
                        .attr("aria-label", "Il filmato ora è pubblicato e sarà visibile a chiunque, fai click per nasconderlo.");

                } else {

                    this.$moviePublishedBtn
                        .removeClass('btn-default').addClass('btn-primary')
                        .text('Pubblica')
                        .attr("aria-label", "Il filmato ora è nascosto, fai click per pubblicarlo.");

                }

            },

            updateSaveStatus: function(status) {

                switch(status) {

                    case dispatcher.status.saving:
                        this.$movieSaveStatus.html('<i class="fi-clock"></i> Salvataggio...');
                        break;

                    case dispatcher.status.saved:
                        this.$movieSaveStatus.html('<i class="fi-check"></i> Modifiche salvate.');
                        break;

                    default:
                        this.$movieSaveStatus.text('');
                        break;

                }
            }



        };

        return InforbarController;

    });