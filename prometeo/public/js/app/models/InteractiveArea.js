define(['model/TimelineElement'], function(TimelineElement) {
    "use strict";

    /**
     * TextArea
     * @constructor
     */
    var InteractiveArea = function() {

        // Call the parent constructor
        TimelineElement.call(this);

        this._type = "InteractiveArea";
        this._keyframes = {};
        this._background = '';
        this._backgroundOpacity = 1;
        this._actionType = '';
        this._actionValue = '';

    };

    // Inheritance

    /**
     * Create a Area.prototype object that inherits from Area.prototype.
     * @object {TimelineElement}
     */
    InteractiveArea.prototype = Object.create(TimelineElement.prototype);

    /**
     *  Set the "constructor" property to InteractiveArea to Area
     * @object {TimelineElement}
     */
    InteractiveArea.prototype.constructor = TimelineElement;


    // Class specific methods
    InteractiveArea.prototype.addKeyframe = function(frame, vertices) {
        this._keyframes[frame] = { frame: frame/1000, vertices: vertices };
    };

    InteractiveArea.prototype.removeKeyframe = function(frame) {
        if(typeof this._keyframes[frame] !== 'undefined') {
            delete this._keyframes[frame];
        }
    };

    InteractiveArea.prototype.setKeyframes = function(keyframes) {
        this._keyframes = keyframes;
    };

    InteractiveArea.prototype.getKeyframes = function() {
        return this._keyframes;
    };

    InteractiveArea.prototype.setBackground = function(background) {
        this._background = background;
    };

    InteractiveArea.prototype.getBackground = function() {
        return this._background;
    };

    InteractiveArea.prototype.setBackgroundOpacity = function(backgroundOpacity) {
        this._backgroundOpacity = backgroundOpacity;
    };

    InteractiveArea.prototype.getBackgroundOpacity = function() {
        return this._backgroundOpacity;
    };

    InteractiveArea.prototype.setActionType = function(actionType) {
        this._actionType = actionType;
    };
    InteractiveArea.prototype.getActionType = function(actionType) {
        return this._actionType;
    };

    InteractiveArea.prototype.setActionValue = function(actionValue) {
        this._actionValue = actionValue;
    };
    InteractiveArea.prototype.getActionValue = function(actionValue) {
        return this._actionValue;
    };

    return InteractiveArea;

});