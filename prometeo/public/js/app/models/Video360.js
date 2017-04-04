define(['model/TimelineElement'], function(TimelineElement) {
    "use strict";

    /**
     * Video
     * @constructor
     */
    var Video360 = function() {

        // Call the parent constructor
        TimelineElement.call(this);

        this._type = "Video360";
        this._filename = "";
        this._duration = 0;
        this._zindex = 1;

    };

    // Inheritance

    /**
     * Create a Video.prototype object that inherits from TimelineElement.prototype.
     * @object {TimelineElement}
     */
    Video360.prototype = Object.create(TimelineElement.prototype);

    /**
     *  Set the "constructor" property to refer to Video
     * @object {TimelineElement}
     */
    Video360.prototype.constructor = Video360;


    // Class specific methods

    Video360.prototype.setFilename = function(filename) {
        this._filename = filename;
    };

    Video360.prototype.getFilename = function() {
        return this._filename;
    };

    Video360.prototype.isPauseMovie = function() {
        return false;
    };

    // we can't change video z-index
    Video360.prototype.setZindex = function(zindex) {};

    return Video360;

});