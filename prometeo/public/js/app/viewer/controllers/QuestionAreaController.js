"use strict";

define([
        'dispatcher',
        'controller/TimelineElementController',
        'controller/SessionController',
        'model/QuestionArea',
        'hbs!js/app/viewer/views/QuestionArea',
        'hbs'

    ],
    function (dispatcher, TimelineElementController, SessionController, QuestionArea, QuestionAreaTpl, hbs) {

        /**
         *
         * @returns {QuestionAreaController}
         * @constructor
         */
        function QuestionAreaController(objectModel) {

            TimelineElementController.call(this);

            this.model = new QuestionArea();
            this.$el = null;
            this.$console = null;

            if (objectModel) {
                this.model.fromObject(objectModel);
            }

            // attach controller reference to model
            this.model.setApi(this);

            return this;
        }

        QuestionAreaController.prototype = Object.create(TimelineElementController.prototype);
        QuestionAreaController.prototype.constructor = QuestionAreaController;

        /**
         * Render element
         * @override
         * @returns {*}
         */
        QuestionAreaController.prototype.render = function () {

            var elementModelObject = this.model.toObject();
            this.$el = $(QuestionAreaTpl(elementModelObject));
            this.$el.hide();
            this.$console = this.$el.find('.prp-question-console');
            return this.$el;
        };

        /**
         * Attach listeners
         */
        QuestionAreaController.prototype.attachListeners = function () {
            var self = this;

            // on answer submitted
            this.$el.on('submit', 'form', function (e) {
                e.preventDefault();

                var answers = $(this).serializeArray(),
                    answer_id = null;

                if (!answers.length && self.model.isAnswerRequired()) {
                    self.printConsole("Questa domanda &eacute; obbligatoria, seleziona una risposta");
                    return false;
                }

                if (answers.length) {
                    answer_id = answers[0].value;
                }

                // check if given answer is correct
                self.onAnswerSubmitted(answer_id);

            });

            // on skip
            this.$el.on('click', '.prp-skip', function () {

                if (self.model.isAnswerRequired()) {
                    return false;
                }

                self.exit();
            });

        };

        /**
         * Detach listeners
         */
        QuestionAreaController.prototype.detachListeners = function () {
            $(this.$el).off('submit', 'form');
        };

        /**
         * On element show
         */
        QuestionAreaController.prototype.onShow = function () {
            this.$el[0].style.display = 'block';
            this.detachListeners();
            this.attachListeners();
        };

        /**
         * On element hide
         */
        QuestionAreaController.prototype.onHide = function () {
            this.$el.detach();
            this.detachListeners();
            this.hasPausedMovie = false;
        };

        /**
         * On answer submitted
         */
        QuestionAreaController.prototype.onAnswerSubmitted = function (answer_id) {

            var question_id = this.getModel().getId();

            // if given answer is correct
            if (this.model.isAnswerCorrect(answer_id)) {

                // increase exp only if the user answered this question for the first time
                if (!SessionController.isQuestionAlreadyAnswered(question_id)) {
                    SessionController.addAnsweredQuestion(question_id);
                    SessionController.increaseExp(this.model.getExp());
                }

                this.exit();

            } else {

                // if given answer is wrong

                // decrease exp!
                SessionController.decreaseExp(this.model.getExp());

                // if an answer is required
                if (this.model.isAnswerRequired()) {
                    this.printConsole("Risposta errata! riprova...");
                } else {
                    this.printConsole("Risposta errata! riprova oppure salta la domanda.");
                }
            }

        };

        /**
         * Exit from question
         */
        QuestionAreaController.prototype.exit = function () {
            // flush console
            this.$console.html('');
            // hide question
            this.onHide();
            // play movie
            dispatcher.trigger(dispatcher.doMovieSeekAndPlay, this.model.getDuration() + 30);
        };

        /**
         * Prints a popup message
         * @param text
         */
        QuestionAreaController.prototype.printConsole = function (text) {
            var self = this;

            this.$console.html(text).addClass('prp-shown');

            var t = setTimeout(function () {
                self.$console.removeClass('prp-shown');
                clearTimeout(t);
                t = null;
            }, 6000);

        };


        return QuestionAreaController;

    });