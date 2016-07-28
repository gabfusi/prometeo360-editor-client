define(['model/Area'], function(Area) {
    "use strict";

    /**
     * TextArea
     * @constructor
     */
    var TextArea = function() {

        // Call the parent constructor
        Area.call(this);

        this._type = "TextArea";
        this._text = "";

    };

    // Inheritance

    /**
     * Create a Area.prototype object that inherits from Area.prototype.
     * @object {TimelineElement}
     */
    TextArea.prototype = Object.create(Area.prototype);

    /**
     *  Set the "constructor" property to TextArea to Area
     * @object {TimelineElement}
     */
    TextArea.prototype.constructor = TextArea;


    // Class specific methods

    TextArea.prototype.setText = function(text) {
        this._text = text;
    };

    TextArea.prototype.getText = function() {
        return this._text;
    };

    return TextArea;

});