define(['lib/utilities'], function(Utilities) {
    "use strict";

    /**
     * Answer
     * @constructor
     */
    var Answer = function() {

        this._text = "";
        this._id = Utilities.generateUid();
        this._order = 0;
    };

    // Class specific methods

    Answer.prototype.setId = function(id) {
        this._id = id;
    };

    Answer.prototype.getId = function() {
        return this._id;
    };

    Answer.prototype.setText = function(text) {
        this._text = text;
    };

    Answer.prototype.getText = function() {
        return this._text;
    };

    Answer.prototype.setOrder = function(order) {
        this._order = order;
    };

    Answer.prototype.getOrder = function() {
        return this._order;
    };

    /**
     * Return Answer model object
     *
     */
    Answer.prototype.toObject = function(){
        var obj = {};

        for(var prop in this) {
            if(typeof this[prop] !== 'function') {
                obj[prop.substring(1)] = this[prop];
            }
        }

        return obj;
    };

    return Answer;

});