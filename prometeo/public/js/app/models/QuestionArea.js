define(['model/Area', 'model/Answer'], function(Area, Answer) {
    "use strict";

    var Q_FACOLTATIVA = 'facoltativa',
        Q_OBBLIGATORIA = 'obbligatoria';

    /**
     * QuestionArea
     * @constructor
     */
    var QuestionArea = function() {

        Area.call(this);

        this._type = "QuestionArea";

        // area overrides
        this._x = 0;
        this._y = 0;
        this._width = -1;           // full width
        this._height = -1;          // full height
        this._pause_movie = true;   // pause movie on
        this._zindex = 1;

        this._question = "";
        this._question_type = Q_FACOLTATIVA;
        this._exp = 0;
        this._correct_answer = null;
        this._answers = [];

    };

    // Inheritance

    /**
     * Create a Area.prototype object that inherits from Area.prototype.
     * @object {TimelineElement}
     */
    QuestionArea.prototype = Object.create(Area.prototype);

    /**
     *  Set the "constructor" property to refer to QuestionArea
     * @object {TimelineElement}
     */
    QuestionArea.prototype.constructor = QuestionArea;


    // Class specific methods

    QuestionArea.prototype.addAnswer = function(text) {
        var a = new Answer();
        a.setText(text);
        this._answers.push(a);
        return a;
    };

    QuestionArea.prototype.removeAnswer = function(answer_id) {

        if(this._answers.length){

            for(var i = 0; i < this._answers.length; i++) {
                if(this._answers[i].getId() === answer_id) {
                    this._answers.splice(i, 1);
                    return true;
                }
            }

        }
        return false;
    };

    QuestionArea.prototype.getAnswer = function(answer_id) {

        if(this._answers.length){

            for(var i = 0; i < this._answers.length; i++) {
                if(this._answers[i].getId() === answer_id) {
                    return this._answers[i];
                }
            }

        }
        return false;
    };

    QuestionArea.prototype.getAnswers = function() {
        this.updateOrder();
        return this._answers;
    };

    QuestionArea.prototype.updateOrder = function() {
        // sort answers by theirs order
        this._answers = this._answers.sort(function(a, b) {
            return a._order - b._order;
        });
    };

    QuestionArea.prototype.setQuestion = function(question) {
        this._question = question;
    };

    QuestionArea.prototype.getQuestion = function() {
        return this._question;
    };

    QuestionArea.prototype.setQuestionType = function(question_type) {
        if(question_type !== Q_FACOLTATIVA && question_type !== Q_OBBLIGATORIA) return;

        this._question_type = question_type;
    };
    QuestionArea.prototype.setQuestionRequired = function() {
        this._question_type = Q_OBBLIGATORIA;
    };
    QuestionArea.prototype.unsetQuestionRequired = function() {
        this._question_type = Q_FACOLTATIVA;
    };

    QuestionArea.prototype.isAnswerRequired = function() {
        return this._question_type === Q_OBBLIGATORIA;
    };


    QuestionArea.prototype.setExp = function(exp) {
        this._exp = parseInt(exp);
    };

    QuestionArea.prototype.getExp = function() {
        return this._exp;
    };


    QuestionArea.prototype.setCorrectAnswer = function(answer_id) {
        this._correct_answer = answer_id;
    };

    QuestionArea.prototype.getCorrectAnswer = function() {
        return this.getAnswer(this._correct_answer);
    };

    QuestionArea.prototype.isAnswerCorrect = function(answer_id) {
        return this._correct_answer === answer_id;
    };

    QuestionArea.prototype.setPauseMovie = function(pause_movie) {};


    /**
     * Returns model object
     * @returns {{}}
     */
    QuestionArea.prototype.toObject = function(){
        var obj = {};

        for(var prop in this) {

            if(typeof this[prop] !== 'function') {

                if(prop === '_answers') {
                    obj[prop.substring(1)] = [];

                    for(var j = 0; j < this[prop].length; j++) {
                        obj[prop.substring(1)][j] = this[prop][j].toObject();
                    }

                } else {
                    obj[prop.substring(1)] = this[prop];
                }

            }

        }

        return obj;
    };


    return QuestionArea;

});