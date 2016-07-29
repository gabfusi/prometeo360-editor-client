"use strict";

/**
 * App startup
 */
define([
        "jquery",
        "config",
        "controller/PlayerController"
    ],
    function ($, config, PlayerController) {

        var $movieElements,
            $stylesheet,
            players = [];

        // on document ready
        $(document).ready(function () {

            var $el;

            // get all player elements
            $movieElements = $(config.playerSelector);

            // continue only if there is some player...
            if(!$movieElements.length) {
                return;
            }

            // attach player css
            $stylesheet = $('<link rel="stylesheet" href="' + config.playerCss + '" />');
            $('head').append($stylesheet);

            $stylesheet.load(function() {

                // for each element, instantiate a player
                $movieElements.each(function(i, el) {

                    $el = $(el);

                    players[i] = new PlayerController({
                        target  : $el,
                        width   : $el.data('width'),
                        id      : $el.data('id')
                    });

                });

            });


        });
    });
