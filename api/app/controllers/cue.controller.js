// load the dependancies
const crypto = require("crypto");

// load the db
const db = require("../models");
const Cue = db.cues;

// get all cues from the database.
exports.list = (req, res) => {
    Cue.findAll({ include: ["track"] })
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
                location: "cue.controller.list.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the cues.",
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

exports.create = function (req, res, next) {
    // get the info from json
    const json = req.body;

    // set the vars from post
    const name = json.name;
    const time = json.time;
    const repeat = json.hasOwnProperty("repeat") ? json.repeat : false;
    const repeatMonday = json.hasOwnProperty("repeatMonday") ? json.repeatMonday : false;
    const repeatTuesday = json.hasOwnProperty("repeatTuesday") ? json.repeatTuesday : false;
    const repeatWednesday = json.hasOwnProperty("repeatWednesday") ? json.repeatWednesday : false;
    const repeatThursday = json.hasOwnProperty("repeatThursday") ? json.repeatThursday : false;
    const repeatFriday = json.hasOwnProperty("repeatFriday") ? json.repeatFriday : false;
    const repeatSaturday = json.hasOwnProperty("repeatSaturday") ? json.repeatSaturday : false;
    const repeatSunday = json.hasOwnProperty("repeatSunday") ? json.repeatSunday : false;
    const enabled = json.hasOwnProperty("enabled") ? json.enabled : true;
    const trackId = json.trackId;

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

    // check if time is present
    if (!time) {
        // retun the correct vars
        return res.status(400).json({
            message: "Time input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if trackid is present
    if (!trackId) {
        // retun the correct vars
        return res.status(400).json({
            message: "TrackID input value missing",
            reqid: res.locals.reqid,
        });
    }

    // create uuid
    const id = crypto.randomUUID();

    // create cue
    const cue = {
        id: id,
        name: name,
        time: time,
        repeat: repeat,
        repeatMonday: repeatMonday,
        repeatTuesday: repeatTuesday,
        repeatWednesday: repeatWednesday,
        repeatThursday: repeatThursday,
        repeatFriday: repeatFriday,
        repeatSaturday: repeatSaturday,
        repeatSunday: repeatSunday,
        enabled: enabled,
        trackId: trackId,
    };

    // Create cue in the database
    Cue.create(cue)
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
                location: "cue.controller.create.1",
                code: error.code,
                message: error.message || "Some error occurred while creating the cue.",
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

// get specific cue from the database.
exports.info = (req, res) => {
    // get req params
    const id = req.params.id;

    // Find the specific cue
    Cue.findByPk(id, { include: ["tracks"] })
        .then((data) => {
            if (data) {
                // retun the correct vars
                res.status(200).json({
                    payload: data,
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "CueId invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "cue.controller.info.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the cue.",
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

// update cue from the database.
exports.edit = (req, res) => {
    // get req params
    const id = req.params.id;

    // get the info from json
    const json = req.body;

    // set the vars from post
    const name = json.name;
    const time = json.time;
    const repeat = json.hasOwnProperty("repeat") ? json.repeat : false;
    const repeatMonday = json.hasOwnProperty("repeatMonday") ? json.repeatMonday : false;
    const repeatTuesday = json.hasOwnProperty("repeatTuesday") ? json.repeatTuesday : false;
    const repeatWednesday = json.hasOwnProperty("repeatWednesday") ? json.repeatWednesday : false;
    const repeatThursday = json.hasOwnProperty("repeatThursday") ? json.repeatThursday : false;
    const repeatFriday = json.hasOwnProperty("repeatFriday") ? json.repeatFriday : false;
    const repeatSaturday = json.hasOwnProperty("repeatSaturday") ? json.repeatSaturday : false;
    const repeatSunday = json.hasOwnProperty("repeatSunday") ? json.repeatSunday : false;
    const enabled = json.hasOwnProperty("enabled") ? json.enabled : true;
    const trackId = json.trackId;

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

    // check if time is present
    if (!time) {
        // retun the correct vars
        return res.status(400).json({
            message: "Time input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if trackid is present
    if (!trackId) {
        // retun the correct vars
        return res.status(400).json({
            message: "TrackID input value missing",
            reqid: res.locals.reqid,
        });
    }

    // create cue
    const cue = {
        name: name,
        repeat: repeat,
        repeatMonday: repeatMonday,
        repeatTuesday: repeatTuesday,
        repeatWednesday: repeatWednesday,
        repeatThursday: repeatThursday,
        repeatFriday: repeatFriday,
        repeatSaturday: repeatSaturday,
        repeatSunday: repeatSunday,
        enabled: enabled,
        trackId: trackId,
    };

    // Find the specific cue
    Cue.update(cue, {
        where: {
            id: id,
        },
    })
        .then((number) => {
            if (number == 1) {
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "CueId invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((err) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "cue.controller.info.1",
                code: error.code,
                message: error.message || "Some error occurred while updating the cue.",
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

// delete cue from the database.
exports.delete = (req, res) => {
    // get req params
    const id = req.params.id;

    // Find the specific cue
    Cue.destroy({
        where: { id: id },
    })
        .then((number) => {
            if (number == 1) {
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "CueId invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((err) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "cue.controller.delete.1",
                code: error.code,
                message: error.message || "Some error occurred while deleting the cue.",
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
