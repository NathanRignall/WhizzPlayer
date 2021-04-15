exports.core = function (req, res, next) {
    // set the time vars for sql request
    var time = new Date().getTime();
    var timeNow = new Date(time).toISOString().slice(0, 19).replace("T", " ");
    var timeNowMinus = new Date(time - 60000).toISOString().slice(0, 19).replace("T", " ");
    // make the query to check if a song needs to be played
    db.query(
        "SELECT Cues.CueID, Cues.CueName, Cues.PlayTime, Tracks.TrackID, Tracks.TrackName FROM Cues INNER JOIN Tracks ON Tracks.TrackID = Cues.TrackID WHERE Cues.Enabled=1 AND Cues.Repeats=0 AND Cues.PlayTime > ? AND Cues.PlayTime <= ?",
        [timeNowMinus, timeNow],
        function (error, results, fields) {
            // check if successful
            if (!error) {
                // if there is a song to play
                if (results.length > 0) {
                    // retun the correct vars
                    res.status(200).json({
                        payload: results[0],
                        message: "play",
                        reqid: res.locals.reqid,
                    });
                } else {
                    res.status(404).json({
                        message: "no play",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/app/grab.js/core-1",
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
