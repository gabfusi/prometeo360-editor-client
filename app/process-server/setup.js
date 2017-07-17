"use strict";

var fs = require('fs');
var path = require('path');

/**
 * creates required directories
 * @param videosPath
 */
function checkFolders(config) {

    const DB_PATH             = path.join(config.dbPath, "lowdb");
    const UPLOADS_PATH        = config.userHome;
    const VIDEO_PATH          = path.join(UPLOADS_PATH, "video");
    const THUMBS_PATH         = path.join(UPLOADS_PATH, "thumbs");

    // check if db dir exists
    mkdirSyncIfNotExists(DB_PATH);
    // check if prometeo dir exists
    mkdirSyncIfNotExists(UPLOADS_PATH);
    // check if video dir exists
    mkdirSyncIfNotExists(VIDEO_PATH);
    // check if video dir exists
    mkdirSyncIfNotExists(THUMBS_PATH);

    // copy blank.png
    const blankSource = path.join(__dirname, '..', 'assets', 'blank.png');
    const blankDest = path.join(UPLOADS_PATH, 'blank.png');
    try{
        if (!fs.existsSync(blankDest)) {
            fs.createReadStream(blankSource).pipe(fs.createWriteStream(blankDest));
        }
    } catch (err) {
        console.error("Cannot create blank.png");
    }

}

/**
 *
 * @param videosPath
 */
function check(config) {
    checkFolders(config);
}


function mkdirSyncIfNotExists(dirPath) {
    try {
        fs.mkdirSync(dirPath)
    } catch (err) {
        console.error("Cannot create " + dirPath);
    }
}

module.exports = {
    check: check
};