// load the dependancies
var axios = require("axios");

// set constants
const urlPlayStatus = "http://back:5000/status/play";
const urlSystemStatus = "http://back:5000/status/system";

exports.home = function (req, res, next) {
    // create the http promises
    const getPlayingData = axios.get(urlPlayStatus);
    const getStatusData = axios.get(urlSystemStatus);
    // create the mysql promise
    const getSystemLog = new Promise((resolve, reject) => {
        db.query("SELECT * FROM SystemLog", function (error, results, fields) {
            // check if successful
            if (!error) {
                resolve(results);
            } else {
                reject(new Error(error));
            }
        });
    });
    // promise controller
    Promise.allSettled([getPlayingData, getStatusData, getSystemLog]).then(
        (response) => {
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
                    message: "Error with sql request",
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
        }
    );
};

// curently unfinished
exports.all = function (req, res, next) {
    res.send("status all");
};
