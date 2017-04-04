"use strict";

define(function () {

    var domain = "localhost:3030",
        baseUrl = "http://" + domain,
        apiUrl = baseUrl + "/api/";

    return {

        saveDebounceTime: 2000, // msec

        domain: domain,
        baseUrl: baseUrl,
        apiUrl: apiUrl,
        publicJs: baseUrl + '/js/app/editor/',
        embedJsUrl: baseUrl + '/min/player.min.js',

        api: {

            // movie
            addMovie: apiUrl + 'lesson',                        // POST
            updateMovie: apiUrl + 'lesson/',                    // + :movie_id POST
            deleteMovie: apiUrl + 'lesson/',                    // + :movie_id DELETE
            getMovie: apiUrl + 'lesson/',                      // + :movie_id GET
            getMovies: apiUrl + 'lesson',                      // GET

            // video
            uploadVideo: apiUrl + 'video',                      // POST
            getVideos: apiUrl + 'video',                        // GET
            getVideo: apiUrl + 'video/',                        // + :filename GET
            getVideoScreenShot: apiUrl + 'video/screenshot/'    // + :filename GET

        },

        availableAreas: {
            "Video": "Video",
            "Video360": "Video360",
            "TextArea": "Testo",
            "LinkArea": "Link",
            "JumpArea": "Salto temporale",
            "QuestionArea": "Domanda"
        }

    }

});