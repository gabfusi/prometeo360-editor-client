"use strict";

define([
        "config",
        "jquery",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "controller/MovieController",
        "controller/SceneController",
        "api"
    ],

    function (config, $, dispatcher, utilities, notification, MovieController, SceneController, Api) {

        // open new browser window
        var BrowserWindow = window.nodeRequire('electron').remote.BrowserWindow;


        function getEmbedCode (movie_id) {
            return '<iframe frameborder="0" width="640" height="360" src="' + config.remoteEmbedLink + config.userId + '/'  + movie_id + '"></iframe>';
        }

        function getRemoteLink (movie_id) {
            return config.remoteMovieLink + config.userId + '/' + movie_id;
        }

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
                this.$movieEmbedBtn = this.$inforbar.find('#movie_embed');
                this.$moviePlayBtn = this.$inforbar.find('#movie_play');
                this.$movieSyncBtn = this.$inforbar.find('#movie_sync');

                // scene
                this.$sceneList = this.$inforbar.find('#scene_list');
                this.$addSceneBtn = this.$inforbar.find('#add_scene');
                this.$editSceneBtn = this.$inforbar.find('#edit_scene');
                this.$removeSceneBtn = this.$inforbar.find('#remove_scene');

                this.initListeners();
            },

            /**
             * Binds event listeners
             */
            initListeners: function () {
                var self = this;

                this.$moviePublishedBtn.hide();

                dispatcher.on(dispatcher.movieLoaded, function () {
                    var movieModel = MovieController.getModel(),
                        movie_name = movieModel.getName(),
                        movie_published = movieModel.isPublished();

                    console.info("Movie is published? ", movieModel)
                    window.movie = movieModel;

                    self.$movieName.val(movie_name);
                    self.$moviePublishedBtn.show();
                    self.setMoviePublished(movie_published);

                    SceneController.init(MovieController.getModel());
                    self.renderScenes();
                });

                dispatcher.on(dispatcher.movieUnloaded, function () {
                    self.$moviePublishedBtn.hide();
                    self.$movieName.val('');
                    self.setMoviePublished(false);
                });

                dispatcher.on(dispatcher.movieStartSave, function () {
                    self.updateSaveStatus(dispatcher.status.saving);
                });

                dispatcher.on(dispatcher.movieSaved, function () {
                    self.updateSaveStatus(dispatcher.status.saved);
                });

                dispatcher.on(dispatcher.movieFirstSave, function () {
                    self.$moviePublishedBtn.show();
                    self.setMoviePublished(false);
                });


                // on movie published
                dispatcher.on(dispatcher.apiMoviePublishResponse, function (e, data) {

                    if (typeof data.error !== 'undefined') {
                        notification.error("Errore, potresti non essere connesso alla rete internet.");
                        return;
                    }

                    self.setMoviePublished(true);
                    MovieController.getModel().setPublished(true);
                    dispatcher.trigger(dispatcher.movieInfoEdited);
                    notification.notice("Filmato pubblicato");
                    self.$moviePublishedBtn.removeClass("disabled").prop("disabled", false);
                });

                // on movie unpublished
                dispatcher.on(dispatcher.apiMovieUnpublishResponse, function (e, data) {

                    self.setMoviePublished(false);
                    MovieController.getModel().setPublished(false);
                    dispatcher.trigger(dispatcher.movieInfoEdited);
                    notification.notice("Filmato nascosto");
                });

                // on video uploaded
                dispatcher.on(dispatcher.apiVideoUploadedRemoteResponse, function (e, data) {
                    notification.notice("Video caricato: " + data.filename);
                });



                this.$movieForm.on('submit', function (e) {
                    e.preventDefault();
                    self.editMovieName($(this).val());
                });

                this.$movieName.on('change', function () {
                    self.editMovieName($(this).val());
                });

                this.$moviePublishedBtn.on('click', function () {

                    var isPublished = MovieController.getModel().isPublished(),
                        verb = !isPublished ? "pubblicare" : "nascondere";

                    notification.confirm(
                        "Pubblicazione Filmato",
                        "Sei sicuro di voler " + verb + " questo filmato?",
                        function () {

                            if (!isPublished) {
                                self.publishMovie();
                                notification.notice("Pubblicazione iniziata...");
                                self.$moviePublishedBtn.addClass("disabled").prop("disabled", true);
                            } else {
                                self.unpublishMovie();
                            }

                        });

                });

                this.$movieSyncBtn.on('click', function () {

                    notification.confirm(
                        "Sincronizzazione filmato",
                        "Sei sicuro di voler sincronizzare le modifiche sul server remoto?",
                        function () {
                            self.publishMovie();
                            notification.notice("Sincronizzazione iniziata...");
                        });
                });

                this.$movieEmbedBtn.on('click', function () {

                    var movie_id = MovieController.getModel().getId();

                    notification.popup("Codice per incorporare il filmato",
                        '<p>Il filmato &eacute; disponibile a questo link:</p>' +
                        '<div class="form-group">' +
                        '<input class="form-control" type="text" readonly value="' + getRemoteLink(movie_id) +
                            '" onclick="this.focus();this.select();">' +
                        '</div>' +
                        '<p>Puoi utilizzare il codice qui sotto per incorporare il filmato sul tuo sito web:</p>' +
                        '<textarea class="form-control" rows="4" readonly onclick="this.focus();this.select();">' +
                        getEmbedCode(movie_id) + '</textarea>' +
                        '<p>Puoi specificare la larghezza e l\'altezza del player attraverso gli attributi ' +
                        '<code>width</code> e <code>height</code> dell\'iframe.<br>'
                    );

                });

                // video preview
                this.$moviePlayBtn.on('click', function () {

                    var previewWindow = new BrowserWindow({
                        width: 720,
                        height: 480,
                        backgroundColor: '#000000',
                        alwaysOnTop: true,
                        fullscreenable: true,
                        skipTaskbar: true,
                        title: "Prometeo360 preview"
                    });
                    previewWindow.setMenu(null);
                    previewWindow.loadURL(config.previewWindow);
                    previewWindow.webContents.on('did-finish-load', () => {
                        previewWindow.webContents.send('load', {
                            movie: MovieController.getModel().serialize(),
                            videoPath: config.videosPath
                        });
                    });

                    // Open the DevTools.
                    //previewWindow.webContents.openDevTools();

                    // Emitted when the window is closed.
                    previewWindow.on('closed', function () {
                        previewWindow = null;
                    });

                });

                // scene

                this.$sceneList.on('change', function (e) {
                    var scene_id = $(this).val();
                    var scene = MovieController.getModel().getScene(scene_id);
                    dispatcher.trigger(dispatcher.sceneChange, scene);
                    self.selectScene();
                });

                this.$addSceneBtn.on('click', function () {
                    SceneController.create();
                });

                this.$editSceneBtn.on('click', function () {
                    SceneController.edit(MovieController.getCurrentScene());
                });

                this.$removeSceneBtn.on('click', function () {
                    SceneController.delete(MovieController.getCurrentScene());
                });

                dispatcher.on(dispatcher.sceneLoaded, function () {
                    self.renderScenes();
                });
                dispatcher.on(dispatcher.sceneAdded, function () {
                    self.renderScenes();
                });
                dispatcher.on(dispatcher.sceneEdited, function () {
                    self.renderScenes();
                });
                dispatcher.on(dispatcher.sceneRemoved, function () {
                    self.renderScenes();
                });

            },

            /**
             * Fills the scene <select> list
             */
            renderScenes: function () {
                var scenes = MovieController.getModel().getScenes();
                var currentSceneId = MovieController.getCurrentScene().getId();
                var options = '';

                for (var i = 0; i < scenes.length; i++) {
                    options += '<option value="' + scenes[i].getId() + '"' + (currentSceneId === scenes[i].getId() ? ' selected' : '') + '>'
                        + scenes[i].getName() + '</option>';
                }

                this.$sceneList.html(options);

            },

            /**
             * Selects the current scene from <select> list
             */
            selectScene: function () {
                var currentSceneId = MovieController.getCurrentScene().getId();
                this.$sceneList.find(':selected').prop('selected', false);
                this.$sceneList.find('[value="' + currentSceneId + '"]').prop('selected', true);
            },

            /**
             * Rename the movie
             * @param name
             */
            editMovieName: function (name) {
                var movie_name = utilities.stripTags(name);

                if (movie_name !== MovieController.getModel().getName()) {
                    MovieController.getModel().setName(movie_name);
                    dispatcher.trigger(dispatcher.movieInfoEdited);
                }
            },

            /**
             * Flags the movie as published or not
             * @param published
             */
            setMoviePublished: function (published) {

                if (published) {

                    this.$movieEmbedBtn.add(this.$movieSyncBtn).show();


                    this.$moviePublishedBtn
                        .removeClass('btn-primary').addClass('btn-default')
                        .text('Nascondi')
                        .attr("aria-label", "Il filmato ora è pubblicato e sarà visibile a chiunque, fai click per nasconderlo.");

                } else {

                    this.$movieEmbedBtn.add(this.$movieSyncBtn).hide();

                    this.$moviePublishedBtn
                        .removeClass('btn-default').addClass('btn-primary')
                        .text('Pubblica')
                        .attr("aria-label", "Il filmato ora è nascosto, fai click per pubblicarlo.");

                }

            },

            /**
             * Publish the current movie
             */
            publishMovie: function () {
                var movie_id = MovieController.getModel().getId();
                Api.publishMovie(movie_id);
            },

            /**
             * Unpublish the current movie
             */
            unpublishMovie: function () {
                var movie_id = MovieController.getModel().getId();
                Api.unpublishMovie(movie_id);
            },

            /**
             * Notify save status
             * @param status
             */
            updateSaveStatus: function (status) {

                switch (status) {

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