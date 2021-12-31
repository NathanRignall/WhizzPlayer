// load the dependancies
const axios = require("axios");

// set constants
const urlVersionStatus = process.env.BACKEND_URL + "/status/version";

exports.info = function (req, res, next) {
    // get the time
    var time = new Date().getTime();
    var timeNow = new Date(time).toISOString().slice(0, 19).replace("T", " ");

    // make request to backend
    axios
        .get(urlVersionStatus)
        .then((response) => {
            // retun the correct vars
            res.status(200).json({
                message: "okay",
                payload: {
                    api: {
                        alive: true,
                        version: process.env.API_VERSION,
                    },
                    back: response.data.payload,
                    time: timeNow,
                },
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            if (error.response) {
                // catch error in response
                if (error.response.status == 400) {
                    // retun the correct vars
                    res.status(200).json({
                        message: "okay",
                        payload: {
                            api: {
                                alive: true,
                                version: process.env.API_VERSION,
                            },
                            back: {
                                alive: false,
                            },
                            time: timeNow,
                        },
                        reqid: res.locals.reqid,
                    });
                } else {
                    res.locals.errors.push(error.response.data.errors);
                    // retun the correct vars
                    res.status(200).json({
                        message: "okay",
                        payload: {
                            api: {
                                alive: true,
                                version: process.env.API_VERSION,
                            },
                            back: {
                                alive: false,
                            },
                            time: timeNow,
                        },
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
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    payload: {
                        api: {
                            alive: true,
                            version: process.env.API_VERSION,
                        },
                        back: {
                            alive: false,
                        },
                        time: timeNow,
                    },
                    reqid: res.locals.reqid,
                });
            } else {
                // actual axios error
                res.locals.errors.push({
                    location: "/api/app/play.js/track-2",
                    code: error.code,
                    from: "axios",
                });
                // retun the correct vars
                console.log(response);
                res.status(200).json({
                    message: "okay",
                    payload: {
                        api: {
                            alive: true,
                            version: process.env.API_VERSION,
                        },
                        back: {
                            alive: false,
                        },
                        time: timeNow,
                    },
                    reqid: res.locals.reqid,
                });
            }
        });
};
