var axios = require("axios");

var urlPlay = "http://back:5000/play/";

exports.track = function (req, res, next) {
    var TrackID = req.params.trackid;
    db.query(
        "SELECT TrackID, TrackName, SongFile FROM Tracks WHERE TrackID = ?",
        [TrackID],
        function (error, results, fields) {
            // check if successful
            if (!error) {
                // check if the track actually exists in the system
                if (results.length == 1) {
                    axios
                        .post(urlPlay, results[0])
                        .then((response) => {
                            if (response.status == 200) {
                                // retun the correct vars
                                res.status(200).json({
                                    message: "okay",
                                    reqid: res.locals.reqid,
                                });
                            } else {
                                // retun the correct vars
                                res.locals.errors.push(response.data.errors);
                                res.status(500).json({
                                    message: response.data.message,
                                    errors: res.locals.errors,
                                    reqid: res.locals.reqid,
                                });
                            }
                        })
                        .catch((error) => {
                            if (error.response) {
                                // Catch not 200 error
                                res.locals.errors.push(
                                    error.response.data.errors
                                );
                                res.status(500).json({
                                    message: error.response.data.message,
                                    errors: res.locals.errors,
                                    reqid: res.locals.reqid,
                                });
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
                    res.status(404).json({
                        message: "Track not found",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/app/play.js/track-2",
                    code: error.code,
                    from: "mysql",
                });
                res.status(500).json({
                    message: "Server error",
                    errors: res.locals.errors,
                    reqid: res.locals.reqid,
                });
            }
        }
    );
};
