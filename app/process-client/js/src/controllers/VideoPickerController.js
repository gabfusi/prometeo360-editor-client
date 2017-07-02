"use strict";

define([
        "jquery",
        "config",
        "lib/notifications",
        "api",
        "dispatcher",
        'hbs!../../js/src/views/VideoPicker',
        'hbs!../../js/src/views/VideoPickerList'
    ],

    function($, config, notification, Api, dispatcher, VideoPickerTpl, VideoPickerListTpl) {

        // VideoPickerController
        var VideoPickerController = {

            /**
             *
             */
            init: function() {

                this.$modal = null;
                this.$progressBar = null;

                this.uploader = null;
                this.initVideoPicker();

            },

            /**
             * Init video picker
             */
            initVideoPicker : function() {

                var self = this,
                    $body = $('body'),
                    $pickerModal = $(VideoPickerTpl()),
                    $videoList = $pickerModal.find('#video_picker_list');

                this.$modal = $pickerModal;
                this.$progressBar = $pickerModal.find('#video_picker_progress');

                $body.append($pickerModal);

                // open video picker
                $body.on('click', '.open-video-browser', function() {
                    Api.getVideos();
                });

                // select existing video
                $pickerModal.on('click', '.select-video', function() {
                    var filename = $(this).data('filename'),
                        duration = $(this).data('duration');

                    self.chooseFile(filename, duration);
                });

                /**
                 * On video list retrieved
                 */
                dispatcher.on(dispatcher.apiVideoListResponse, function(e, data) {

                    var videos = [];

                    for(var i = 0; i < data.length; i++) {
                        for(var j = 0; j < data[i].thumbnails.length; j++) {
                            data[i].thumbnails[j] = config.screenshotsPath + '/' + data[i].thumbnails[j];
                        }
                        videos[videos.length] = data[i];
                    }

                    var html = VideoPickerListTpl(videos);
                    $videoList.html(html);
                    $pickerModal.modal('show');

                });

                /**
                 * On video uploaded
                 */
                dispatcher.on(dispatcher.apiVideoUploadResponse, function(e, data) {

                    self.updateProgressBar(100);

                    if(typeof data.error !== 'undefined') {
                        self.handleUploadError(data.error || "Video non valido o non trovato.");
                        self.hideLoading();
                        return;
                    }

                    var filename = data.filename,
                        duration = data.duration;

                    self.chooseFile(filename, duration);

                });

                // init video uploader
                this.initUploader();
            },

            /**
             * init uploader
             * @electron
             */
            initUploader: function() {

                var self = this,
                    $browseBtn = $('#browse_files'); // inside video-picker

                $browseBtn.on('click', function() {

                    var dialog = window.nodeRequire('electron').remote.dialog;
                    var files = dialog.showOpenDialog({
                        title: "Seleziona un file video",
                        properties: ['openFile'],
                        filters: [
                            {name: 'Movies', extensions: ['mkv', 'avi', 'mp4']}
                        ]
                    });

                    if(!files[0]) {
                        return;
                    }

                    self.updateProgressBar(60);
                    self.showLoading();

                    Api.uploadVideo(files[0]);

                });

            },

            /**
             *
             */
            showLoading: function() {
                this.$modal.addClass('loading');
            },

            /**
             *
             */
            hideLoading: function() {
                this.$modal.removeClass('loading');
            },

            /**
             *
             * @param percent
             */
            updateProgressBar : function(percent) {
                if(percent == 100) {
                    // 100% means that video is uploaded but not converted yet
                    this.$progressBar.text('Converto e comprimo il video...')[0].style.width = percent + '%';
                } else {
                    this.$progressBar.text(percent + '%')[0].style.width = percent + '%';
                }
            },

            /**
             *
             * @param filename
             * @param duration
             */
            chooseFile: function(filename, duration) {
                dispatcher.trigger(dispatcher.videoUploaded, filename, duration);
                this.hideLoading();
                this.$modal.modal('hide');
            },

            /**
             *
             * @param msg
             */
            handleUploadError: function(msg) {
                notification.error('Errore durante il caricamento del video', msg)
            }

        };


        return VideoPickerController;

    });