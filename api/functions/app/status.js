// load the dependancies
var axios = require("axios");

// set constants
const urlPlayStatus = process.env.BACKEND_URL + "/status/play";
const urlSystemStatus = process.env.BACKEND_URL + "/status/system";

exports.api = function (req, res, next) {
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};

exports.back = function (req, res, next) {
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};

exports.playing = function (req, res, next) {
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

exports.logsPlayback = function (req, res, next) {
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};

exports.logsAPI = function (req, res, next) {
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};

exports.logsBack = function (req, res, next) {
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};
