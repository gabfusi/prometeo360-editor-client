"use strict";

define([
        "jquery",
        "dispatcher",
        "lib/utilities",
        "lib/notifications",
        "controller/MovieController",
        "controller/TimelineController",
        "controller/VideoPickerController",
        'hbs!../../js/src/views/properties/InteractiveArea',
        'hbs',
        'jqueryui/draggable'
    ],

    function($, dispatcher, utilities, notification,
             MovieController, TimelineController, VideoPickerController,
             InteractiveAreaTpl) {

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
                case 'zindex':      elementModel.setZindex(value); break;

                // video
                case 'filename': elementModel.setFilename(value); break;

                case 'linked_scene':
                    elementModel.setLinkedScene(value);
                    break;

            }

            dispatcher.trigger(dispatcher.elementUpdated, elementModel);
            dispatcher.trigger(dispatcher.elementUpdatedInfo, elementModel);

        },

        /**
         * Load an element edit panel
         * @param elementModel
         * @param force
         */
        loadElement: function(elementModel, force) {

            var html,
                $element,
                elementType = elementModel.getType(),
                elementModelObject = elementModel.toObject();

            if(!force && this.isCurrentElement(elementModel) ) {
                return;
            }

            if(typeof elementModelObject.text !== 'undefined') {
                elementModelObject.text = utilities.br2nl(elementModelObject.text);
            }

            switch (elementType) {

                case 'InteractiveArea':
                    html = InteractiveAreaTpl(elementModelObject);

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

            if(elementType === 'InteractiveArea') {

                var scenes = MovieController.getModel().getScenes(),
                    options = scenes.map(function(s) {
                        return '<option value="' + s.getId() + '"' +
                            (self.currentElementModel.getLinkedScene() == s.getId() ? ' selected="selected"' : '')
                            + '>' + s.getName() + '</option>';
                    });

                $("#p_linked_scene").append('<option value="">Nessuna</option>' + options.join());
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