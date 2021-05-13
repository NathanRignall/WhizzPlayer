exports.list = function (req, res, next) {
    // get the grids  info from the database
    db.query("SELECT GridID, GridName FROM Grids", function (error, results, fields) {
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
                location: "/api/app/grids.js/list-1",
                code: error.code,
                from: "mysql",
            });
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        }
    });
};

exports.create = function (req, res, next) {
    // get the info from json
    var json = req.body;
    // set the vars from post
    var GridName = json.GridName;
    // check the fields are present
    if (GridName) {
        // check the display name is not funny
        if (checkCharacters(GridName)) {
            var GridID = idgen.genterateGridID();
            // create the grid in the database
            db.query(
                "INSERT INTO Grids SET GridID = ?, GridName = ?",
                [GridID, validator.trim(GridName)],
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
                            location: "/api/account/grids.js/create-1",
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
                message: "Grid name contains invalid characters",
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
    var GridID = req.params.gridid;
    // get indvidual cue from database
    db.query("SELECT GridID, GridName FROM Grids WHERE GridID = ?", [GridID], function (error, results, fields) {
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
                res.status(400).json({
                    message: "Grid not found",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/app/grids.js/info-1",
                code: error.code,
                from: "mysql",
            });
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        }
    });
};

exports.edit = function (req, res, next) {
    // get req parms
    var GridID = req.params.gridid;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var GridName = json.GridName;
    // check the fields are present
    if (GridName) {
        // check the display name is not funny
        if (checkCharacters(GridName)) {
            // update a grid in the database
            db.query(
                "UPDATE Grids SET GridName = ? WHERE GridID = ?",
                [validator.trim(GridName), GridID],
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
                            res.status(400).json({
                                message: "Grid not found",
                                reqid: res.locals.reqid,
                            });
                        }
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/grids.js/edit-1",
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
                message: "Grid name contains invalid characters",
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
    var GridID = req.params.gridID;
    // delete the grid from db
    db.query("DELETE FROM Grids WHERE GridID = ?", [GridID], function (error, results, fields) {
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
                res.status(400).json({
                    message: "Grid not found",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/account/grids.js/delete-1",
                code: error.code,
                from: "mysql",
            });
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        }
    });
};

exports.itemsList = function (req, res, next) {
    // get req params
    var GridID = req.params.gridid;
    // get indvidual cue from database
    db.query(
        "SELECT GridID, GridName, Layout FROM Grids WHERE GridID = ?",
        [GridID],
        function (error, results1, fields) {
            // check if successful
            if (!error) {
                // retun the correct vars
                if (results1.length > 0) {
                    // retun the correct vars
                    db.query(
                        "SELECT GridItems.GridItemID, GridItems.GridItemName, GridItems.GridItemColour, Tracks.TrackID, Tracks.TrackName FROM GridItems INNER JOIN Tracks ON Tracks.TrackID = GridItems.TrackID WHERE GridItems.GridID = ?",
                        [GridID],
                        function (error, results2, fields) {
                            // check if successful
                            if (!error) {
                                // retun the correct vars
                                res.status(200).json({
                                    payload: {
                                        grid: results1[0],
                                        items: results2,
                                    },
                                    message: "okay",
                                    reqid: res.locals.reqid,
                                });
                            } else {
                                // retun the correct vars
                                res.locals.errors.push({
                                    location: "/api/app/grids.js/itemInfo-1",
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
                        message: "Grid not found",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/app/grids.js/itemInfo-2",
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

exports.itemsCreate = function (req, res, next) {
    // get req params
    var GridID = req.params.gridid;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var GridItemName = json.GridItemName;
    var GridItemColour = json.GridItemColour;
    var TrackID = json.TrackID;
    // check the fields are present
    if (GridItemName && GridItemColour && TrackID) {
        // check the display name is not funny
        if (checkCharacters(GridItemName)) {
            var GridItemID = idgen.genterateGridItemID();
            // create the cue in the database
            db.query(
                "INSERT INTO GridItems SET GridItemID = ?, GridItemName = ?, GridItemColour = ?, TrackID = ?, GridID = ?",
                [GridItemID, validator.trim(GridItemName), GridItemColour, TrackID, GridID],
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
                            location: "/api/account/cues.js/itemCreate-1",
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
                message: "Grid item name contains invalid characters",
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

exports.itemsEdit = function (req, res, next) {
    // get req parms
    var GridItemID = req.params.itemid;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var GridItemName = json.GridItemName;
    var GridItemColour = json.GridItemColour;
    var TrackID = json.TrackID;
    // check the fields are present
    if (GridName) {
        // check the display name is not funny
        if (checkCharacters(GridName)) {
            // update a grid in the database
            db.query(
                "UPDATE Grids SET GridItemName = ?, GridItemColour = ?, TrackID = ?, WHERE GridItemID = ?",
                [validator.trim(GridItemName), GridItemColour, TrackID, GridID],
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
                            res.status(400).json({
                                message: "Grid not found",
                                reqid: res.locals.reqid,
                            });
                        }
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/grids.js/itemsEdit-1",
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
                message: "Grid name contains invalid characters",
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

exports.itemsDelete = function (req, res, next) {
    // get req parms
    var GridItemID = req.params.itemid;
    // delete the grid from db
    db.query("DELETE FROM GridItems WHERE GridItemID = ?", [GridItemID], function (error, results, fields) {
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
                res.status(400).json({
                    message: "Grid item not found",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/account/grids.js/itemsDelete-1",
                code: error.code,
                from: "mysql",
            });
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        }
    });
};

exports.layout = async function (req, res, next) {
    // get req params
    var GridID = req.params.gridID;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var Layout = json.layout;
    // check the fields are present
    if (Layout) {
        // update the laylout
        db.query("UPDATE Grids SET Layout = ? WHERE GridID = ?", [Layout, GridID], function (error, results, fields) {
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
                    res.status(400).json({
                        message: "Grid not found",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/account/grids.js/layout-1",
                    code: error.code,
                    from: "mysql",
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
        res.status(400).json({
            message: "Missing input values",
            reqid: res.locals.reqid,
        });
    }
};
