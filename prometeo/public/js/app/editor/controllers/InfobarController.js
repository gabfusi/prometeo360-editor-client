"use strict";

define([
        "config",
        "jquery",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "controller/MovieController",
        "controller/SceneController"
    ],

    function (config, $, dispatcher, utilities, notification, MovieController, SceneController) {

        var getEmbedCode = function(movie_id) {
            return '<div class="prometeo-player" data-width="100%" data-id="' + movie_id + '"></div>' +
                   '<script async defer src="' + config.embedJsUrl + '"></script>';
        };

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

                dispatcher.on(dispatcher.movieLoaded, function() {
                    var movieModel = MovieController.getModel(),
                        movie_name = movieModel.getName(),
                        movie_published = movieModel.isPublished();

                    self.$movieName.val(movie_name);
                    self.$moviePublishedBtn.show();
                    self.setMoviePublished(movie_published);

                    SceneController.init(MovieController.getModel());
                    self.renderScenes();
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

                this.$movieEmbedBtn.on('click', function() {

                    var movie_id = MovieController.getModel().getId();

                    notification.popup("Codice per incorporare il filmato",
                        '<p>Utilizza questo codice per incorporare il filmato sul tuo sito web.<br>' +
                        'Puoi specificare la larghezza del player attraverso l\'attributo <code>data-width</code>.<br>' +
                        'Ricorda che puoi incorporare un solo filmato per pagina web.</p>' +
                        '<textarea class="form-control" rows="8" readonly onclick="this.focus();this.select();">' +
                        getEmbedCode(movie_id) + '</textarea>');

                });

                // video preview
                this.$moviePlayBtn.on('click', function() {

                    var movie_id = MovieController.getModel().getId(),
                        $overlay =
                                    $('<div class="movie-preview">' +
                                      '<div class="va-wrap">' +
                                        '<div class="va-middle">' +
                                        '<div class="preview-box">' +
                                            '<div class="close-preview"><i class="fi-x"></i></div>' +
                                            '<iframe src="/player/' + movie_id + '" scrolling="no" allowfullscreen="no"></iframe>' +
                                        '</div>' +
                                        '</div>' +
                                      '</div>' +
                                      '</div>');

                    $overlay.on('click', '.close-preview', function() {
                        $overlay.fadeOut(300, function(){
                            $overlay.remove();
                        })
                    }).appendTo('body');

                });

                // scene

                this.$sceneList.on('change', function(e) {
                    var scene_id = $(this).val();
                    var scene = MovieController.getModel().getScene(scene_id);
                    dispatcher.trigger(dispatcher.sceneChange, scene);
                    self.selectScene();
                });

                this.$addSceneBtn.on('click', function() {
                    SceneController.create();
                });

                this.$editSceneBtn.on('click', function() {
                    SceneController.edit(MovieController.getCurrentScene());
                });

                this.$removeSceneBtn.on('click', function() {
                    SceneController.delete(MovieController.getCurrentScene());
                });

                dispatcher.on(dispatcher.sceneLoaded, function() {
                    self.renderScenes();
                });
                dispatcher.on(dispatcher.sceneAdded, function() {
                    self.renderScenes();
                });
                dispatcher.on(dispatcher.sceneEdited, function() {
                    self.renderScenes();
                });
                dispatcher.on(dispatcher.sceneRemoved, function() {
                    self.renderScenes();
                });

            },

            renderScenes: function() {
                var scenes = MovieController.getModel().getScenes();
                var currentSceneId = MovieController.getCurrentScene().getId();
                var options = '';

                for(var i = 0; i < scenes.length; i++) {
                    options += '<option value="' + scenes[i].getId() + '"' + (currentSceneId === scenes[i].getId() ? ' selected' : '') + '>'
                        + scenes[i].getName() + '</option>';
                }

                this.$sceneList.html(options);

            },

            selectScene: function() {
                var currentSceneId = MovieController.getCurrentScene().getId();
                this.$sceneList.find(':selected').prop('selected', false);
                this.$sceneList.find('[value="' + currentSceneId + '"]').prop('selected', true);
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

                    this.$movieEmbedBtn.add(this.$moviePlayBtn).show();

                    this.$moviePublishedBtn
                        .removeClass('btn-primary').addClass('btn-default')
                        .text('Nascondi')
                        .attr("aria-label", "Il filmato ora è pubblicato e sarà visibile a chiunque, fai click per nasconderlo.");

                } else {

                    this.$movieEmbedBtn.add(this.$moviePlayBtn).hide();

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