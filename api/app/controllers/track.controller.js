// load the dependancies
const Lame = require("node-lame").Lame;
const crypto = require("crypto");
const FileType = require("file-type");
const fs = require("fs");
const path = require("path");

// set constants
const uploadPath = process.env.NODE_ENV == "production" ? "/uploads" : path.resolve(__dirname, "../../../uploads");
const tempUploadDir = uploadPath + "/temp/";
const uploadDir = uploadPath + "/save/";

// load the db
const db = require("../models");
const Track = db.tracks;

// get all tracks from the database.
exports.list = (req, res) => {
    Track.findAll()
        .then((data) => {
            // retun the correct vars
            res.status(200).json({
                payload: data,
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "track.controller.list.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the tracks",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// search tracks from the database.
exports.find = (req, res) => {
    // set req parms
    const find = req.query.find;

    // find the track in db
    Track.findAll({
        where: {
            name: {
                [db.Sequelize.Op.like]: `%${find}%`,
            },
        },
    })
        .then((data) => {
            // retun the correct vars
            res.status(200).json({
                payload: data,
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "track.controller.find.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the tracks",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// upload the file for a track
exports.upload = async function (req, res, next) {
    // generate a tempoary file id
    const tempFileID = crypto.randomBytes(20).toString("hex");

    // make sure a file was uploaded
    if (!req.file) {
        // retun the correct vars
        res.status(400).json({
            message: "No file attached",
            reqid: res.locals.reqid,
        });
    }

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
                // push the error to buffer
                res.locals.errors.push({
                    location: "track.controller.upload.1",
                    from: "save",
                    type: "couldn't save",
                });

                // retun the correct vars
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
                // push the error to buffer
                res.locals.errors.push({
                    location: "track.controller.upload.2",
                    from: "encode",
                    type: "couldn't encode",
                });

                // retun the correct vars
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
};

exports.create = function (req, res, next) {
    // get the info from json
    const json = req.body;

    // set the vars from post
    const name = json.name;
    const fileId = json.fileId;

    // check if name is present
    if (!name) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if name characters are valid
    if (!checkCharacters(name)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name provided contains invalid characters",
            reqid: res.locals.reqid,
        });
    }

    // check if name is present
    if (!fileId) {
        // retun the correct vars
        return res.status(400).json({
            message: "File input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check the file exists
    if (fs.existsSync(tempUploadDir + fileId)) {
        // create uuid
        const id = crypto.randomUUID();

        // move the file
        fs.rename(tempUploadDir + fileId, uploadDir + id, function (error) {
            if (!error) {
                // create track object
                const track = {
                    id: id,
                    name: name,
                };

                // Create track in the database
                Track.create(track)
                    .then((data) => {
                        // retun the correct vars
                        res.status(200).json({
                            payload: data,
                            message: "okay",
                            reqid: res.locals.reqid,
                        });
                    })
                    .catch((error) => {
                        // push the error to buffer
                        res.locals.errors.push({
                            location: "track.controller.create.1",
                            code: error.code,
                            message: error.message || "Some error occurred while creating the track.",
                            from: "sequelize",
                        });

                        // return the correct vars
                        res.status(500).json({
                            message: "Server error",
                            errors: res.locals.errors,
                            reqid: res.locals.reqid,
                        });
                    });
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "track.controller.create.2",
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
};
