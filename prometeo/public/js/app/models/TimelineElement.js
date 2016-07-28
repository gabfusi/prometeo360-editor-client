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

        // just for viewer
        this.api = null;

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
            if(typeof this[prop] !== 'function' && prop !== 'api') {
                obj[prop.substring(1)] = this[prop];
            }
        }

        return obj;
    };

    // viewer api
    TimelineElement.prototype.setApi = function(api){
        this.api = api;
    };

    TimelineElement.prototype.getApi = function(){
        return this.api;
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

        if(this._type === 'Video') {

            // Video attributes

            if(typeof objectModel.filename !== 'undefined') {
                this.setFilename(objectModel.filename);
            }

        } else {

            // Area attributes

            if(typeof objectModel.x !== 'undefined') {
                this.setX(objectModel.x);
            }
            if(typeof objectModel.y !== 'undefined') {
                this.setY(objectModel.y);
            }
            if(typeof objectModel.width !== 'undefined') {
                this.setWidth(objectModel.width);
            }
            if(typeof objectModel.height !== 'undefined') {
                this.setHeight(objectModel.height);
            }
            if(typeof objectModel.background !== 'undefined') {
                this.setBackground(objectModel.background);
            }
            if(typeof objectModel.text_color !== 'undefined') {
                this.setTextColor(objectModel.text_color);
            }
            if(typeof objectModel.text_size !== 'undefined') {
                this.setTextSize(objectModel.text_size);
            }
            if(typeof objectModel.pause_movie !== 'undefined') {
                this.setPauseMovie(objectModel.pause_movie);
            }
            if(typeof objectModel.zindex !== 'undefined') {
                this.setZindex(objectModel.zindex);
            }

            // TextArea, LinkArea, JumpArea
            if(typeof objectModel.text !== 'undefined') {
                this.setText(objectModel.text);
            }

        }

        // Specific areas

        switch(this._type) {

            case 'LinkArea':

                if(typeof objectModel.url !== 'undefined') {
                    this.setUrl(objectModel.url);
                }

                break;

            case 'JumpArea':

                if(typeof objectModel.url !== 'undefined') {
                    this.setUrl(objectModel.url);
                }

                break;

            case 'QuestionArea':

                if(typeof objectModel.question !== 'undefined') {
                    this.setQuestion(objectModel.question);
                }
                if(typeof objectModel.question_type !== 'undefined') {
                    this.setQuestionType(objectModel.question_type);
                }
                if(typeof objectModel.exp !== 'undefined') {
                    this.setExp(objectModel.exp);
                }
                if(typeof objectModel.correct_answer !== 'undefined') {
                    this.setCorrectAnswer(objectModel.correct_answer);
                }

                if(typeof objectModel.answer !== 'undefined') {
                    this.setCorrectAnswer(objectModel.answer);
                }
                if(typeof objectModel.answers !== 'undefined') {
                    var a;
                    for(var i in objectModel.answers) {
                        a = this.addAnswer(objectModel.answers[i].text);
                        a.setId(objectModel.answers[i].id);
                        a.setOrder(objectModel.answers[i].order);
                    }
                }
        }

    };

    return TimelineElement;

});