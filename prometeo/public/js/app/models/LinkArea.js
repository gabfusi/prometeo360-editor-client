define(['model/Area'], function(Area) {
    "use strict";

    /**
     * LinkArea
     * @constructor
     */
    var LinkArea = function() {

        // Call the parent constructor
        Area.call(this);

        this._type = "LinkArea";
        this._text = "";
        this._url = null;

    };

    // Inheritance

    /**
     * Create a Area.prototype object that inherits from Area.prototype.
     * @object {TimelineElement}
     */
    LinkArea.prototype = Object.create(Area.prototype);

    /**
     *  Set the "constructor" property to refer to LinkArea
     * @object {TimelineElement}
     */
    LinkArea.prototype.constructor = LinkArea;


    // Class specific methods

    LinkArea.prototype.setText = function(text) {
        this._text = text;
    };

    LinkArea.prototype.getText = function() {
        return this._text;
    };

    LinkArea.prototype.setUrl = function(url) {
        this._url = url;
    };

    LinkArea.prototype.getUrl = function() {
        return this._url;
    };

    return LinkArea;

});