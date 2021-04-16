// load the dependancies
const Lame = require("node-lame").Lame;
var crypto = require("crypto");
const FileType = require("file-type");
var fs = require("fs");
const path = require("path");

// set constants
const uploadPath = process.env.NODE_ENV == "production" ? "/uploads" : path.resolve(__dirname, "../../../uploads");
const tempUploadDir = uploadPath + "/temp/";
const uploadDir = uploadPath + "/save/";

exports.list = function (req, res, next) {
    // get the tracks info from the database
    db.query("SELECT TrackID, TrackName, Created, Modified FROM Tracks", function (error, results, fields) {
        // check if successful
        if (!error) {
            // retun the correct vars
            res.status(200).json({
                payload: results,
                message: "okay",
                reqid: res.locals.reqid,
            });
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/app/tracks.js/list-1",
                code: error.code,
                from: "mysql",
            });
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        }
    });
};

exports.search = function (req, res, next) {
    // set req parms
    var query = req.query.search;
    // check there was a query
    if (query) {
        db.query(
            "SELECT * FROM Tracks WHERE TrackName LIKE CONCAT(?,  '%') LIMIT 10",
            [query],
            function (error, results, fields) {
                // check if sucessfull
                if (!error) {
                    if (results.length > 0) {
                        // retun the correct vars
                        res.status(200).json({
                            payload: results,
                            message: "okay",
                            reqid: res.locals.reqid,
                        });
                    } else {
                        // retun the correct vars
                        res.status(400).json({
                            payload: [],
                            message: "No track found",
                            reqid: res.locals.reqid,
                        });
                    }
                } else {
                    // retun the correct vars
                    res.locals.errors.push({
                        location: "/api/account/tracks.js/search-1",
                        code: error.code,
                        from: "mysql",
                    });
                    res.status(500).json({
                        message: "Server error",
                        errors: res.locals.errors,
                        reqid: res.locals.reqid,
                    });
                }
            }
        );
    } else {
        // retun the correct vars
        res.status(400).json({
            message: "No search query",
            reqid: res.locals.reqid,
        });
    }
};

exports.upload = async function (req, res, next) {
    // generate a tempoary file id
    var tempFileID = crypto.randomBytes(20).toString("hex");
    // make sure a file was uploaded
    if (req.file) {
        // get the file type of the file
        type = await FileType.fromBuffer(req.file.buffer);
        // check the file type was an mp3
        if (type.ext == "mp3" && type.mime == "audio/mpeg") {
            // write to a new file
            fs.writeFile(tempUploadDir + tempFileID, req.file.buffer, (error) => {
                if (!error) {
                    // retun the correct vars
                    res.status(200).json({
                        payload: {
                            id: tempFileID,
                            type: type,
                        },
                        message: "okay-mp3",
                        reqid: res.locals.reqid,
                    });
                } else {
                    // retun the correct vars
                    res.locals.errors.push({
                        location: "/api/app/tracks.js/upload-3",
                        from: "save",
                        type: "couldn't save",
                    });
                    res.status(400).json({
                        message: "Server error",
                        errors: res.locals.errors,
                        reqid: res.locals.reqid,
                    });
                }
            });
            // now check if the file is a wav
        } else if (type.ext == "wav" && type.mime == "audio/vnd.wave") {
            // setup the encoder
            const encoder = new Lame({
                output: tempUploadDir + tempFileID,
                bitrate: 192,
            }).setBuffer(req.file.buffer);
            // convert the wav into an mp3
            encoder
                .encode()
                .then(() => {
                    // retun the correct vars
                    res.status(200).json({
                        payload: {
                            id: tempFileID,
                            type: type,
                        },
                        message: "okay-wav",
                        reqid: res.locals.reqid,
                    });
                })
                .catch((error) => {
                    // retun the correct vars
                    res.locals.errors.push({
                        location: "/api/app/tracks.js/upload-2",
                        from: "encode",
                        type: "couldn't encode",
                    });
                    res.status(400).json({
                        message: "Server error",
                        errors: res.locals.errors,
                        reqid: res.locals.reqid,
                    });
                });
        } else {
            // retun the correct vars
            res.status(400).json({
                message: "Incorrect file type",
                type: type,
                reqid: res.locals.reqid,
            });
        }
    } else {
        // retun the correct vars
        res.status(400).json({
            message: "No file attached",
            reqid: res.locals.reqid,
        });
    }
};

