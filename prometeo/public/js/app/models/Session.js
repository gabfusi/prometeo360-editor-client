define([], function () {
    "use strict";

    /**
     * Simple user session model
     * This session persist in localStorage
     *
     * @param sessionObject
     * @returns {Session}
     * @constructor
     */
    function Session(sessionObject) {

        this._totalExp = 0;
        this._answered = [];

        // load existing session if exists
        if(sessionObject) {
            for (var k in sessionObject) {
                if(typeof this['_' + k] !== 'undefined') {
                    this['_' + k] = sessionObject[k];
                }
            }
        }

        this._totalExp = parseInt(this._totalExp);

        return this;
    }

    /**
     * Get total exp earned
     * @returns {*|number}
     */
    Session.prototype.getExp = function () {
        return this._totalExp;
    };

    /**
     * Increase total exp
     * @param exp
     */
    Session.prototype.increaseExp = function (exp) {
        this._totalExp = this._totalExp + parseInt(exp);
    };

    /**
     * Decrease total exp
     * @param exp
     */
    Session.prototype.decreaseExp = function (exp) {
        this._totalExp = this._totalExp - parseInt(exp);
    };

    /**
     * Flag a question as answered
     * @param answer_id
     */
    Session.prototype.addAnsweredQuestion = function (answer_id) {
        this._answered[this._answered.length] = answer_id;
    };

    Session.prototype.isQuestionAlreadyAnswered = function (answer_id) {
        return this._answered.indexOf(answer_id) !== -1;
    };

    /**
     * Serialize session
     */
    Session.prototype.serialize = function () {
        var obj = "";

        try {
            obj = {};

            for (var prop in this) {
                if (typeof this[prop] !== 'function') {
                    obj[prop.substring(1)] = this[prop];
                }
            }

            obj = JSON.stringify(obj);

        } catch (e) {
            console.warn('Prometeo: cannot serialize current session.');
        }

        return obj;
    };

    /**
     * Unserialize session
     * @static
     * @param serializedSession
     */
    Session.unserialize = function (serializedSession) {
        var session = false;

        try {
            if(serializedSession) {
                session = JSON.parse(serializedSession);
            }
        } catch (e) {
            console.warn('Prometeo: cannot read existing session');
        }

        return session;
    };

    return Session;

});