define(['model/Area', 'lib/utilities'], function(Area, utilities) {
    "use strict";

    /**
     * JumpArea
     * @constructor
     */
    var JumpArea = function() {

        // Call the parent constructor
        Area.call(this);

        this._type = "JumpArea";
        this._text = "";
        this._jump_to_frame = 0;

    };

    // Inheritance

    /**
     * Create a Area.prototype object that inherits from Area.prototype.
     * @object {TimelineElement}
     */
    JumpArea.prototype = Object.create(Area.prototype);

    /**
     *  Set the "constructor" property to refer to JumpArea
     * @object {TimelineElement}
     */
    JumpArea.prototype.constructor = JumpArea;


    // Class specific methods

    JumpArea.prototype.setText = function(text) {
        this._text = text;
    };

    JumpArea.prototype.getText = function() {
        return this._text;
    };

    // start frame

    JumpArea.prototype.setJumpToFrame = function(jump_to_frame){

        if(typeof jump_to_frame === 'string') {
            jump_to_frame = utilities.stringToMilliseconds(jump_to_frame);
        }

        this._jump_to_frame = jump_to_frame;
    };

    JumpArea.prototype.getJumpToFrame = function(){
        return this._jump_to_frame;
    };

    JumpArea.prototype.getHumanReadableJumpFrame = function(){
        return utilities.millisecondsToString(this._jump_to_frame);
    };


    return JumpArea;

});