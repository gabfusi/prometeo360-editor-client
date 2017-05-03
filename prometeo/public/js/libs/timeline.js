/**
 * Timeline.js
 * © Gabriele Fusi
 */
define(["jquery", 'jqueryui/draggable'], function($) {
    "use strict";

    var Timeline = function(_selector, _options) {

        var defaultOptions = {

                currentFrame: 0,        // initial track frame
                duration: 60,           // seconds
                rulersStep: 10,         // a ruler every X seconds
                secondsWidth: 4,        // width of a second in the timeline (in px)
                elementHeight: 30,      // height of an element in px
                elementGutter: 0,       // vertical margin between elements in px

                onAdd: null,            // on element added
                onSelect: null,         // on element selected
                onDeselect: null,       // on element unselected
                onStartTrackMove: null, // on track start move
                onTrackMove: null,      // on track moved
                onElementDragged: null,  // on element dragged
                onElementStopDrag: null, // on element drag stop
                onElementRightClick: null,
                onKeyframeAdded: null,
                onKeyframeRemoved: null,
                onKeyframeSelected: null

            },
            options = $.extend(defaultOptions, _options),
            // elements
            $container = $(_selector),
            $scrollEl = null,
            $timelineEl = null,
            $rulersEl = null,
            $elementsEl = null,
            $trackEl = null,
            $currentFrameEl = null;

        /**
         *
         * @returns {Timeline}
         */
        this.init = function() {

            this.trackPosition = 0;
            this.elementSelected = false;
            this.isDragging = false;

            // l'unità di misura sono i millisecondi
            options.rulersStep = secondToFrame(options.rulersStep);
            options.duration = secondToFrame(options.duration);

            this.buildUI();
            this.bindUI();

            return this;
        };

        /**
         * Build UI
         */
        this.buildUI = function() {

            var durationSec = frameToSecond(options.duration),
                rulersStepSec = frameToSecond(options.rulersStep),
                timelineWidth = (options.secondsWidth*durationSec) +
                                (durationSec/rulersStepSec) +
                                options.secondsWidth + 1;

            options.timelineWidth = timelineWidth;

            //  scroll element

            $scrollEl = $('<div/>', {
                "class" : "gscroll"
            });


            // timeline wrapper

            $timelineEl = $('<div/>', {
                "class" : "gtimeline",
                "style" : "width: " + timelineWidth + "px"
            }).data('options', options);


            // rulers

            $rulersEl = $('<div/>', {
                "class" : "rulers"
            });

            for( var sec = 0; sec < durationSec; sec += rulersStepSec ) {

                $('<div/>', {
                    "class" : "ruler",
                    "style" : "margin-right:" + (rulersStepSec*options.secondsWidth) + "px"
                }).append('<div class="label">' + formatTime(secondToFrame(sec), false) + '</div>')
                    .appendTo($rulersEl);

            }

            // timeline elements container

            $elementsEl = $('<div/>', {
                "class" : "elements"
            });


            // track
            $trackEl = $('<div/>', {
                "class" : "track"
            });


            $timelineEl.append($rulersEl, $elementsEl, $trackEl);
            $scrollEl.append($timelineEl);

            requestAnimationFrame(function(){
                $container.append($scrollEl);
            });

        };

        /**
         * bindUI
         */
        this.bindUI = function() {
            var self = this;

            $trackEl.draggable({
                axis: "x",
                containment: "parent",
                snap: ".ruler",
                snapTolerance: 1,
                snapMode: "inner",
                start: function(evt, ui) {
                    self.unselectElements();
                    self.isDragging = true;

                    if(typeof options.onStartTrackMove === 'function') {
                        options.onStartTrackMove.call();
                    }
                },
                drag: function(evt, ui) {
                    self.setTrackPosition(positionToSeconds(ui.position.left));
                },
                stop: function() {
                    self.isDragging = false;
                }
            });

            // track reposition after click
            $elementsEl.on('click', function(e){

                if(typeof options.onDeselect === 'function' && self.elementSelected) {
                    options.onDeselect.call();
                }

                self.unselectElements();
                self.moveTrack(e.offsetX);

            });

            // on elements select
            $elementsEl.on('click', '.element', function(e) {
                var offset = $(this).position().left + e.offsetX;
                e.stopPropagation();
                self.selectElement($(this));

                if($(e.target).hasClass('element-keyframe')) {
                    offset += $(e.target).position().left;
                }

                self.moveTrack( offset );
            });

            // on keyframe right click
            $elementsEl.on('contextmenu', '.element-keyframe', function(e) {
                e.stopPropagation();
                if(typeof options.onKeyframeSelected === 'function') {
                    var element = $(this).parent().data('element');
                    options.onKeyframeSelected(element, $(this).data('frame'));
                }
            });

            // on keyframe right click
            $elementsEl.on('contextmenu', '.element', function(e) {
                e.stopPropagation();
                if(typeof options.onElementRightClick === 'function') {
                    var element = $(this).data('element');
                    self.moveTrack( $(this).position().left + e.offsetX );
                    options.onElementRightClick(element);
                }
            });

        };

        /**
         * move track to position
         * @param position
         */
        this.moveTrack = function(position) {

            this.setTrackPosition(positionToSeconds(position));
            requestAnimationFrame(function(){
                $trackEl.css('left', position);
            });
        };


        /**
         * select element by its id
         * @param element_id
         */
        this.select = function(element_id) {

            this.unselectElements();
            this.elementSelected = $elementsEl.find('#gtml_' + element_id).addClass('selected');

        };

        /**
         * select element
         * @param $el
         */
        this.selectElement = function($el) {

            this.unselectElements();
            $el.addClass('selected');
            this.elementSelected = $el;

            if(typeof options.onSelect === 'function') {
                options.onSelect.call($el, $el.data('element'));
            }

        };

        /**
         * unselect elements
         */
        this.unselectElements = function() {
            this.elementSelected = false;
            $elementsEl.find('.selected').removeClass('selected');
        };


        /**
         * Adds an element to timeline
         * @param element_id
         * @param name
         * @param frame
         * @param duration
         * @param zindex
         * @param data
         * @param silent
         */
        this.add = function(element_id, name, frame, duration, zindex, data, silent) {

            if(typeof frame !== 'number') {
                //console.warn(frame, 'is not a number!', typeof frame);
                frame = this.getTrackPosition();
            }

            var width = secondsToPosition(frameToSecond(duration)),
                positionH = secondsToPosition(frameToSecond(frame)),
                positionV = this.calcVerticalPosition(zindex),


                $el = $('<div/>', {
                    "id": "gtml_" + element_id,
                    "class" : "element element-" + data.getType().replace(/\s+/, ''), // FIXME bruttino
                    "style" : "left:" + positionH + "px; width:" + width + "px; height: " + options.elementHeight + "px; top:" + positionV + "px"
                }).text(name).data('element', data);

            //console.log('timeline: adding element ', name, 'positionH', positionH, 'frame', frame, data);

            if(data.getType() === 'InteractiveArea') {
                // keyframes

                var keyframes = data.getKeyframes(),
                    $k;

                for(var f in keyframes) {
                    $k = createKeyframeElement(f);
                    $el.append($k);
                }

            }

            $elementsEl.append($el);

            $el.draggable({
                axis: "x",
                snap: ".element",
                containment: "parent",
                stop: function(evt, ui) {

                    var positionH = ui.position.left,
                        frame = secondToFrame(positionToSeconds(positionH));

                    if(typeof options.onElementStopDrag === 'function') {
                        options.onElementStopDrag.call($el, $(this).data('element'), frame);
                    }

                },
                drag: function(evt, ui) {

                    var positionH = ui.position.left,
                        frame = secondToFrame(positionToSeconds(positionH));

                    if(typeof options.onElementDragged === 'function') {
                        options.onElementDragged.call($el, $(this).data('element'), frame);
                    }
                }
            });

            if(typeof options.onAdd === 'function' && !silent) {
                options.onAdd.call($el, data, frame);
            }

            return $el;
        };

        /**
         * Updates an element
         * @param element_id
         * @param name
         * @param frame
         * @param duration
         * @param zindex
         * @param data
         */
        this.update = function(element_id, name, frame, duration, zindex, data) {

            var $el = $elementsEl.find('#gtml_' + element_id),
                width = secondsToPosition(frameToSecond(duration)),
                positionH = secondsToPosition(frameToSecond(frame)),
                positionV = this.calcVerticalPosition(zindex);

            $el.data('element', data);

            requestAnimationFrame(function() {
                $el.css({
                    left: positionH,
                    width: width,
                    top: positionV
                });//.text(name);
            });

        };

        /**
         * Calculate vertical position
         * @param zindex
         * @returns {number}
         */
        this.calcVerticalPosition = function(zindex) {

            var elementHeight = options.elementHeight,
                elementGutter = options.elementGutter,
                elementOuterHeight = elementHeight + elementGutter;

            return ( (zindex-1) * elementOuterHeight ) + elementGutter;
        };

        /**
         * Removes an element from timeline
         * @param element_id
         */
        this.remove = function(element_id) {
            $elementsEl.find('#gtml_' + element_id).remove();
        };

        this.addKeyframe = function(element_id, frame) {
            var $el = $elementsEl.find('#gtml_' + element_id),
                $k = createKeyframeElement(frame);

            $el.append($k);

            if(typeof options.onKeyframeAdded === 'function') {
                options.onKeyframeAdded.call($el, $el.data('element'), frame);
            }

            return $el;

        };

        this.removeKeyframe = function(element_id, frame) {
            var $el = $elementsEl.find('#gtml_' + element_id);

            $el.find('.element-k-' + frame).remove();

            if(typeof options.onKeyframeRemoved === 'function') {
                options.onKeyframeRemoved.call($el, $el.data('element'), frame);
            }
        };


        /**
         * return current track position
         * @returns Number
         */
        this.getTrackPosition = function(){
            return this.trackPosition;
        };

        /**
         * set track position
         * @param second
         */
        this.setTrackPosition = function(second, move) {

            this.trackPosition = secondToFrame(second);

            if(move) {
                $trackEl.css('left', 0);
            }

            if(typeof options.onTrackMove === 'function') {
                options.onTrackMove(formatTime(this.trackPosition, true), this.trackPosition);
            }

        };

        this.updateTrackPosition = function(second) {
            this.trackPosition = secondToFrame(second);

            $trackEl.css('left', secondsToPosition(second));

            return { formattedFrame: formatTime(this.trackPosition, true), frame: this.trackPosition }
        };

        /**
         * Reset current timeline
         */
        this.reset = function() {
            $elementsEl.empty();
            this.trackPosition = 0;
        };

        // private methods / utility

        var createKeyframeElement = function(frame) {

            // TODO calc position (startFrame + frame)
            var $el = $('<div/>', {
                class: "element-keyframe element-k-" + frame,
                style: 'left:' + secondsToPosition(frameToSecond(frame)) + 'px'
            });
            $el.data('frame', frame);
            return $el;
        };

        var frameToSecond = function(frame) {
            return frame/1000;
        };

        var secondToFrame = function(second) {
            return second*1000;
        };

        var positionToSeconds = function(position) {
            // position : timelineWidth = seconds : timelineDuration
            return +parseFloat((position*frameToSecond(options.duration)) / options.timelineWidth).toFixed(2)
        };

        var secondsToPosition = function(seconds) {
            return parseInt((seconds*options.timelineWidth) / frameToSecond(options.duration));
        };

        /**
         * Format seconds as hh:mm:ss
         * @param duration
         * @param withMilliseconds
         * @returns {string}
         */
        var formatTime = function(duration, withMilliseconds){
            var milliseconds = parseInt((duration%1000)/100)
                , seconds = parseInt((duration/1000)%60)
                , minutes = parseInt((duration/(1000*60))%60)
                , hours = parseInt((duration/(1000*60*60))%24);

            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            if(withMilliseconds) {
                return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
            }

            return hours + ":" + minutes + ":" + seconds;
        };

        return this.init();
    };

    return Timeline;

});