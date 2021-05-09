// load the dependancies
var bcrypt = require("bcrypt");

exports.list = function (req, res, next) {
    // get the cues info from the database
    db.query("SELECT UserID, Email, DisplayName, Access, Enabled FROM Users", function (error, results, fields) {
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
                location: "/api/settings/users.js/list-1",
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
    var Email = json.Email;
    var DisplayName = json.DisplayName;
    var Password = json.Password;
    var Access = json.hasOwnProperty("Access") ? json.Access : 0;
    var Enabled = json.hasOwnProperty("Enabled") ? json.Enabled : true;
    // check the fields are present and valid
    if (Email && DisplayName && Password) {
        // hash the password
        var Hash = bcrypt.hashSync(Password, 10);
        // check the email is and email display name is not funny
        if (validator.isEmail(Email) && checkCharacters(DisplayName)) {
            // check if the password is strong
            if (validator.isStrongPassword(Password, { minSymbols: 0 })) {
                // hash the password
                var Hash = bcrypt.hashSync(Password, 10);
                // get a user id
                var UserID = idgen.genterateUserID();
                // create the user in the database
                db.query(
                    "INSERT INTO Users SET UserID = ?, Email = ?, DisplayName = ?, Password = ?, Access = ?, Enabled = ?",
                    [UserID, validator.normalizeEmail(Email), validator.trim(DisplayName), Hash, Access, Enabled],
                    function (error, results, fields) {
                        if (!error) {
                            // retun the correct vars
                            res.status(200).json({
                                message: "okay",
                                reqid: res.locals.reqid,
                            });
                        } else {
                            if (error.code == "ER_DUP_ENTRY") {
                                // retun the correct vars
                                res.status(400).json({
                                    message: "Email already used in account",
                                    reqid: res.locals.reqid,
                                });
                            } else {
                                // retun the correct vars
                                res.locals.errors.push({
                                    location: "/api/settings/users.js/create-1",
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
                    }
                );
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "Password not secure",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.status(400).json({
                message: "Invalid email or display name",
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

exports.edit = function (req, res, next) {
    // get req parms
    var UserID = req.params.userid;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var Email = json.Email;
    var DisplayName = json.DisplayName;
    var Access = json.hasOwnProperty("Access") ? json.Access : 0;
    var Enabled = json.hasOwnProperty("Enabled") ? json.Enabled : true;
    // check the fields are present and valid
    if (Email && DisplayName) {
        // check the email is and email display name is not funny
        if (validator.isEmail(Email) && checkCharacters(DisplayName)) {
            // check if the password is strong
            // create the user in the database
            db.query(
                "UPDATE Users SET Email = ?, DisplayName = ?, Access = ?, Enabled = ? WHERE UserID = ?",
                [validator.normalizeEmail(Email), validator.trim(DisplayName), Access, Enabled, UserID],
                function (error, results, fields) {
                    if (!error) {
                        // retun the correct vars
                        if (results.affectedRows == 1) {
                            // retun the correct vars
                            res.status(200).json({
                                message: "okay",
                                reqid: res.locals.reqid,
                            });
                        } else {
                            // retun the correct vars
                            res.status(400).json({
                                message: "User not found",
                                reqid: res.locals.reqid,
                            });
                        }
                    } else {
                        res.locals.errors.push({
                            location: "/api/settings/users.js/edit-1",
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
                message: "Invalid email or display name",
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
    var UserID = req.params.userid;
    // delete the cue from db
    db.query("DELETE FROM Users WHERE UserID = ?", [UserID], function (error, results, fields) {
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
                    message: "User not found",
                    reqid: res.locals.reqid,
                });
            }
        } else {
            // retun the correct vars
            res.locals.errors.push({
                location: "/api/settings/users.js/delete-1",
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
