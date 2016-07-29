"use strict";

define([
    'config',
    'dispatcher',
    'model/Session'

], function (config, dispatcher, Session) {

    /**
     * Load session from localStorage
     * @returns {*}
     */
    var loadSession = function () {
        var session = window.localStorage.getItem(config.sessionLocalStorageKey);
        return new Session(Session.unserialize(session));
    };

    /**
     * Save session in localStorage
     * @param session
     */
    var saveSession = function (session) {
        window.localStorage.setItem(config.sessionLocalStorageKey, session.serialize());
    };

    var session;

    /**
     * SessionController
     * @type {{init: SessionController.init, getExp: SessionController.getExp, increaseExp: SessionController.increaseExp, decreaseExp: SessionController.decreaseExp, addAnsweredQuestion: SessionController.addAnsweredQuestion, isQuestionAlreadyAnswered: SessionController.isQuestionAlreadyAnswered}}
     */
    var SessionController = {

        /**
         * Load session
         */
        init: function () {
            session = loadSession();
        },

        /**
         * Return session exp
         * @returns {*|*|number}
         */
        getExp: function() {
            return session.getExp();
        },

        /**
         * Increase user session exp
         * @param exp
         */
        increaseExp: function (exp) {
            session.increaseExp(exp);
            dispatcher.trigger(dispatcher.increasedUserExp, exp, session.getExp());
            saveSession(session);
        },

        /**
         * Decrease user session exp
         * @param exp
         */
        decreaseExp: function (exp) {
            session.decreaseExp(exp);
            dispatcher.trigger(dispatcher.decreasedUserExp, exp, session.getExp());
            saveSession(session);
        },

        /**
         * Flag a question as answered
         * @param question_id
         */
        addAnsweredQuestion: function (question_id) {
            if (!this.isQuestionAlreadyAnswered(question_id)) {
                return session.addAnsweredQuestion(question_id);
            }
        },

        /**
         * Checks if the user has already answered this question
         * @param question_id
         * @returns {*}
         */
        isQuestionAlreadyAnswered: function (question_id) {
            return session.isQuestionAlreadyAnswered(question_id);
        }

    };

    SessionController.init();


    return SessionController;

});