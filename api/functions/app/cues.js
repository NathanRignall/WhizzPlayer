exports.temp = function (req, res, next) {
    res.send("temp");
};

exports.list = function (req, res, next) {
    // get the tracks info from the database
    db.query(
        "SELECT Cues.CueID, Cues.CueName, Cues.PlayTime, Cues.Repeats, Cues.RepeatMonday, Cues.RepeatTuesday, Cues.RepeatWednesday,  Cues.RepeatThursday, Cues.RepeatFriday, Cues.RepeatSaturday, Cues.RepeatSunday, Cues.Enabled, Tracks.TrackID, Tracks.TrackName FROM Cues INNER JOIN Tracks ON Tracks.TrackID = Cues.TrackID",
        function (error, results, fields) {
            // check if successful
            if (!error) {
                // retun the correct vars
                res.status(200).json({
                    payload: results,
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/app/cues.js/list-1",
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

exports.create = function (req, res, next) {
    // get the info from json
    var json = req.body;
    // set the vars from post
    var CueName = json.CueName;
    var TrackID = json.TrackID;
    var PlayTime = json.PlayTime;
    var Repeats = json.Repeats ? json.Repeats : false;
    var RepeatMonday = json.RepeatMonday ? json.RepeatMonday : false;
    var RepeatTuesday = json.RepeatTuesday ? json.RepeatTuesday : false;
    var RepeatWednesday = json.RepeatWednesday ? json.RepeatWednesday : false;
    var RepeatThursday = json.RepeatThursday ? json.RepeatThursday : false;
    var RepeatFriday = json.RepeatFriday ? json.RepeatFriday : false;
    var RepeatSaturday = json.RepeatSaturday ? json.RepeatSaturday : false;
    var RepeatSunday = json.RepeatSunday ? json.RepeatSunday : false;
    var Enabled = json.Enabled ? json.Enabled : true;
    // check the fields are present
    if (CueName && TrackID && PlayTime) {
        // check the display name is not funny
        if (checkCharacters(CueName)) {
            var CueID = idgen.genterateCueID();
            db.query(
                "INSERT INTO Cues SET CueID = ?, CueName = ?, TrackID = ?, PlayTime = ?, Repeats = ?, RepeatMonday = ?, RepeatTuesday = ?, RepeatWednesday = ?,  RepeatThursday = ?, RepeatFriday = ?, RepeatSaturday = ?, RepeatSunday = ?, Enabled = ?",
                [
                    CueID,
                    validator.trim(CueName),
                    TrackID,
                    PlayTime,
                    Repeats,
                    RepeatMonday,
                    RepeatTuesday,
                    RepeatWednesday,
                    RepeatThursday,
                    RepeatFriday,
                    RepeatSaturday,
                    RepeatSunday,
                    Enabled,
                ],
                function (error, results, fields) {
                    // check if sucessfull
                    if (!error) {
                        // retun the correct vars
                        res.status(200).json({
                            message: "okay",
                            reqid: res.locals.reqid,
                        });
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/cues.js/create-1",
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
        } else {
            // retun the correct vars
            res.status(400).json({
                message: "Display name contains invalid characters",
                reqid: res.locals.reqid,
            });
        }
    } else {
        // retun the correct vars
        res.status(400).json({
            message: "Missing input values",
            reqid: res.locals.reqid,
        });
    }
};

exports.info = function (req, res, next) {
    // get req params
    var CueID = req.params.cueid;
    // get the tracks info from the database
    db.query(
        "SELECT Cues.CueID, Cues.CueName, Cues.PlayTime, Cues.Repeats, Cues.RepeatMonday, Cues.RepeatTuesday, Cues.RepeatWednesday,  Cues.RepeatThursday, Cues.RepeatFriday, Cues.RepeatSaturday, Cues.RepeatSunday, Cues.Enabled, Tracks.TrackID, Tracks.TrackName FROM Cues INNER JOIN Tracks ON Tracks.TrackID = Cues.TrackID WHERE CueID = ?",
        [CueID],
        function (error, results, fields) {
            // check if successful
            if (!error) {
                // retun the correct vars
                if (results.length > 0) {
                    // retun the correct vars
                    res.status(200).json({
                        payload: results[0],
                        message: "okay",
                        reqid: res.locals.reqid,
                    });
                } else {
                    // retun the correct vars
                    res.status(404).json({
                        message: "Cue not found",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/app/cues.js/info-1",
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

exports.edit = function (req, res, next) {
    // get req parms
    var CueID = req.params.cueid;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var CueName = json.CueName;
    var TrackID = json.TrackID;
    var PlayTime = json.PlayTime;
    var Repeats = json.Repeats ? json.Repeats : false;
    var RepeatMonday = json.RepeatMonday ? json.RepeatMonday : false;
    var RepeatTuesday = json.RepeatTuesday ? json.RepeatTuesday : false;
    var RepeatWednesday = json.RepeatWednesday ? json.RepeatWednesday : false;
    var RepeatThursday = json.RepeatThursday ? json.RepeatThursday : false;
    var RepeatFriday = json.RepeatFriday ? json.RepeatFriday : false;
    var RepeatSaturday = json.RepeatSaturday ? json.RepeatSaturday : false;
    var RepeatSunday = json.RepeatSunday ? json.RepeatSunday : false;
    var Enabled = json.Enabled ? json.Enabled : true;
    // check the fields are present
    if (CueName && TrackID && PlayTime) {
        // check the display name is not funny
        if (checkCharacters(CueName)) {
            db.query(
                "UPDATE Cues SET CueName = ?, TrackID = ?, PlayTime = ?, Repeats = ?, RepeatMonday = ?, RepeatTuesday = ?, RepeatWednesday = ?,  RepeatThursday = ?, RepeatFriday = ?, RepeatSaturday = ?, RepeatSunday = ?, Enabled = ? WHERE CueID = ?",
                [
                    validator.trim(CueName),
                    TrackID,
                    PlayTime,
                    Repeats,
                    RepeatMonday,
                    RepeatTuesday,
                    RepeatWednesday,
                    RepeatThursday,
                    RepeatFriday,
                    RepeatSaturday,
                    RepeatSunday,
                    Enabled,
                    CueID,
                ],
                function (error, results, fields) {
                    // check if sucessfull
                    if (!error) {
                        // retun the correct vars
                        if (results.affectedRows > 0) {
                            // retun the correct vars
                            res.status(200).json({
                                message: "okay",
                                reqid: res.locals.reqid,
                            });
                        } else {
                            // retun the correct vars
                            res.status(404).json({
                                message: "Cue not found",
                                reqid: res.locals.reqid,
                            });
                        }
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/cues.js/edit-1",
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
        } else {
            // retun the correct vars
            res.status(400).json({
                message: "Display name contains invalid characters",
                reqid: res.locals.reqid,
            });
        }
    } else {
        // retun the correct vars
        res.status(400).json({
            message: "Missing input values",
            reqid: res.locals.reqid,
        });
    }
};

exports.delete = function (req, res, next) {
    // get req parms
    var CueID = req.params.cueid;
    // delete the track from db
    db.query(
        "DELETE FROM Cues WHERE CueID = ?",
        [CueID],
        function (error, results, fields) {
            // check if sucessfull
            if (!error) {
                if (results.affectedRows > 0) {
                    // retun the correct vars
                    res.status(200).json({
                        message: "okay",
                        reqid: res.locals.reqid,
                    });
                } else {
                    // retun the correct vars
                    res.status(404).json({
                        message: "Cue not found",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/account/cues.js/delete-1",
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
