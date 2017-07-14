"use strict";

define(function () {

    var url = nodeRequire("url");
    var path = nodeRequire("path");
    var electron = nodeRequire('electron');
    var currentWindow = electron.remote.getCurrentWindow();

    var remoteUrl  = 'http://prometeo360.gabrielefusi.com/';

    return {

        saveDebounceTime: 2000, // msec

        previewWindow: url.format({
            pathname: path.join(currentWindow.customOptions.appPath, 'process-client', 'preview.html'),
            protocol:'file:'
        }),

        remoteMovieLink: remoteUrl + 'movie/',
        remoteEmbedLink: remoteUrl + 'embed/',
        userId: currentWindow.customOptions.userId,
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