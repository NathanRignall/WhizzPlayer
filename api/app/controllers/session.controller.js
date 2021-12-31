// load the dependancies
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// load the db
const db = require("../models");
const User = db.users;

// return if the system is in setup mode or not
exports.setup = function (req, res, next) {
    if (nconf.get("setup")) {
        // retun the correct vars
        res.status(200).json({
            message: "true",
            reqid: res.locals.reqid,
        });
    } else {
        // retun the correct vars
        res.status(200).json({
            message: "false",
            reqid: res.locals.reqid,
        });
    }
};

// register first user on system
exports.register = function (req, res, next) {
    // get the info from json
    const json = req.body;

    // set the vars from post
    const email = json.email;
    const name = json.name;
    const password = json.password;

    // first check if the system is in setup mode
    if (!nconf.get("setup")) {
        // retun the correct vars
        return res.status(400).json({
            message: "System is not in setup mode",
            reqid: res.locals.reqid,
        });
    }

    // check if email is present
    if (!email) {
        // retun the correct vars
        return res.status(400).json({
            message: "Email input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if email is an email
    if (!validator.isEmail(email)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Email provided is not an email address",
            reqid: res.locals.reqid,
        });
    }

    // check if name is present
    if (!name) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if name characters are valid
    if (!checkCharacters(name)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name provided contains invalid characters",
            reqid: res.locals.reqid,
        });
    }

    // check if password is present
    if (!password) {
        // retun the correct vars
        return res.status(400).json({
            message: "Password input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if password is secure
    if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
        // retun the correct vars
        return res.status(400).json({
            message: "Password provided is not secure enough",
            reqid: res.locals.reqid,
        });
    }

    // hash the password
    const hash = bcrypt.hashSync(password, 10);

    // create uuid
    const id = crypto.randomUUID();

    // create user
    const user = {
        id: id,
        email: email,
        name: name,
        hash: hash,
        access: 10,
    };

    // Create user in the database
    User.create(user)
        .then((data) => {
            // put out of setup mode
            nconf.set("setup", false);
            nconf.save(configSave);

            // login the user by storing data to session
            req.session.user = {
                id: data.id,
                email: data.email,
                name: data.name,
                access: data.access,
            };

            // retun the correct vars
            res.status(200).json({
                payload: req.session.user,
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "session.controller.register.1",
                code: error.code,
                message: error.message || "Some error occurred while creating the user",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// login to system
exports.login = function (req, res, next) {
    // get the info from json
    const json = req.body;

    // set the vars from post
    const email = json.email;
    const password = json.password;

    // check if email is present
    if (!email) {
        // retun the correct vars
        return res.status(400).json({
            message: "Email input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if password is present
    if (!password) {
        // retun the correct vars
        return res.status(400).json({
            message: "Password input value missing",
            reqid: res.locals.reqid,
        });
    }

    User.findOne({
        where: {
            email: email,
        },
    })
        .then((data) => {
            // check if the user exists
            if (data != null) {
                // store the hash to var
                const hash = data.hash;

                // check the password matches hash
                if (bcrypt.compareSync(password, hash)) {
                    // login the user by storing data to session
                    req.session.user = {
                        id: data.id,
                        email: data.email,
                        name: data.name,
                        access: data.access,
                    };

                    // retun the correct vars
                    res.status(200).json({
                        payload: req.session.user,
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
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "session.controller.login.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the user",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// get info on current logged in user
exports.info = function (req, res, next) {
    // return the correct vars
    res.status(200).json({
        payload: req.session.user,
        message: "okay",
        reqid: res.locals.reqid,
    });
};

// update logged in user info
exports.update = function (req, res, next) {
    // get the user id from session
    const id = req.session.user.id;

    // get the info from json
    const json = req.body;

    // set the vars from post
    const email = json.email;
    const name = json.name;

    // check if email is present
    if (!email) {
        // retun the correct vars
        return res.status(400).json({
            message: "Email input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if email is an email
    if (!validator.isEmail(email)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Email provided is not an email address",
            reqid: res.locals.reqid,
        });
    }

    // check if name is present
    if (!name) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if name characters are valid
    if (!checkCharacters(name)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name provided contains invalid characters",
            reqid: res.locals.reqid,
        });
    }

    // create user update
    const user = {
        email: email,
        name: name,
    };

    // update the user in the database
    User.update(user, {
        where: {
            id: id,
        },
    })
        .then((number) => {
            // check if update worked
            if (number == 1) {
                // update the user info
                req.session.user.email = email;
                req.session.user.name = name;

                // retun the correct vars
                res.status(200).json({
                    payload: req.session.user,
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // push the error to buffer
                res.locals.errors.push({
                    location: "session.controller.update.1",
                    code: "no-update",
                    message: "User not found during update",
                    from: "manual",
                });

                // return the correct vars
                res.status(500).json({
                    message: "Server error",
                    errors: res.locals.errors,
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "session.controller.update.2",
                code: error.code,
                message: error.message || "Some error occurred while updating the user",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// reset user password
exports.password = function (req, res, next) {
    // get the user id from session
    const userid = req.session.user.id;

    // get the info from json
    const json = req.body;

    // set the vars from post
    const password = json.password;
    const newPassword = json.newPassword;

    // check if password is present
    if (!password) {
        // retun the correct vars
        return res.status(400).json({
            message: "Password input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if password is present
    if (!newPassword) {
        // retun the correct vars
        return res.status(400).json({
            message: "New password input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if new password is secure
    if (!validator.isStrongPassword(newPassword, { minSymbols: 0 })) {
        // retun the correct vars
        return res.status(400).json({
            message: "New password provided is not secure enough",
            reqid: res.locals.reqid,
        });
    }

    User.findOne({
        where: {
            id: userid,
        },
    })
        .then((data) => {
            // check if the user exists
            if (data != null) {
                // store the hash to var
                const hash = data.hash;

                // check the password matches hash
                if (bcrypt.compareSync(password, hash)) {
                    // hash the new password
                    const newHash = bcrypt.hashSync(password, 10);

                    // create user password update
                    const user = {
                        hash: newHash,
                    };

                    // update the user password in the database
                    User.update(user, {
                        where: {
                            id: userid,
                        },
                    })
                        .then((number) => {
                            // check if update worked
                            if (number == 1) {
                                // retun the correct vars
                                res.status(200).json({
                                    message: "okay",
                                    reqid: res.locals.reqid,
                                });
                            } else {
                                // push the error to buffer
                                res.locals.errors.push({
                                    location: "session.controller.password.1",
                                    code: "no-update",
                                    message: "User not found during update",
                                    from: "manual",
                                });

                                // return the correct vars
                                res.status(500).json({
                                    message: "Server error",
                                    errors: res.locals.errors,
                                    reqid: res.locals.reqid,
                                });
                            }
                        })
                        .catch((error) => {
                            // push the error to buffer
                            res.locals.errors.push({
                                location: "session.controller.password.2",
                                code: error.code,
                                message: error.message || "Some error occurred while updating the user",
                                from: "sequelize",
                            });

                            // return the correct vars
                            res.status(500).json({
                                message: "Server error",
                                errors: res.locals.errors,
                                reqid: res.locals.reqid,
                            });
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
        })
        .catch((err) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "session.controller.password.3",
                code: error.code,
                message: err.message || "Some error occurred while finding the user",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// logout of session
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
