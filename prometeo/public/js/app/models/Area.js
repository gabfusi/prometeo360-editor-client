define(['model/TimelineElement'], function(TimelineElement) {
    "use strict";

    /**
     * Area
     * @constructor
     */
    var Area = function() {

        // Call the parent constructor
        TimelineElement.call(this);

        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._background = '#fff';
        this._text_color = '#000';
        this._text_size = 14;
        this._pause_movie = false;
        this._zindex = 2;

    };

    // Inheritance

    /**
     * Create a Area.prototype object that inherits from TimelineElement.prototype.
     * @object {TimelineElement}
     */
    Area.prototype = Object.create(TimelineElement.prototype);

    /**
     *  Set the "constructor" property to refer to Area
     * @object {TimelineElement}
     */
    Area.prototype.constructor = Area;


    // Class specific methods


    Area.prototype.setX = function(x) {
        this._x = Math.round(x);
    };

    Area.prototype.getX = function() {
        return this._x;
    };

    Area.prototype.setY = function(y) {
        this._y = Math.round(y);
    };

    Area.prototype.getY = function() {
        return this._y;
    };

    Area.prototype.setWidth = function(width) {
        this._width = Math.round(width);
    };

    Area.prototype.getWidth = function() {
        return this._width;
    };

    Area.prototype.setHeight = function(height) {
        this._height = Math.round(height);
    };

    Area.prototype.getHeight = function() {
        return this._height;
    };

    Area.prototype.setBackground = function(background) {
        this._background = background;
    };

    Area.prototype.getBackground = function() {
        return this._background;
    };

    Area.prototype.setTextColor = function(text_color) {
        this._text_color = text_color;
    };

    Area.prototype.getTextColor = function() {
        return this._text_color;
    };

    Area.prototype.setTextSize = function(text_size) {
        this._text_size = text_size;
    };

    Area.prototype.getTextSize = function() {
        return this._text_size;
    };

    Area.prototype.setPauseMovie = function(pause_movie) {
        this._pause_movie = pause_movie;
    };

    Area.prototype.isPauseMovie = function() {
        return this._pause_movie;
    };

    return Area;

});