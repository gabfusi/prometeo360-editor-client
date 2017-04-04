"use strict";

define(function () {

    var domain = "localhost:3030",
        baseUrl = "http://" + domain,
        apiUrl = baseUrl + "/api/";

    return {

        domain: domain,
        baseUrl: baseUrl,
        apiUrl: apiUrl,
        publicJs: baseUrl + '/js/app/viewer/',

        api: {

            // movie
            getMovie: apiUrl + 'lesson/',                      // + :movie_id GET

            // video
            getVideo: apiUrl + 'video/',                        // GET :filename
            getVideos: apiUrl + 'video',                        // GET
            getVideoScreenShot: apiUrl + 'video/screenshot/'    // + :filename GET

        },

        // selector that fires a new player instance
        playerSelector: '.prometeo-player',

        // player css
        playerCss: baseUrl + '/css/player.main.css',

        // session localStorage key
        sessionLocalStorageKey: 'prpsess'

    }

});