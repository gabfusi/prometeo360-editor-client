"use strict";

const ipc = require("node-ipc");
const MoviesService = require('../services/MoviesService.js');
const RemotePublisherService = require('../services/RemotePublisherService.js');

module.exports = function (sharedConfig) {

    RemotePublisherService.init(sharedConfig.videosPath);

    /**
     * Movies list
     */
    ipc.server.on(
        'movies.list',
        function (data, socket) {

            MoviesService.getMovies(function (err, data) {

                if (err) {
                    return ipcSendError(socket, 'movies.list', err.message)
                }

                ipcSend(socket, 'movies.list', data)

            });
        }
    );

    /**
     * Movie get
     */
    ipc.server.on(
        'movies.get',
        function (data, socket) {

            MoviesService.getMovie(data.movie_id, function (err, data) {

                if (err) {
                    return ipcSendError(socket, 'movies.get', err.message)
                }

                ipcSend(socket, 'movies.get', data)

            });

        }
    );

    /**
     * Movie add
     */
    ipc.server.on(
        'movies.add',
        function (data, socket) {

            try {
                MoviesService.validateMovie(data);
            } catch (e) {
                return ipcSendError(socket, 'movies.add', e.message)
            }

            MoviesService.addMovie(data, function (err, movie_id) {

                if (err) {
                    return ipcSendError(socket, 'movies.add', err.message)
                }

                ipcSend(socket, 'movies.add', { movie_id: movie_id })

            });

        }
    );

    /**
     * Movie update
     */
    ipc.server.on(
        'movies.update',
        function (data, socket) {

            try {
                MoviesService.validateMovie(data);
            } catch (e) {
                return ipcSendError(socket, 'movies.update', e.message)
            }

            MoviesService.updateMovie(data.id, data, function (err, saved_movie) {

                if (err) {
                    return ipcSendError(socket, 'movies.update', err.message)
                }

                ipcSend(socket, 'movies.update', saved_movie)

            });

        }
    );

    /**
     * Movie delete
     */
    ipc.server.on(
        'movies.delete',
        function (data, socket) {

            MoviesService.deleteMovie(data.movie_id, function (err, data) {

                if (err) {
                    return ipcSendError(socket, 'movies.delete', err.message)
                }

                ipcSend(socket, 'movies.delete', data)

            });

        }
    );

    /**
     * Movie publish
     */
    ipc.server.on(
        'movies.publish',
        function (data, socket) {

            RemotePublisherService.onVideoUploaded((data) => {
              ipcSend(socket, 'videos.uploaded-remote', data)
            });

            MoviesService.getMovie(data.movie_id, function (err, data) {

                if (err) {
                    console.error(err);
                    return ipcSendError(socket, 'movies.publish', err.message)
                }

                RemotePublisherService.publishRequest(sharedConfig.userId, data, function(err, publishResponse) {

                    if(err) {
                        return ipcSendError(socket, 'movies.publish', err.message)
                    }

                    ipcSend(socket, 'movies.publish', publishResponse)

                });

            });

        }
    );

    /**
     * Movie unpublish
     */
    ipc.server.on(
        'movies.unpublish',
        function (data, socket) {

            MoviesService.getMovie(data.movie_id, function (err, data) {

                if (err) {
                    console.error(err);
                    return ipcSendError(socket, 'movies.unpublish', err.message)
                }

                // simply set published to false
                data.published = false;

                MoviesService.updateMovie(data.id, data, function (err, saved_movie) {

                    if (err) {
                        return ipcSendError(socket, 'movies.unpublish', err.message)
                    }

                    ipcSend(socket, 'movies.unpublish', saved_movie)

                });

            });

        }
    );

};

function ipcSend(socket, type, data) {

    ipc.server.emit(
        socket, type, {
            id: ipc.config.id,
            message: data
        }
    );
}

function ipcSendError(socket, type, error) {

    ipc.server.emit(
        socket, type, {
            id: ipc.config.id,
            message: { "error" : error }
        }
    );
}