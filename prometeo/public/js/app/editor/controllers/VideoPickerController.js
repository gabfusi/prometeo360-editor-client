"use strict";

define([
        "jquery",
        "config",
        "plupload",
        "lib/notifications",
        "api",
        "dispatcher",
        'hbs!js/app/editor/views/VideoPicker',
        'hbs!js/app/editor/views/VideoPickerList',
        "controller/MovieController",
        "controller/TimelineElementController",
        "controller/TimelineController"
    ],

    function($, config, plupload, notification, api, dispatcher, VideoPickerTpl, VideoPickerListTpl,
             MovieController, TimelineElementController, TimelineController) {

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
                            for(var j = 0; j < data[i].value.thumbnails.length; j++) {
                                data[i].value.thumbnails[j] = config.api.getVideoScreenShot + data[i].value.thumbnails[j];
                            }
                            videos[videos.length] = data[i].value;
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
             */
            initUploader: function() {

                var self = this,
                    uploader,
                    $browseBtn = $('#browse_files'); // inside video-picker

                if(this.uploader) {
                    this.uploader.destroy();
                }

                uploader = new plupload.Uploader({
                    runtimes : "html5,flash,silverlight,html4",
                    browse_button : $browseBtn[0],
                    url : config.api.uploadVideo,
                    unique_names : false,
                    multi_selection: false,
                    filters : {
                        min_file_size: "4kb",
                        max_file_size : '80mb',
                        mime_types: [
                            {title : "File video", extensions : "mp4,mpeg,mov,3gp,avi"}
                        ]
                    },

                    flash_swf_url : '/js/libs/plupload/Moxie.swf',
                    silverlight_xap_url : '/js/libs/plupload/Moxie.xap'
                });

                uploader.init();

                // automatic upload
                uploader.bind('FilesAdded', function(up, files) {
                    self.updateProgressBar(0);
                    self.showLoading();
                    uploader.start();
                });

                uploader.bind('UploadProgress', function(up, file) {
                    self.updateProgressBar(file.percent);
                });

                /**
                 * On file uploaded
                 */
                uploader.bind('FileUploaded', function(up, file, info) {

                    var response = JSON.parse(info.response),
                        filename = response.filename,
                        duration = response.duration;

                    if(info.status !== 200) {
                        console.log('Upload Error', info);
                        return self.handleUploadError(info.response);
                    }

                    self.chooseFile(filename, duration);
                });

                uploader.bind('Error', function(up, err) {
                    console.log('Upload Error', err);
                    self.handleUploadError(err.message);
                    self.hideLoading();
                });

                this.uploader = uploader;

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