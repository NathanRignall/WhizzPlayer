// load the dependancies
var axios = require("axios");

// set constants
const urlPlay = process.env.BACKEND_URL + "/play/";
const urlHalt = process.env.BACKEND_URL + "/halt/";

exports.track = function (req, res, next) {
    // get req parms
    var TrackID = req.params.trackid;
    // grab info about track from db
    db.query("SELECT TrackID, TrackName FROM Tracks WHERE TrackID = ?", [TrackID], function (error, results, fields) {
        // check if successful
        if (!error) {
            // check if the track actually exists in the system
            if (results.length == 1) {
                // http call to backend
                axios
                    .post(urlPlay, results[0])
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
                    message: "Track not found",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/app/play.js/track-3",
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
