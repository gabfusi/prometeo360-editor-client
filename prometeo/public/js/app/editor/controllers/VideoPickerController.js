"use strict";

define([
        "jquery",
        "config",
        "lib/notifications",
        "api",
        "dispatcher",
        'hbs!js/app/editor/views/VideoPicker',
        'hbs!js/app/editor/views/VideoPickerList'
    ],

    function($, config, notification, api, dispatcher, VideoPickerTpl, VideoPickerListTpl) {

        // VideoPickerController
        var VideoPickerController = {

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

                    self.renderVideoList($videoList, function() {
                        $pickerModal.modal('show');
                    });

                });

                // select existing video
                $pickerModal.on('click', '.select-video', function() {
                    var filename = $(this).data('filename'),
                        duration = $(this).data('duration');

                    self.chooseFile(filename, duration);
                });


                // init video uploader
                this.initUploader();
            },

            /**
             * get videos list from server
             * @param callback
             */
            getVideos: function(callback) {
                var videos = [];

                api.getVideos(function(err, data) {

                    if (!err) {
                        for(var i = 0; i < data.length; i++) {
                            for(var j = 0; j < data[i].thumbnails.length; j++) {
                                data[i].thumbnails[j] = config.api.getVideoScreenShot + data[i].thumbnails[j];
                            }
                            videos[videos.length] = data[i];
                        }
                    }

                    if(callback) callback(videos);
                });
            },

            /**
             * Render videos list
             * @param $element
             * @param callback
             */
            renderVideoList : function($element, callback) {
                var html;

                this.getVideos(function(videos) {

                    html = VideoPickerListTpl(videos);
                    $element.html(html);

                    if(callback) callback();

                });

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

                    api.uploadVideo({ tempPath: files[0] }, function(err, response) {
                        self.updateProgressBar(100);

                        if(!response) {
                            self.handleUploadError(err || "Video non valido o non trovato.");
                            self.hideLoading();
                            return;
                        }

                        var filename = response.filename,
                            duration = response.duration;

                        self.chooseFile(filename, duration);

                    });

                });

            },


            showLoading: function() {
                this.$modal.addClass('loading');
            },

            hideLoading: function() {
                this.$modal.removeClass('loading');
            },

            updateProgressBar : function(percent) {
                if(percent == 100) {
                    // 100% means that video is uploaded but not converted yet
                    this.$progressBar.text('Converto e comprimo il video...')[0].style.width = percent + '%';
                } else {
                    this.$progressBar.text(percent + '%')[0].style.width = percent + '%';
                }
            },

            chooseFile: function(filename, duration) {
                dispatcher.trigger(dispatcher.videoUploaded, filename, duration);
                this.hideLoading();
                this.$modal.modal('hide');
            },

            handleUploadError: function(msg) {
                notification.error('Errore durante il caricamento del video', msg)
            }

        };


        return VideoPickerController;

    });