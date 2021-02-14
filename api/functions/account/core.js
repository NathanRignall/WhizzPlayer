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
            if (validator.isStrongPassword(Password, { minSymbols: 0 })) {
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
                            res.locals.success = true;
                            // success
                            res.locals.code = 100;
                            res.json(responseFormat(res));
                        } else {
                            // check if the user already exists on the system
                            if (error.code == "ER_DUP_ENTRY") {
                                // retun the correct vars
                                res.locals.success = false;
                                // user already exists with email
                                res.locals.code = 213;
                                res.json(responseFormat(res));
                            } else {
                                // if acually an error and push the error
                                res.locals.errors.push({
                                    code: error.code,
                                    from: "mysql",
                                });
                                // retun the correct vars
                                res.locals.success = false;
                                // server error
                                res.locals.code = 500;
                                res.json(responseFormat(res));
                            }
                        }
                    }
                );
            } else {
                // retun the correct vars
                res.locals.success = false;
                // password not secure
                res.locals.code = 212;
                res.json(responseFormat(res));
            }
        } else {
            // retun the correct vars
            res.locals.success = false;
            // manformed inputs
            res.locals.code = 211;
            res.json(responseFormat(res));
        }
    } else {
        // retun the correct vars
        res.locals.success = false;
        // missing inputs
        res.locals.code = 210;
        res.json(responseFormat(res));
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
                    if (results.length) {
                        // check the password against database
                        if (bcrypt.compareSync(Password, results[0].Password)) {
                            // login the user
                            req.session.UserID = results[0].UserID;
                            req.session.Email = results[0].Email;
                            req.session.DisplayName = results[0].DisplayName;
                            req.session.Access = results[0].Access;
                            // retun the correct vars
                            res.locals.success = true;
                            // success
                            res.locals.code = 100;
                            res.json(responseFormat(res));
                        } else {
                            // retun the correct vars
                            res.locals.success = false;
                            // password incorrect
                            res.locals.code = 215;
                            res.json(responseFormat(res));
                        }
                    } else {
                        // retun the correct vars
                        res.locals.success = false;
                        // user does not exist
                        res.locals.code = 214;
                        res.json(responseFormat(res));
                    }
                } else {
                    // if acually an error and push the error
                    res.locals.errors.push({
                        code: error.code,
                        from: "mysql",
                    });
                    // retun the correct vars
                    res.locals.success = false;
                    // server error
                    res.locals.code = 500;
                    res.json(responseFormat(res));
                }
            }
        );
    } else {
        res.locals.success = false;
        // missing inputs
        res.locals.code = 210;
        res.json(responseFormat(res));
    }
};

exports.info = function (req, res, next) {
    res.send("no");
};

exports.infoUpdate = function (req, res, next) {
    res.send("no");
};
