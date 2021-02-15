var axios = require("axios");

var urlPlayStatus = "http://back/status/play";
var urlSystemStatus = "http://back/status/system";

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
                playingData = response[0].value.data;
            } else {
                playingData = { Success: false };
            }
            // if get system data sucessful
            if (response[1].status == "fulfilled") {
                statusData = response[1].value.data;
            } else {
                statusData = { Success: false };
            }
            // if get mysql data sucsessful
            if (response[2].status == "fulfilled") {
                logData = {
                    Success: true,
                    Data: response[2].value,
                };
            } else {
                logData = { Success: false };
            }
            // retun the correct vars
            res.locals.success = true;
            // return the response
            res.locals.response = {
                Playing: playingData,
                Status: statusData,
                SystemLog: logData,
            };
            // success
            res.locals.code = 100;
            res.json(responseFormat(res));
        }
    );
};

exports.all = function (req, res, next) {
    res.send("status all");
};
