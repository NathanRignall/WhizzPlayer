// load the dependancies
var bcrypt = require("bcrypt");

exports.register = function (req, res, next) {
    // get the info from json
    var json = req.body;
    // set the vars from post
    var Email = json.Email;
    var DisplayName = json.DisplayName;
    var Password = json.Password;
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
                    "INSERT INTO Users SET UserID = ?, Email = ?, DisplayName = ?, Password = ?, Access = 1",
                    [
                        UserID,
                        validator.normalizeEmail(Email),
                        validator.trim(DisplayName),
                        Hash,
                    ],
                    function (error, results, fields) {
                        // check if sucessfull
                        if (!error) {
                            // login the user
                            req.session.UserID = UserID;
                            req.session.Email = Email;
                            req.session.DisplayName = DisplayName;
                            req.session.Access = 1;
                            // retun the correct vars
                            res.status(200).json({
                                message: "okay",
                                reqid: res.locals.reqid,
                            });
                        } else {
                            // check if the user already exists on the system
                            if (error.code == "ER_DUP_ENTRY") {
                                // retun the correct vars
                                res.status(409).json({
                                    message: "Email already used in account",
                                    reqid: res.locals.reqid,
                                });
                            } else {
                                // retun the correct vars
                                res.locals.errors.push({
                                    location: "/api/account/core.js/register-1",
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

exports.login = function (req, res, next) {
    // get info from json
    var json = req.body;
    // set the vars from post
    var Email = json.Email;
    var Password = json.Password;
    // check the fields are present and valid
    if (Email && Password) {
        // get the user info from the database
        db.query(
            "SELECT UserID, Email, DisplayName, Password, Access FROM Users WHERE Email = ? AND Enabled = 1",
            [Email],
            function (error, results, fields) {
                // check if successful
                if (!error) {
                    // check if a user was found
                    if (results.length == 1) {
                        // check the password against database
                        if (bcrypt.compareSync(Password, results[0].Password)) {
                            // login the user
                            req.session.UserID = results[0].UserID;
                            req.session.Email = results[0].Email;
                            req.session.DisplayName = results[0].DisplayName;
                            req.session.Access = results[0].Access;
                            // retun the correct vars
                            res.status(200).json({
                                message: "okay",
                                reqid: res.locals.reqid,
                            });
                        } else {
                            // retun the correct vars
                            res.status(401).json({
                                message: "Incorrect Password",
                                reqid: res.locals.reqid,
                            });
                        }
                    } else {
                        // retun the correct vars
                        res.status(401).json({
                            message: "User does not exist",
                            reqid: res.locals.reqid,
                        });
                    }
                } else {
                    // retun the correct vars
                    res.locals.errors.push({
                        location: "/api/account/core.js/login-1",
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
            message: "Missing input values",
            reqid: res.locals.reqid,
        });
    }
};

exports.info = function (req, res, next) {
    // get the user id from the existing session
    UserID = req.session.UserID;
    // get the user info from the database
    db.query(
        "SELECT Email, DisplayName, Access, Created, Modified FROM Users WHERE UserID = ?",
        [UserID],
        function (error, results, fields) {
            // check if successful
            if (!error) {
                // check if a user was found
                if (results.length == 1) {
                    // update the session vars
                    req.session.Email = results[0].Email;
                    req.session.DisplayName = results[0].DisplayName;
                    req.session.Access = results[0].Access;
                    // retun the correct vars
                    res.status(200).json({
                        payload: results[0],
                        message: "okay",
                        reqid: res.locals.reqid,
                    });
                } else {
                    // retun the correct vars
                    res.status(404).json({
                        message: "User not found",
                        reqid: res.locals.reqid,
                    });
                }
            } else {
                // retun the correct vars
                res.locals.errors.push({
                    location: "/api/account/core.js/info-1",
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

exports.infoUpdate = function (req, res, next) {
    // get the user id from the existing session
    UserID = req.session.UserID;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var Email = json.Email;
    var DisplayName = json.DisplayName;
    // check the fields are present and valid
    if (Email && DisplayName) {
        // check the email is and email display name is not funny
        if (validator.isEmail(Email) && checkCharacters(DisplayName)) {
            // update the user in the database
            db.query(
                "UPDATE Users SET Email = ?, DisplayName = ? WHERE UserID = ?",
                [
                    validator.normalizeEmail(Email),
                    validator.trim(DisplayName),
                    UserID,
                ],
                function (error, results, fields) {
                    // check if sucessfull
                    if (!error) {
                        // update the session vars in case of any changes
                        req.session.UserID = UserID;
                        req.session.Email = Email;
                        req.session.DisplayName = DisplayName;
                        req.session.Access = 1;
                        // retun the correct vars
                        res.status(200).json({
                            message: "okay",
                            reqid: res.locals.reqid,
                        });
                    } else {
                        // retun the correct vars
                        res.locals.errors.push({
                            location: "/api/account/core.js/infoUpdate-1",
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

exports.password = function (req, res, next) {
    // get the user id from the existing session
    UserID = req.session.UserID;
    // get the info from json
    var json = req.body;
    // set the vars from post
    var Password = json.Password;
    // check the fields are present and valid
    if (Password) {
        // check if the password is strong
        if (validator.isStrongPassword(Password, { minSymbols: 0 })) {
            // hash the password
            var Hash = bcrypt.hashSync(Password, 10);
            // update the user password in the database
            db.query(
                "UPDATE Users SET Password = ? WHERE UserID = ?",
                [Hash, UserID],
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
                            location: "/api/account/core.js/infoUpdate-1",
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
                message: "Password not secure",
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

exports.logout = function (req, res, next) {
    // destroy the session
    req.session.destroy(function (err) {
        // retun the correct vars
        res.status(200).json({
            message: "okay",
            reqid: res.locals.reqid,
        });
    });
};
