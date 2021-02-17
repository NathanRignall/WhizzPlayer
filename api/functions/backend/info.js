exports.core = function (req, res, next) {
    var TrackID = req.params.trackid;
    db.query(
        "SELECT TrackID, TrackName, SongFile FROM Tracks WHERE TrackID = ?",
        [TrackID],
        function (error, results, fields) {
            // check if successful
            if (!error) {
                // check if the track actually exists in the system
                if (results.length == 1) {
                    // retun the correct vars
                    res.status(200);
                    res.json({
                        Success: true,
                        Response: results[0],
                        LogID: res.locals.logID,
                    });
                } else {
                    // retun the correct vars
                    res.status(200);
                    res.json({
                        Success: false,
                        Message: "Track does not exist",
                        LogID: res.locals.logID,
                    });
                }
            } else {
                // if acually an error - push the error
                res.locals.errors.push({
                    code: error.code,
                    from: "mysql",
                });
                // return the correct vars
                res.status(500);
                res.json({
                    Success: false,
                    Message: "Server Error",
                    Errors: res.locals.errors,
                    LogID: res.locals.logID,
                });
            }
        }
    );
};
