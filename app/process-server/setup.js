"use strict";

var fs = require('fs');
var path = require('path');

function mkdirSyncIfNotExists(dirPath) {
    try {
        fs.mkdirSync(dirPath)
        return true;
    } catch (err) {
        //if (err.code !== 'EEXIST') throw err
        return false;
    }
}

/**
 * creates required directories on user's home
 * @param videosPath
 */
function checkFolders(videosPath) {
    const UPLOADS_PATH        = path.join(videosPath, "Prometeo360");
    const VIDEO_PATH          = path.join(UPLOADS_PATH, "video");
    const THUMBS_PATH         = path.join(UPLOADS_PATH, "thumbs");

    // check if prometeo dir exists
    mkdirSyncIfNotExists(UPLOADS_PATH);
    // check if video dir exists
    mkdirSyncIfNotExists(VIDEO_PATH);
    // check if video dir exists
    mkdirSyncIfNotExists(THUMBS_PATH);
}

/**
 *
 * @param videosPath
 */
function check(videosPath) {
    checkFolders(videosPath);
}

module.exports = {
    check: check
};