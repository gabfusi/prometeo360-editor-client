"use strict";

define([
        'jquery',
        "config",
        "dispatcher",
        'model/Video',
        'model/JumpArea',
        'model/LinkArea',
        'model/QuestionArea',
        'model/TextArea',
        'model/Answer',
        "controller/VideoController",
        'hbs',
        'hbs!js/app/editor/views/preview/Video',
        'hbs!js/app/editor/views/preview/JumpArea',
        'hbs!js/app/editor/views/preview/LinkArea',
        'hbs!js/app/editor/views/preview/QuestionArea',
        'hbs!js/app/editor/views/preview/TextArea'
],

    function($, config, dispatcher, Video, JumpArea, LinkArea, QuestionArea, TextArea, Answer,
             VideoController, Handlebars,
             VideoTpl, JumpAreaTpl, LinkAreaTpl, QuestionAreaTpl, TextAreaTpl) {

        var models = {
            "Video" : Video,
            "JumpArea" : JumpArea,
            "LinkArea" : LinkArea,
            "QuestionArea" : QuestionArea,
            "TextArea": TextArea
        };

        var views = {
            "Video" : VideoTpl,
            "JumpArea" : JumpAreaTpl,
            "LinkArea" : LinkAreaTpl,
            "QuestionArea" : QuestionAreaTpl,
            "TextArea": TextAreaTpl
        };

        /**
         * TimelineElement Controller
         * @type {{create: TimelineElementController.create}}
         */
        var TimelineElementController = {


            create: function(type, objectModel) {

                var model = null;

                if(typeof models[type] === 'undefined') {
                    console.error('Cannot create element of type ', type);
                    return;
                }

                model = new models[type]();

                if(objectModel) {
                    model.fromObject(objectModel);
                }

                return model;
            },

            render: function(model) {

                var elementView,
                    elementModelObject = model.toObject(),
                    $element,
                    elementApi = null;

                if(model.getType() === 'Video' && model.getFilename().length) {

                    // add video & thumbnails urls
                    elementModelObject.video = config.api.getVideo + elementModelObject.filename;
                    elementModelObject.thumbnails = [];
                    for(var i = 1; i < 5; i++) {
                        elementModelObject.thumbnails[elementModelObject.thumbnails.length] =
                            config.api.getVideoScreenShot + elementModelObject.filename +  '-' + i +'.png'
                    }

                    // add video api
                    elementApi = new VideoController(model);
                }

                // generate html template from hadlebars
                elementView = views[model.getType()](elementModelObject);

                // create jQuery object from html template
                $element = $(elementView);

                // add model reference to element
                $element.data('model', model);

                if(elementApi) {
                    elementApi.setMovieElement($element);
                    $element.data('api', elementApi);
                }

                return $element;
            }

        };

        return TimelineElementController;

});