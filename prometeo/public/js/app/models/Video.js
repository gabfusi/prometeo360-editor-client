define(['model/TimelineElement'], function(TimelineElement) {
    "use strict";

    /**
     * Video
     * @constructor
     */
    var Video = function() {

        // Call the parent constructor
        TimelineElement.call(this);

        this._type = "Video";
        this._filename = "";
        this._duration = 0;
        this._zindex = 1;

    };

    // Inheritance

    /**
     * Create a Video.prototype object that inherits from TimelineElement.prototype.
     * @object {TimelineElement}
     */
    Video.prototype = Object.create(TimelineElement.prototype);

    /**
     *  Set the "constructor" property to refer to Video
     * @object {TimelineElement}
     */
    Video.prototype.constructor = Video;


    // Class specific methods

    Video.prototype.setFilename = function(filename) {
        this._filename = filename;
    };

    Video.prototype.getFilename = function() {
        return this._filename;
    };

    Video.prototype.isPauseMovie = function() {
        return false;
    };

    // we can't change video z-index
    Video.prototype.setZindex = function(zindex) {};

    return Video;

});