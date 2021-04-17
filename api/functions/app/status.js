// load the dependancies
var axios = require("axios");

// set constants
const urlPlayStatus = process.env.BACKEND_URL + "/status/play";
const urlSystemStatus = process.env.BACKEND_URL + "/status/system";

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
                    res.status(error.response.status).json({
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

exports.logsBackend = function (req, res, next) {
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};

exports.home = function (req, res, next) {
    // create the http promises
    const getPlayingData = axios.get(urlPlayStatus);
    const getStatusData = axios.get(urlSystemStatus);
    // create the temp promise
    const getSystemLog = new Promise((resolve, reject) => {
        resolve("results");
    });
    // promise controller
    Promise.allSettled([getPlayingData, getStatusData, getSystemLog]).then((response) => {
        // if get play data successful
        if (response[0].status == "fulfilled") {
            // set vars if request is 200
            playingData = {
                payload: response[0].value.data.payload,
                code: response[0].value.status,
            };
        } else {
            if (response[0].reason.response) {
                // set vars if request is not 200
                playingData = {
                    payload: response[0].reason.response.data,
                    message: "Error with rquest to backend",
                    code: response[0].reason.response.status,
                };
            } else if (response[0].reason.request) {
                // no response from server
                playingData = {
                    message: "No response from backend server",
                    code: 500,
                };
            } else {
                // error with the axios request
                playingData = {
                    message: "Error sending request to backend",
                    code: 500,
                };
            }
        }

        // if get system data sucessful
        if (response[1].status == "fulfilled") {
            // set vars if request is 200
            statusData = {
                payload: response[1].value.data.payload,
                code: response[1].value.status,
            };
        } else {
            if (response[1].reason.response) {
                // set vars if request is not 200
                statusData = {
                    payload: response[1].reason.response.data,
                    message: "Error with rquest to backend",
                    code: response[1].reason.response.status,
                };
            } else if (response[1].reason.request) {
                // no response from server
                statusData = {
                    message: "No response from backend server",
                    code: 500,
                };
            } else {
                // error with the axios request
                statusData = {
                    message: "Error sending request to backend",
                    code: 500,
                };
            }
        }

        // if get mysql data sucsessful
        if (response[2].status == "fulfilled") {
            // set vars if request to mysql was successful
            logData = {
                payload: response[2].value,
                code: 200,
            };
        } else {
            // if there was an error with the mysql request
            statusData = {
                message: "Error with temp request",
                code: 500,
            };
        }

        // return the correct vars
        res.status(200).json({
            payload: {
                playing: playingData,
                status: statusData,
                systemLog: logData,
            },
            message: "okay",
            reqid: res.locals.reqid,
        });
    });
};

// curently unfinished
exports.all = function (req, res, next) {
    res.send("status all");
};
