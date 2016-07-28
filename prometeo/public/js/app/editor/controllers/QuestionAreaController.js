"use strict";

define([
    "jquery",
    "dispatcher",
    'hbs!js/app/editor/views/properties/Answer'
], function ($, dispatcher, AnswerTpl) {


    var QuestionAreaController = {


        init: function (elementModel, $element) {

            this.elementModel = elementModel;
            this.$el = $element;
            this.$list = this.$el.find('#answers_list');
            this.$addBtn = this.$el.find('#add_answer');
            this.$emptyPlaceholder = this.$el.find('.empty-placeholder').hide();

            this.initUI();
            this.populate();

        },

        initUI: function () {

            var self = this;


            // answers can be ordered
            this.$list.sortable({
                axis: "y",
                containment: 'parent',
                forcePlaceholderSize: true,
                placeholder: "ui-state-highlight",
                update: function(evt, ui) {
                    self.sortAnswers();
                }
            });

            // adding answers
            this.$addBtn.on('click', function () {
                self.addAnswer('');
            });

            // removing answers
            this.$list.on('click', '.remove-answer', function() {
                var answer_id = $(this).parentsUntil('.answer').parent().data('id');
                self.removeAnswer(answer_id);
            });

            // setting correct answer
            this.$list.on('change', '.correct-answer', function() {
                var answer_id = $(this).parentsUntil('.answer').parent().data('id');
                self.setCorrectAnswer(answer_id);
            });

        },

        /**
         * loads answers on UI
         */
        populate: function() {

            var answers = this.elementModel.getAnswers(),
                correct_answer = this.elementModel.getCorrectAnswer(),
                correct_answer_id = correct_answer ? correct_answer.getId() : false,
                obj;

            if(!answers.length) {
                this.showEmptyPlaceholder();
                return;
            }


            for(var i = 0, l = answers.length; i < l; i++) {
                obj = $.extend({}, answers[i].toObject(), {correct_answer_id : correct_answer_id});
                this.renderAnswer(obj);
            }

        },

        /**
         * render an answer
         * @param answerObject
         */
        renderAnswer: function(answerObject) {
            var html = AnswerTpl(answerObject);
            this.$list.append(html);
        },

        /**
         * adds a new answer
         * @param text
         */
        addAnswer: function (text) {
            var answerModel = this.elementModel.addAnswer(text);
            this.hideEmptyPlaceholder();
            this.renderAnswer(answerModel.toObject());
            this.sortAnswers();
        },

        /**
         * removes an answer
         * @param answer_id
         */
        removeAnswer: function(answer_id) {
            this.elementModel.removeAnswer(answer_id);
            this.$list.find('[data-id="' + answer_id + '"]').remove();
            this.sortAnswers();

            if(!this.$list.children().length) {
                this.showEmptyPlaceholder();
            }
        },

        /**
         * Sort answers
         */
        sortAnswers: function() {

            var sortedIds = this.$list.sortable('toArray', { attribute: 'data-id'});

            for(var i = 0, l = sortedIds.length; i < l; i++) {
                this.elementModel.getAnswer(sortedIds[i]).setOrder(i);
            }

            this.elementModel.updateOrder();

            dispatcher.trigger(dispatcher.elementUpdated, this.elementModel);
        },

        /**
         * Set correct answer
         * @param answer_id
         */
        setCorrectAnswer: function(answer_id) {
            this.elementModel.setCorrectAnswer(answer_id);
            dispatcher.trigger(dispatcher.elementUpdated, this.elementModel);
        },

        // utils

        showEmptyPlaceholder: function() {
            this.$emptyPlaceholder.show();
        },
        hideEmptyPlaceholder: function() {
            this.$emptyPlaceholder.hide();
        }


    };

    return QuestionAreaController;

});