exports.create = function (req, res, next) {
    // get the info from json
    var json = req.body;
    // set the vars from post
    var TrackName = json.TrackName;
    var FileID = json.FileID;
    // check the fields are present
    if (TrackName && FileID) {
        // check the display name is not funny
        if (checkCharacters(TrackName)) {
            // check the file exists
            if (fs.existsSync(tempUploadDir + FileID)) {
                // make the trackid
                var TrackID = idgen.genterateTrackID();
                // move the file
                fs.rename(tempUploadDir + FileID, uploadDir + TrackID, function (error) {
                    if (!error) {
                        // make the sql record
                        db.query(
                            "INSERT INTO Tracks SET TrackID = ?, TrackName = ?",
                            [TrackID, validator.trim(TrackName)],
                            function (error, results, fields) {
                                // check if sucessfull
                                if (!error) {
                                    // retun the correct vars
                                    res.status(200).json({
                                        message: "okay",
                                        reqid: res.locals.reqid,
                                    });
                                } else {
                                    // retun the correct vars
                                    res.locals.errors.push({
                                        location: "/api/account/tracks.js/create-2",
                                        code: error.code,
                                        from: "mysql",
                                    });
                                    res.status(500).json({
                                        message: "Server error",
                                        errors: res.locals.errors,
                                        reqid: res.locals.reqid,
                                    });
                                }
                            }
                        );
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/tracks.js/create-1",
                            code: "couln't move file",
                            from: "fs",
                        });
                        res.status(500).json({
                            message: "Server error",
                            errors: res.locals.errors,
                            reqid: res.locals.reqid,
                        });
                    }
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "Uploaded file not found",
                    errors: res.locals.errors,
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.status(400).json({
                message: "Track name contains invalid characters",
                reqid: res.locals.reqid,
            });
        }
    } else {
        // retun the correct vars
        res.status(400).json({
            message: "Missing input values",
            reqid: res.locals.reqid,
        });
    }
};

exports.edit = function (req, res, next) {
    // get req parms
    var TrackID = req.params.trackid;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var TrackName = json.TrackName;
    // check the fields are present
    if (TrackName) {
        // check the display name is not funny
        if (checkCharacters(TrackName)) {
            // edit the sql record
            db.query(
                "UPDATE Tracks SET TrackName = ? WHERE TrackID = ?",
                [validator.trim(TrackName), TrackID],
                function (error, results, fields) {
                    // check if sucessfull
                    if (!error) {
                        if (results.affectedRows > 0) {
                            // retun the correct vars
                            res.status(200).json({
                                message: "okay",
                                reqid: res.locals.reqid,
                            });
                        } else {
                            // retun the correct vars
                            res.status(400).json({
                                message: "Track not found",
                                reqid: res.locals.reqid,
                            });
                        }
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/tracks.js/edit-1",
                            code: error.code,
                            from: "mysql",
                        });
                        res.status(500).json({
                            message: "Server error",
                            errors: res.locals.errors,
                            reqid: res.locals.reqid,
                        });
                    }
                }
            );
        } else {
            // retun the correct vars
            res.status(400).json({
                message: "Track name contains invalid characters",
                reqid: res.locals.reqid,
            });
        }
    } else {
        // retun the correct vars
        res.status(400).json({
            message: "Missing input values",
            reqid: res.locals.reqid,
        });
    }
};

exports.delete = function (req, res, next) {
    // get req parms
    var TrackID = req.params.trackid;

    // check the track is not used in any cues
    db.query("SELECT CueID, CueName FROM Cues WHERE TrackID = ?", [TrackID], function (error, results, fields) {
        // check if sucessfull
        if (!error) {
            if (results.length == 0) {
                // not used by any tracks so proceed
                // delete the track from db
                db.query("DELETE FROM Tracks WHERE TrackID = ?", [TrackID], function (error, results, fields) {
                    // check if sucessfull
                    if (!error) {
                        if (results.affectedRows > 0) {
                            // delete the file in the system
                            fs.unlink(uploadDir + TrackID, (error) => {
                                if (error) {
                                    // retun the correct vars
                                    res.locals.errors.push({
                                        location: "/api/account/tracks.js/delete-1",
                                        code: "couln't delete file",
                                        from: "fs",
                                    });
                                    res.status(500).json({
                                        message: "Server error",
                                        errors: res.locals.errors,
                                        reqid: res.locals.reqid,
                                    });
                                } else {
                                    // retun the correct vars
                                    res.status(200).json({
                                        message: "okay",
                                        reqid: res.locals.reqid,
                                    });
                                }
                            });
                        } else {
                            // retun the correct vars
                            res.status(400).json({
                                message: "Track not found",
                                reqid: res.locals.reqid,
                            });
                        }
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/tracks.js/delete-2",
                            code: error.code,
                            from: "mysql",
                        });
                        res.status(500).json({
                            message: "Server error",
                            errors: res.locals.errors,
                            reqid: res.locals.reqid,
                        });
                    }
                });
            } else {
                // track is used in a cue so return list of cues
                // retun the correct vars
                res.status(400).json({
                    payload: results,
                    message: "Track used in cues",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/account/tracks.js/delete-3",
                code: error.code,
                from: "mysql",
            });
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        }
    });
};

exports.deleteForce = function (req, res, next) {
    // get req parms
    var TrackID = req.params.trackid;

    // delete the track from db
    db.query("DELETE FROM Tracks WHERE TrackID = ?", [TrackID], function (error, results, fields) {
        // check if sucessfull
        if (!error) {
            if (results.affectedRows > 0) {
                // delete the file in the system
                fs.unlink(uploadDir + TrackID, (error) => {
                    if (error) {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/tracks.js/deleteForce-1",
                            code: "couln't delete file",
                            from: "fs",
                        });
                        res.status(500).json({
                            message: "Server error",
                            errors: res.locals.errors,
                            reqid: res.locals.reqid,
                        });
                    } else {
                        // retun the correct vars
                        res.status(200).json({
                            message: "okay",
                            reqid: res.locals.reqid,
                        });
                    }
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "Track not found",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/account/tracks.js/deleteForce-2",
                code: error.code,
                from: "mysql",
            });
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        }
    });
};
