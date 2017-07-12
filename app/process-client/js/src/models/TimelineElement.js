define(['lib/utilities'], function(utilities) {
    "use strict";

    /**
     * TimelineElement
     * @constructor
     */
    var TimelineElement = function() {

        this._id = utilities.generateUid();
        this._duration = 0;
        this._frame = 0;
        this._end_frame = 0;
        this._type = null;
        this._zindex = 0;
    };

    TimelineElement.prototype.setId = function(id){
        this._id = id;
    };

    TimelineElement.prototype.getId = function(){
        return this._id;
    };

    TimelineElement.prototype.getType = function(){
        return this._type;
    };

    // duration

    TimelineElement.prototype.setDuration = function(duration){

        if(typeof duration === 'string') {
            duration = utilities.stringToMilliseconds(duration);
        }

        this._duration = duration;
        this.updateEndFrame();
    };

    TimelineElement.prototype.getDuration = function(){
        return this._duration;
    };

    TimelineElement.prototype.getHumanReadableDuration = function(){
        return utilities.millisecondsToString(this._duration);
    };

    // start frame

    TimelineElement.prototype.setFrame = function(frame){

        if(typeof frame === 'string') {
            frame = utilities.stringToMilliseconds(frame);
        }

        if(frame < 0) {
            frame = 0;
        }

        this._frame = frame;
        this.updateEndFrame();
    };

    TimelineElement.prototype.getFrame = function(){
        return this._frame;
    };

    TimelineElement.prototype.getHumanReadableFrame = function(){
        return utilities.millisecondsToString(this._frame);
    };

    // end frame

    TimelineElement.prototype.updateEndFrame = function(){
        this._end_frame = this.getFrame() + this.getDuration();
    };

    TimelineElement.prototype.getEndFrame = function(){
        return this._end_frame;
    };

    // z-index
    TimelineElement.prototype.setZindex = function(zindex){
        this._zindex = zindex;
    };

    TimelineElement.prototype.getZindex = function(){
        return this._zindex;
    };

    /**
     * Returns model object
     * @returns {{}}
     */
    TimelineElement.prototype.toObject = function(){
        var obj = {};

        for(var prop in this) {
            if(typeof this[prop] !== 'function') {
                obj[prop.substring(1)] = this[prop];
            }
        }

        return obj;
    };

    /**
     * Populate model from model object
     * @param objectModel
     */
    TimelineElement.prototype.fromObject = function(objectModel){

        if(this._type !== objectModel.type) {
            console.error(this._type + ': Non riesco a caricare l\'elemento, Il tipo non corrisponde.', objectModel);
            return;
        }

        // TimelineElement attributes

        if(typeof objectModel.id !== 'undefined') {
            this.setId(objectModel.id);
        }

        if(typeof objectModel.frame !== 'undefined') {
            this.setFrame(objectModel.frame);
        }

        if(typeof objectModel.duration !== 'undefined') {
            this.setDuration(objectModel.duration);
        }

        // InteractiveArea attributes
        if(typeof objectModel.linkedSceneId !== 'undefined') {
            this.setLinkedScene(objectModel.linkedSceneId);
        }
        if(typeof objectModel.linkedSceneFrame !== 'undefined') {
            this.setLinkedSceneFrame(objectModel.linkedSceneFrame);
        }
        if(typeof objectModel.background !== 'undefined') {
            this.setBackground(objectModel.background);
        }
        if(typeof objectModel.backgroundOpacity !== 'undefined') {
            this.setBackgroundOpacity(objectModel.backgroundOpacity);
        }
        if(typeof objectModel.keyframes !== 'undefined') {
            this.setKeyframes(objectModel.keyframes);
        }
        if(typeof objectModel.zindex !== 'undefined') {
            this.setZindex(objectModel.zindex);
        }


    };

    return TimelineElement;

});