// load the dependancies
var axios = require("axios");

// set constants
const urlPlay = process.env.BACKEND_URL + "/play";
const urlHalt = process.env.BACKEND_URL + "/halt";
const urlPlayStatus = process.env.BACKEND_URL + "/status/play";

// load the db
const db = require("../models");
const Track = db.tracks;

// play a specific track given the id
exports.play = function (req, res, next) {
    // set req parms
    const id = req.params.trackid;

    /// get the user id from session
    const userId = req.session.user.id;

    // get the user name from session
    const userName = req.session.user.name;

    // grab info about track from db
    Track.findByPk(id)
        .then((data) => {
            if (data) {
                // get playback config
                const playback = nconf.get("playback");

                // check if playback is enabled
                if (playback.enabled) {
                    // add the volume to results
                    const track = {
                        id: data.id,
                        name: data.name,
                        volume: 80,
                        log: {
                            userId: userId,
                            userName: userName,
                        },
                    };

                    // http call to backend
                    axios
                        .post(urlPlay, track)
                        .then((response) => {
                            // retun the correct vars
                            res.status(200).json({
                                message: "okay",
                                reqid: res.locals.reqid,
                            });
                        })
                        .catch((error) => {
                            if (error.response) {
                                // catch error in response
                                if (error.response.status == 400) {
                                    res.status(400).json({
                                        message: error.response.data.message,
                                        reqid: res.locals.reqid,
                                    });
                                } else {
                                    res.locals.errors.push(error.response.data.errors);
                                    res.status(500).json({
                                        message: "Server error",
                                        errors: res.locals.errors,
                                        reqid: res.locals.reqid,
                                    });
                                }
                            } else if (error.request) {
                                // no response
                                res.locals.errors.push({
                                    location: "/api/app/play.js/track-1",
                                    code: error.code,
                                    from: "axios",
                                });
                                res.status(500).json({
                                    message: "Server error",
                                    errors: res.locals.errors,
                                    reqid: res.locals.reqid,
                                });
                            } else {
                                // actual axios error
                                res.locals.errors.push({
                                    location: "/api/app/play.js/track-2",
                                    code: error.code,
                                    from: "axios",
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
                        message: "Playback dissabled",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "Track not found",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "cue.controller.track.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the track.",
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

exports.halt = function (req, res, next) {
    // http call to backend
    axios
        .get(urlHalt)
        .then((response) => {
            // retun the correct vars
            res.status(200).json({
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            if (error.response) {
                // catch error in response
                if (error.response.status == 400) {
                    res.status(400).json({
                        message: error.response.data.message,
                        reqid: res.locals.reqid,
                    });
                } else {
                    res.locals.errors.push(error.response.data.errors);
                    res.status(500).json({
                        message: "Server error",
                        errors: res.locals.errors,
                        reqid: res.locals.reqid,
                    });
                }
            } else if (error.request) {
                // no response
                res.locals.errors.push({
                    location: "/api/app/play.js/halt-1",
                    code: error.code,
                    from: "axios",
                });
                res.status(500).json({
                    message: "Server error",
                    errors: res.locals.errors,
                    reqid: res.locals.reqid,
                });
            } else {
                // actual axios error
                res.locals.errors.push({
                    location: "/api/app/play.js/halt-2",
                    code: error.code,
                    from: "axios",
                });
                res.status(500).json({
                    message: "Server error",
                    errors: res.locals.errors,
                    reqid: res.locals.reqid,
                });
            }
        });
};

exports.status = function (req, res, next) {
    // make the axios request
    axios
        .get(urlPlayStatus)
        .then((response) => {
            // retun the correct vars
            res.status(200).json({
                payload: response.data.payload,
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            if (error.response) {
                // catch error in response
                if (error.response.status != 500) {
                    // not a server error
                    res.status(400).json({
                        message: error.response.data.message,
                        reqid: res.locals.reqid,
                    });
                } else {
                    // server error
                    res.locals.errors.push(error.response.data.errors);
                    res.status(500).json({
                        message: "Server error",
                        errors: res.locals.errors,
                        reqid: res.locals.reqid,
                    });
                }
            } else if (error.request) {
                // no response
                res.locals.errors.push({
                    location: "/api/app/status.js/playing-1",
                    code: error.code,
                    from: "axios",
                });
                res.status(500).json({
                    message: "Server error",
                    errors: res.locals.errors,
                    reqid: res.locals.reqid,
                });
            } else {
                // actual axios error
                res.locals.errors.push({
                    location: "/api/app/status.js/playing-2",
                    code: error.code,
                    from: "axios",
                });
                res.status(500).json({
                    message: "Server error",
                    errors: res.locals.errors,
                    reqid: res.locals.reqid,
                });
            }
        });
};
