"use strict";

define([
        "jquery",
        "config",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "api",
        "controller/MovieController",
        "controller/SceneController",
        "controller/ToolbarController",
        "controller/EditbarController",
        "controller/TimelineController",
        "controller/InfobarController",
        "controller/VideoPickerController",
        'hbs!js/app/editor/views/Editor',
        'hbs'
    ],

    function ($, config, dispatcher, utilities, notification, Api,
              MovieController, SceneController, ToolbarController, EditbarController, TimelineController, InfobarController, VideoPickerController, EditorTpl) {

        var loaded = false;

        /**
         * Editor Controller
         * @constructor
         */
        var EditorController = {

            isMovieLoaded: false,
            movieRevision: null,
            router: null,
            $editor: $('#editor'),

            init: function (router) {

                if (loaded) return;

                loaded = true;

                // init common editor UI
                this.initUI();

                this.$movie = $('#movie');
                this.$toolbar = this.$editor.find('.toolbar');
                this.$editbar = this.$editor.find('.panel.editbar');
                this.$timeline = this.$editor.find('.panel.timeline');
                this.$infobar = this.$editor.find('.infobar');
                this.$editorInner = this.$editor.find('.editor-inner>.inner');
                this.$movieWrapper = this.$editor.find('.movie-wrapper');
                this.$movieContainer = this.$editor.find('.movie-container');
                this.timeline = null;
                this.router = router;


                // init listeners
                this.initListeners();

                // init movie editor
                MovieController.init(this.$movie);

                // init toolbar
                ToolbarController.init(this.$toolbar);

                // init timeline
                TimelineController.init(this.$timeline);

                // init Editbar
                EditbarController.init(this.$editbar);

                // init infobar
                InfobarController.init(this.$infobar);

                // init Video Picker
                VideoPickerController.init();

            },

            /**
             * Render Editor
             */
            initUI: function () {

                var html = EditorTpl({
                    config: config
                });

                this.$editor.html(html);
            },

            /**
             * Initialize listeners to movie updates
             */
            initListeners: function () {
                var self = this;

                // toggle toolbar
                this.$editor.on('click', '.toolbar > .toggler', function () {
                    ToolbarController.togglePanel();
                });

                // close panels handler
                this.$movieContainer.on('click', function () {
                    ToolbarController.hidePanel();
                    EditbarController.hidePanel();
                    dispatcher.trigger(dispatcher.elementsDeselected);
                });

                // on resize (debounced)
                $(window).on('resize', utilities.debounce(function () {
                    MovieController.onResize();
                    //self.onResize();
                }, 50));

                //self.onResize();

                // Initialize listeners to movie updates
                // proxies all movie & elements change events to movieEdited event

                dispatcher.on(dispatcher.movieInfoEdited, function () {
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                dispatcher.on(dispatcher.elementAdded, function () {
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                dispatcher.on(dispatcher.elementUpdated, function () {
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                dispatcher.on(dispatcher.elementResized, function () {
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                dispatcher.on(dispatcher.elementDragged, function () {
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                dispatcher.on(dispatcher.elementUpdatedFrame, function () {
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                dispatcher.on(dispatcher.elementRemoved, function () {
                    dispatcher.trigger(dispatcher.movieEdited);
                });

                // debounce saving

                dispatcher.on(dispatcher.movieEdited, utilities.debounce(this.saveMovie, config.saveDebounceTime));

            },

            /**
             * Show editor
             */
            show: function() {
                this.$editor.removeClass('hided');
                MovieController.onResize();
            },

            /**
             * Hide editor
             */
            hide: function() {
                this.$editor.addClass('hided');
            },

            /**
             * Loads a movie or init a new one
             * @param movie_id
             */
            loadMovie: function (movie_id) {
                var self = this;

                if (this.isMovieLoaded) {
                    this.unloadMovie();
                }

                if (!movie_id) {

                    MovieController.create();
                    this.isMovieLoaded = true;

                } else {

                    dispatcher.trigger(dispatcher.sceneLoadingStart);

                    Api.getMovie(movie_id, function (err, data) {

                        if (err) {
                            dispatcher.trigger(dispatcher.sceneLoadingError); // TODO gestisci UI
                            notification.error("Filmato non trovato", 'Non riesco a caricare il filmato, potrebbe essere stato cancellato o non essere mai esistito.');
                            return;
                        }

                        MovieController.create(data);
                        self.isMovieLoaded = true;
                        self.movieRevision = data._rev;
                        dispatcher.trigger(dispatcher.sceneLoaded, data);

                    });

                }

            },

            /**
             * Unloads current movie
             */
            unloadMovie: function () {

                if(!this.isMovieLoaded)
                    return;

                EditbarController.unloadElement();
                EditbarController.hidePanel();
                MovieController.unload();
                TimelineController.unload();

                dispatcher.trigger(dispatcher.movieUnloaded);
            },

            /**
             * Save current movie
             */
            saveMovie: function () {

                var self = EditorController,
                    movieModel = MovieController.getModel(),
                    movie_id = movieModel.getId(),
                    movieName = movieModel.getName(),
                    movieObject;

                if (!movieName.length) {
                    movieModel.setName("Filmato senza titolo");
                }

                movieObject = movieModel.serialize();

                this.isSaving = true;
                dispatcher.trigger(dispatcher.movieStartSave);

                if (!movie_id) {

                    // add new movie
                    Api.addMovie(movieObject, function (err, movie_id) {

                        if (err) {
                            notification.error("Errore", "Il filmato non è stato salvato");
                            console.error(err);
                            return;
                        }

                        MovieController.getModel().setId(movie_id);

                        // replace url
                        self.router.replaceUri('/editor/' + movie_id);

                        dispatcher.trigger(dispatcher.movieFirstSave);
                        dispatcher.trigger(dispatcher.movieSaved);

                    });

                } else {

                    // update movie
                    Api.updateMovie(movie_id, movieObject, function (err, movie_id) {

                        if (err) {
                            notification.error("Errore", "Il filmato non è stato salvato");
                            console.error(err);
                            return;
                        }

                        dispatcher.trigger(dispatcher.movieSaved);

                    });

                }


            },

            /**
             * On window resize
             */
            onResize: function() {

                return;

                var editorHeight = this.$editorInner.height(),
                    movieHeight = editorHeight - timelineHeight;

                // resize timeline according to window height

                if(editorHeight < 300) {

                } else {

                }

                this.$movieWrapper.height(movieHeight);

            }

        };

        return EditorController;

    });