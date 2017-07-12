"use strict";

define(function () {

    var electron = nodeRequire('electron');
    var currentWindow = electron.remote.getCurrentWindow();

    return {

        saveDebounceTime: 2000, // msec

        previewWindow: "file://" + currentWindow.customOptions.appPath + "/process-client/preview.html",

        assetsPath: currentWindow.customOptions.appPath + '/assets',
        videosPath: currentWindow.customOptions.videosPath,
        screenshotsPath: currentWindow.customOptions.screenshotsPath,

        // list of ipc message types involved
        api: {

            // movie
            addMovie: 'movies.add',
            updateMovie: 'movies.update',
            deleteMovie: 'movies.delete',
            getMovie: 'movies.get',
            getMovies: 'movies.list',
            publishMovie: 'movies.publish',
            unpublishMovie: 'movies.unpublish',

            // video
            uploadVideo: 'videos.upload',
            getVideos: 'videos.list'

        },

        availableAreas: {
            "InteractiveArea": "Area Interattiva"
        }

    }

});