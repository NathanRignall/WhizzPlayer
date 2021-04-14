exports.checkTables = () => {
    checkSettingsTable();
};

const checkOtherTables = () => {
    checkTracksTable();
    checkCuesTable();
    checkUsersTable();
};

const checkSettingsTable = () => {
    // check the settings table is all okay and create/edit if not
    db.query("SHOW TABLES LIKE 'Settings'", function (error, results) {
        const SettingsTableVersion = "1";
        // check if an error occured
        if (error) {
            throw error;
        } else {
            // check if the table exists
            if (results.length == 0) {
                // doesnt exist so time to create
                db.beginTransaction(function (error) {
                    db.query(
                        "CREATE TABLE Settings (Feild varchar(255) UNIQUE,Data varchar(1024) NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (Feild));",
                        function (error, results, fields) {
                            if (error) {
                                return db.rollback(function () {
                                    throw error;
                                });
                            }
                            // okay
                            db.query(
                                "INSERT INTO Settings SET Feild = ?, Data = ?",
                                ["Setup", "true"],
                                function (error, results, fields) {
                                    if (error) {
                                        return db.rollback(function () {
                                            throw error;
                                        });
                                    }
                                    // okay
                                    db.query(
                                        "INSERT INTO Settings SET Feild = ?, Data = ?",
                                        ["SettingsTableVersion", SettingsTableVersion],
                                        function (error, results, fields) {
                                            if (error) {
                                                return db.rollback(function () {
                                                    throw error;
                                                });
                                            }
                                            // okay
                                            db.commit(function (err) {
                                                if (err) {
                                                    return db.rollback(function () {
                                                        throw error;
                                                    });
                                                }
                                                // okay
                                                console.log("Created Settings Table V" + SettingsTableVersion);
                                                checkOtherTables();
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            } else {
                // does exist no need to create
                //TODO: check the right version
                console.log("Settings table up to date V" + SettingsTableVersion);
                checkOtherTables();
            }
        }
    });
};

const checkTracksTable = () => {
    // check the tracks table is all okay and create/edit if not
    db.query("SHOW TABLES LIKE 'Tracks'", function (error, results) {
        const TracksTableVersion = "1";
        // check if an error occured
        if (error) {
            throw error;
        } else {
            // check if the table exists
            if (results.length == 0) {
                // doesnt exist so time to create
                db.beginTransaction(function (error) {
                    db.query(
                        "CREATE TABLE Tracks (TrackID BIGINT NOT NULL UNIQUE,TrackName varchar(255) NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (TrackID));",
                        function (error, results, fields) {
                            if (error) {
                                return db.rollback(function () {
                                    throw error;
                                });
                            }
                            // okay
                            db.query(
                                "INSERT INTO Settings SET Feild = ?, Data = ?",
                                ["TracksTableVersion", TracksTableVersion],
                                function (error, results, fields) {
                                    if (error) {
                                        if (error.code != "ER_DUP_ENTRY") {
                                            return db.rollback(function () {
                                                throw error;
                                            });
                                        }
                                        // okay but key already exists
                                        db.query(
                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                            [TracksTableVersion, "TracksTableVersion"],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        return db.rollback(function () {
                                                            throw error;
                                                        });
                                                    }
                                                }
                                                // okay
                                                db.commit(function (err) {
                                                    if (err) {
                                                        return db.rollback(function () {
                                                            throw error;
                                                        });
                                                    }
                                                    // okay
                                                    console.log("Created Tracks Table A V" + TracksTableVersion);
                                                });
                                            }
                                        );
                                    } else {
                                        // okay
                                        db.commit(function (err) {
                                            if (err) {
                                                return db.rollback(function () {
                                                    throw error;
                                                });
                                            }
                                            // okay
                                            console.log("Created Tracks Table V" + TracksTableVersion);
                                        });
                                    }
                                }
                            );
                        }
                    );
                });
            } else {
                // does exist no need to create
                //TODO: check the right version
                console.log("Tracks table up to date V" + TracksTableVersion);
            }
        }
    });
};

const checkCuesTable = () => {
    // check the cues table is all okay and create/edit if not
    db.query("SHOW TABLES LIKE 'Cues'", function (error, results) {
        const CuesTableVersion = "1";
        // check if an error occured
        if (error) {
            throw error;
        } else {
            // check if the table exists
            if (results.length == 0) {
                // doesnt exist so time to create
                db.beginTransaction(function (error) {
                    db.query(
                        "CREATE TABLE Cues (CueID BIGINT NOT NULL UNIQUE,CueName varchar(255) NOT NULL,TrackID BIGINT NOT NULL,PlayTime DATETIME NOT NULL,Repeats BOOLEAN NOT NULL,RepeatMonday BOOLEAN NOT NULL,RepeatTuesday BOOLEAN NOT NULL,RepeatWednesday BOOLEAN NOT NULL,RepeatThursday BOOLEAN NOT NULL,RepeatFriday BOOLEAN NOT NULL,RepeatSaturday BOOLEAN NOT NULL,RepeatSunday BOOLEAN NOT NULL,Enabled BOOLEAN NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (CueID),CONSTRAINT fk_Cues_Tracks_TrackID FOREIGN KEY (TrackID) REFERENCES Tracks(TrackID) ON DELETE CASCADE)",
                        function (error, results, fields) {
                            if (error) {
                                return db.rollback(function () {
                                    throw error;
                                });
                            }
                            // okay
                            db.query(
                                "INSERT INTO Settings SET Feild = ?, Data = ?",
                                ["CuesTableVersion", CuesTableVersion],
                                function (error, results, fields) {
                                    if (error) {
                                        if (error.code != "ER_DUP_ENTRY") {
                                            return db.rollback(function () {
                                                throw error;
                                            });
                                        }
                                        // okay but key already exists
                                        db.query(
                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                            [CuesTableVersion, "CuesTableVersion"],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        return db.rollback(function () {
                                                            throw error;
                                                        });
                                                    }
                                                }
                                                // okay
                                                db.commit(function (err) {
                                                    if (err) {
                                                        return db.rollback(function () {
                                                            throw error;
                                                        });
                                                    }
                                                    // okay
                                                    console.log("Created Cues Table A V" + CuesTableVersion);
                                                });
                                            }
                                        );
                                    } else {
                                        // okay
                                        db.commit(function (err) {
                                            if (err) {
                                                return db.rollback(function () {
                                                    throw error;
                                                });
                                            }
                                            // okay
                                            console.log("Created Cues Table V" + CuesTableVersion);
                                        });
                                    }
                                }
                            );
                        }
                    );
                });
            } else {
                // does exist no need to create
                //TODO: check the right version
                console.log("Cues table up to date V" + CuesTableVersion);
            }
        }
    });
};

const checkUsersTable = () => {
    // check the users table is all okay and create/edit if not
    db.query("SHOW TABLES LIKE 'Users'", function (error, results) {
        const UsersTableVersion = "1";
        // check if an error occured
        if (error) {
            throw error;
        } else {
            // check if the table exists
            if (results.length == 0) {
                // doesnt exist so time to create
                db.beginTransaction(function (error) {
                    db.query(
                        "CREATE TABLE Users (UserID BIGINT NOT NULL UNIQUE,Email varchar(255) COLLATE utf8_unicode_ci NOT NULL UNIQUE,DisplayName varchar(255) NOT NULL,Password varchar(2048) NOT NULL,Access int(1) NOT NULL,Enabled BOOLEAN NOT NULL DEFAULT True,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (UserID));",
                        function (error, results, fields) {
                            if (error) {
                                return db.rollback(function () {
                                    throw error;
                                });
                            }
                            // okay
                            db.query(
                                "INSERT INTO Settings SET Feild = ?, Data = ?",
                                ["UsersTableVersion", UsersTableVersion],
                                function (error, results, fields) {
                                    if (error) {
                                        return db.rollback(function () {
                                            throw error;
                                        });
                                    }

                                    if (error) {
                                        if (error.code != "ER_DUP_ENTRY") {
                                            return db.rollback(function () {
                                                throw error;
                                            });
                                        }
                                        // okay but key already exists
                                        db.query(
                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                            [UsersTableVersion, "UsersTableVersion"],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        return db.rollback(function () {
                                                            throw error;
                                                        });
                                                    }
                                                }
                                                // okay
                                                db.query(
                                                    "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                    ["true", "Setup"],
                                                    function (error, results, fields) {
                                                        if (error) {
                                                            return db.rollback(function () {
                                                                throw error;
                                                            });
                                                        }

                                                        // okay
                                                        db.commit(function (err) {
                                                            if (err) {
                                                                return db.rollback(function () {
                                                                    throw error;
                                                                });
                                                            }
                                                            // okay
                                                            console.log("Created Users Table A V" + UsersTableVersion);
                                                        });
                                                    }
                                                );
                                            }
                                        );
                                    } else {
                                        // okay
                                        db.query(
                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                            ["true", "Setup"],
                                            function (error, results, fields) {
                                                if (error) {
                                                    return db.rollback(function () {
                                                        throw error;
                                                    });
                                                }

                                                // okay
                                                db.commit(function (err) {
                                                    if (err) {
                                                        return db.rollback(function () {
                                                            throw error;
                                                        });
                                                    }
                                                    // okay
                                                    console.log("Created Users Table V" + UsersTableVersion);
                                                });
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    );
                });
            } else {
                // does exist no need to create
                //TODO: check the right version
                console.log("Users table up to date V" + UsersTableVersion);
            }
        }
    });
};
