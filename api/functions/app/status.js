var axios = require("axios");

var urlPlayStatus = "http://back:5000/status/play";
var urlSystemStatus = "http://back:5000/status/system";

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
            console.log(response[0].value);
            if (response[0].status == "fulfilled") {
                playingData = {
                    payload: response[0].value.data.payload,
                    code: response[0].value.status,
                };
            } else {
                if (response[0].reason.response) {
                    playingData = {
                        payload: response[0].reason.response.data,
                        code: response[0].reason.response.status.payload,
                    };
                } else if (response[0].reason.request) {
                    playingData = {
                        message: "server error 1",
                        code: 500,
                    };
                } else {
                    playingData = {
                        message: "server error 2",
                        code: 500,
                    };
                }
            }

            // if get system data sucessful
            if (response[1].status == "fulfilled") {
                statusData = {
                    payload: response[1].value.data.payload,
                    code: response[1].value.status,
                };
            } else {
                if (response[1].reason.response) {
                    statusData = {
                        payload: response[1].reason.response.data,
                        code: response[1].reason.response.status,
                    };
                } else if (response[1].reason.request) {
                    statusData = {
                        message: "server error 1",
                        code: 500,
                    };
                } else {
                    statusData = {
                        message: "server error 2",
                        code: 500,
                    };
                }
            }

            // if get mysql data sucsessful
            if (response[2].status == "fulfilled") {
                logData = {
                    payload: response[2].value,
                    code: 200,
                };
            } else {
                statusData = {
                    message: "sql error",
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

exports.all = function (req, res, next) {
    res.send("status all");
};
