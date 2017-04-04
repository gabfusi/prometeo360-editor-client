"use strict";

define([
        "jquery",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "controller/MovieController",
        "controller/TimelineElementController",
        "controller/QuestionAreaController",
        "controller/TimelineController",
        "controller/VideoPickerController",
        'hbs!js/app/editor/views/properties/Video',
        'hbs!js/app/editor/views/properties/Video360',
        'hbs!js/app/editor/views/properties/JumpArea',
        'hbs!js/app/editor/views/properties/LinkArea',
        'hbs!js/app/editor/views/properties/QuestionArea',
        'hbs!js/app/editor/views/properties/TextArea',

        'hbs!partial:js/app/editor/views/properties/TimelineElement',
        'hbs!partial:js/app/editor/views/properties/Area',
        'hbs',
        'jqueryui/slider',
        'jqueryui/draggable',
        'jqueryui/sortable'
    ],

    function($, dispatcher, utilities, notification,
             MovieController, TimelineElementController, QuestionAreaController, TimelineController, VideoPickerController,
             VideoTpl, Video360Tpl, JumpAreaTpl, LinkAreaTpl, QuestionAreaTpl, TextAreaTpl) {

    // Editbar Controller
    var EditbarController = {

        /**
         * Initialize editbar listeners
         * @param $editbarElement
         */
        init: function($editbarElement) {
            var self = this;

            this.$editbar = $editbarElement;
            this.$elementTitle = $editbarElement.find('#area_title');
            this.$propertiesWrap = $editbarElement.find('.properties-wrap');
            this.currentElementModel = null;
            this.$fields = null;
            this.$currentEl = null;
            this.initListeners();
            this.$editbar.draggable();
        },

        /**
         * Binds event listeners
         */
        initListeners: function() {
            var self = this;

            // listeners

            // on TimelineElement selected
            dispatcher.on(dispatcher.elementSelected, function(e, elementModel) {
                self.showPanel();
                self.loadElement(elementModel);
            });

            // on TimelineElements deselected
            dispatcher.on(dispatcher.elementsDeselected, function() {
                self.hidePanel();
                self.unloadElement();
            });

            // on TimelineElement resized (in movie area)
            dispatcher.on(dispatcher.elementResized, function(e, elementModel) {
                if(self.isCurrentElement(elementModel)) {
                    // if element resized is current element displayed in editbar
                    self.$fields.width.val(elementModel.getWidth());
                    self.$fields.height.val(elementModel.getHeight());
                }

            });

            // on TimelineElement dragged (in movie area)
            dispatcher.on(dispatcher.elementDragged, function(e, elementModel) {
                if(self.isCurrentElement(elementModel)) {
                    // if element dragged is current element displayed in editbar
                    self.$fields.x.val(elementModel.getX());
                    self.$fields.y.val(elementModel.getY());
                }
            });

            // on TimelineElement dragged (in timeline area)
            dispatcher.on(dispatcher.elementUpdatedFrame, function(e, elementModel, frame) {
                elementModel.setFrame(frame);
                if(self.isCurrentElement(elementModel)) {
                    // if element dragged is current element displayed in editbar
                    self.$fields.frame.val(elementModel.getHumanReadableFrame());
                }
            });


            // on video uploaded
            dispatcher.on(dispatcher.videoUploaded, function(e, filename, duration) {
                // self.currentElementModel is the current element
                if(self.currentElementModel.getType() === 'Video' || self.currentElementModel.getType() === 'Video360') {
                    self.updateElement(self.currentElementModel, 'filename', filename);
                    self.updateElement(self.currentElementModel, 'duration', duration);
                    self.loadElement(self.currentElementModel, true); // force panel refresh
                }
            });

            // update on change
            this.$propertiesWrap.on('change', '.change-listener', function(e) {

                var property = $(this).prop('name'),
                    value = $(this).val();

                if($(this).hasClass('bool')) {
                    value = value > 0; // cast to boolean value
                }

                self.updateElement(self.currentElementModel, property, value, $(this));
            });

            // update on type (live)
            this.$propertiesWrap.on('keyup', '.live-listener', function(e) {

                var property = $(this).prop('name'),
                    value = $(this).val();

                self.updateElement(self.currentElementModel, property, value, $(this));
            });

            // close editbar panel
            this.$editbar.on('click', '.close-panel', function() {
                dispatcher.trigger(dispatcher.elementsDeselected);
                self.hidePanel();
            });

            // remove area
            this.$editbar.on('click', '.remove-area', function() {
                if(self.currentElementModel) {

                    notification.confirm(
                        "Rimozione Elemento",
                        "Sei sicuro di voler rimuovere questo elemento?",
                        function() {
                            MovieController.removeElement(self.currentElementModel);
                            dispatcher.trigger(dispatcher.elementsDeselected);
                        });
                }
            });

            // delete element if canc or backspace are pressed
            $(document).on('keydown', function(e){

                if(
                    (e.which == 46 || e.which == 8) &&  // se vengono premuti canc o backspace
                    !$(e.target).is(':input')        &&  // e l'evento non proviene da un elemento del form
                    self.currentElementModel            // e l'elemento è selezionato
                ) {
                    e.preventDefault();
                    MovieController.removeElement(self.currentElementModel);
                    dispatcher.trigger(dispatcher.elementsDeselected);
                    return false;
                }
            });

        },

        /**
         * Show editbar panel
         */
        showPanel: function(){
            this.$editbar.addClass('shown');
        },

        /**
         * Hide editbar panel
         */
        hidePanel: function(){
            this.$editbar.removeClass('shown');
        },

        /**
         * Toggle editbar panel visibility
         */
        togglePanel: function(){
            this.$editbar.toggleClass('shown');
        },


        /**
         * Updates model element
         * @param elementModel
         * @param property
         * @param value
         * @param $field
         */
        updateElement: function(elementModel, property, value, $field) {

            switch(property) {

                case 'x' :          elementModel.setX(value); break;
                case 'y' :          elementModel.setY(value); break;
                case 'width' :      elementModel.setWidth(value); break;
                case 'height' :     elementModel.setHeight(value); break;
                case 'frame' :      elementModel.setFrame(value); break;
                case 'duration' :   elementModel.setDuration(value); break;
                case 'background' : elementModel.setBackground(value); break;
                case 'text_color' : elementModel.setTextColor(value); break;
                case 'text_size' :  elementModel.setTextSize(value); break;
                case 'pause_movie': elementModel.setPauseMovie(value); break;
                case 'zindex':      elementModel.setZindex(value); break;

                // video
                case 'filename': elementModel.setFilename(value); break;

                // textarea, linkarea, etc
                case 'text':
                    elementModel.setText(utilities.nl2br(value));
                    break;

                // linkarea
                case 'url':
                    elementModel.setUrl(value);
                    break;

                // jumparea
                case 'jump_to_frame':
                    elementModel.setJumpToFrame(value);
                    break;

                // question area
                case 'question':
                    elementModel.setQuestion(value);
                    break;

                case 'exp':
                    elementModel.setExp(value);
                    break;

                case 'answer_text':
                    var answer_id = $field.data('answer-id');
                    elementModel.getAnswer(answer_id).setText(value);
                    break;

                case 'question_type':
                    elementModel.setQuestionType(value);
                    break;

            }

            dispatcher.trigger(dispatcher.elementUpdated, elementModel);

        },

        /**
         * Load an element edit panel
         * @param elementModel
         * @param force
         */
        loadElement: function(elementModel, force) {

            var self = this,
                html,
                $element,
                elementType = elementModel.getType(),
                elementModelObject = elementModel.toObject();

            if(!force && (this.currentElementModel && this.currentElementModel.getId() === elementModel.getId()) ) {
                return;
            }

            if(typeof elementModelObject.text !== 'undefined') {
                elementModelObject.text = utilities.br2nl(elementModelObject.text);
            }

            switch (elementType) {

                case 'Video360':
                    html = Video360Tpl(elementModelObject);
                    break;
                case 'Video':
                    html = VideoTpl(elementModelObject);
                    break;
                case 'JumpArea':
                    html = JumpAreaTpl(elementModelObject);
                    break;
                case 'LinkArea':
                    html = LinkAreaTpl(elementModelObject);
                    break;
                case 'QuestionArea':
                    html = QuestionAreaTpl(elementModelObject);
                    break;
                case 'TextArea':
                    html = TextAreaTpl(elementModelObject);
                    break;

            }

            if(html) {

                $element = $(html);
                $element.data('model', elementModel);
                this.$currentEl = $element;
                this.$propertiesWrap.empty().append($element);
                this.$elementTitle.html('<i class="fi-' + elementType + '"></i>' + elementType);

                if(this.currentElementModel) {
                    this.$editbar.removeClass(this.currentElementModel.getType());
                }

                this.$editbar.addClass(elementModel.getType());

                this.currentElementModel = null;
                this.currentElementModel = elementModel;

                this.setupElement();

            } else {
                notification.error("Errore", "Non riesco a caricare il pannello di modifica per l'elemento selezionato");
            }

        },

        /**
         * Setup current element properties listeners
         */
        setupElement: function() {
            var self = this,
                elementType = this.currentElementModel.getType();

            // common

            this.$fields = null;
            this.$fields = {};

            this.$currentEl.find('input, select, textarea').each(function(i, el) {
                self.$fields[$(el).prop('name')] = $(el);
            });

            this.$fields['frame'].val(this.currentElementModel.getHumanReadableFrame());
            this.$fields['duration'].val(this.currentElementModel.getHumanReadableDuration());


            // specific

            switch (elementType) {

                case 'Video360':

                    this.$fields['duration'].prop('readonly', true);

                    break;

                case 'Video':

                    this.$fields['duration'].prop('readonly', true);

                    this.$currentEl.on('click', '.playpause', function(){
                        var VideoApi = MovieController.getElement(self.currentElementModel.getId()).data('api');
                        if(VideoApi.isPlaying()) {
                            VideoApi.pause();
                            $(this).html('<i class="fi-play-video"></i>');
                        } else {
                            VideoApi.play();
                            $(this).html('<i class="fi-pause"></i>');
                        }
                    });

                    break;

                case 'JumpArea':
                    this.$fields['jump_to_frame'].val(this.currentElementModel.getHumanReadableJumpFrame());
                    break;


                case 'QuestionArea':
                    QuestionAreaController.init(this.currentElementModel, this.$currentEl);
                    break;

                case 'LinkArea':
                case 'TextArea':

                    break;

            }

            // slider zindex
            if(elementType !== 'Video' && elementType !== 'Video360') {

                $('#p_zindex_slider').slider({
                    min: 1,
                    max: 10,
                    value: self.currentElementModel.getZindex(),
                    slide: function( event, ui ) {
                        self.updateElement(self.currentElementModel, 'zindex', ui.value);
                    }
                });

                this.$propertiesWrap.find('.colorpicker').minicolors({
                    theme: 'bootstrap',
                    format: 'rgb',
                    opacity: true,
                    show: function() {
                        self.$editbar.draggable('disable');
                    },
                    hide: function() {
                        self.$editbar.draggable('enable');
                    }
                });

            }


        },

        /**
         * Unload current element
         */
        unloadElement: function() {
            if(!this.$currentEl) return;

            if(this.currentElementModel) {
                this.$editbar.removeClass(this.currentElementModel.getType());
            }

            this.$currentEl.off();
            this.$propertiesWrap.empty();
            this.currentElementModel = null;
        },

        /**
         * check if given element is displayed
         * @param elementModel
         * @returns {null|*|boolean}
         */
        isCurrentElement: function(elementModel) {
            return this.currentElementModel && this.currentElementModel.getId() === elementModel.getId();
        }

    };

    return EditbarController;

});