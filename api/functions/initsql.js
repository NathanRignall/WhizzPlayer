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
                db.getConnection(function (error, conn) {
                    if (error) throw error;
                    conn.beginTransaction(function (error) {
                        conn.query(
                            "CREATE TABLE Settings (Feild varchar(255) UNIQUE,Data varchar(1024) NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (Feild));",
                            function (error, results, fields) {
                                if (error) {
                                    return conn.rollback(function () {
                                        throw error;
                                    });
                                }
                                // okay
                                conn.query(
                                    "INSERT INTO Settings SET Feild = ?, Data = ?",
                                    ["SettingsTableVersion", SettingsTableVersion],
                                    function (error, results, fields) {
                                        if (error) {
                                            return conn.rollback(function () {
                                                throw error;
                                            });
                                        }
                                        // okay
                                        conn.commit(function (err) {
                                            if (err) {
                                                return conn.rollback(function () {
                                                    throw error;
                                                });
                                            }
                                            // okay
                                            logger.info("Created Settings Table V" + SettingsTableVersion);
                                            checkOtherTables();
                                        });
                                    }
                                );
                            }
                        );
                    });
                });
            } else {
                // table does exist no need to create, instead check version
                db.query(
                    "SELECT Data FROM Settings WHERE Feild = ?",
                    ["SettingsTableVersion"],
                    function (error, results, fields) {
                        if (error) throw error;
                        // check the key was found
                        if (results.length == 1) {
                            // version matches
                            if (results[0].Data == SettingsTableVersion) {
                                logger.info("Settings table up to date V" + SettingsTableVersion);
                                checkOtherTables();
                            } else {
                                //TODO: upgrade version
                                logger.info("Settings table wrong version" + SettingsTableVersion);
                                throw error;
                            }
                        } else {
                            throw error;
                        }
                    }
                );
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
                db.getConnection(function (error, conn) {
                    if (error) throw error;
                    conn.beginTransaction(function (error) {
                        conn.query(
                            "CREATE TABLE Tracks (TrackID BIGINT NOT NULL UNIQUE,TrackName varchar(255) NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (TrackID));",
                            function (error, results, fields) {
                                if (error) {
                                    return conn.rollback(function () {
                                        throw error;
                                    });
                                }
                                // okay
                                conn.query(
                                    "INSERT INTO Settings SET Feild = ?, Data = ?",
                                    ["TracksTableVersion", TracksTableVersion],
                                    function (error, results, fields) {
                                        if (error) {
                                            if (error.code != "ER_DUP_ENTRY") {
                                                return conn.rollback(function () {
                                                    throw error;
                                                });
                                            }
                                            // okay but key already exists
                                            conn.query(
                                                "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                [TracksTableVersion, "TracksTableVersion"],
                                                function (error, results, fields) {
                                                    if (error) {
                                                        if (error.code != "ER_DUP_ENTRY") {
                                                            return conn.rollback(function () {
                                                                throw error;
                                                            });
                                                        }
                                                    }
                                                    // okay
                                                    conn.commit(function (err) {
                                                        if (err) {
                                                            return conn.rollback(function () {
                                                                throw error;
                                                            });
                                                        }
                                                        // okay
                                                        logger.info("Created Tracks Table A V" + TracksTableVersion);
                                                    });
                                                }
                                            );
                                        } else {
                                            // okay
                                            conn.commit(function (err) {
                                                if (err) {
                                                    return conn.rollback(function () {
                                                        throw error;
                                                    });
                                                }
                                                // okay
                                                logger.info("Created Tracks Table V" + TracksTableVersion);
                                            });
                                        }
                                    }
                                );
                            }
                        );
                    });
                });
            } else {
                // table does exist no need to create, instead check version
                db.query(
                    "SELECT Data FROM Settings WHERE Feild = ?",
                    ["TracksTableVersion"],
                    function (error, results, fields) {
                        if (error) throw error;
                        // check the key was found
                        if (results.length == 1) {
                            // version matches
                            if (results[0].Data == TracksTableVersion) {
                                logger.info("Tracks table up to date V" + TracksTableVersion);
                            } else {
                                //TODO: upgrade version
                                logger.info("Tracks table wrong version" + TracksTableVersion);
                                throw error;
                            }
                        } else {
                            throw error;
                        }
                    }
                );
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
                db.getConnection(function (error, conn) {
                    if (error) throw error;
                    conn.beginTransaction(function (error) {
                        conn.query(
                            "CREATE TABLE Cues (CueID BIGINT NOT NULL UNIQUE,CueName varchar(255) NOT NULL,TrackID BIGINT NOT NULL,PlayTime DATETIME NOT NULL,Repeats BOOLEAN NOT NULL,RepeatMonday BOOLEAN NOT NULL,RepeatTuesday BOOLEAN NOT NULL,RepeatWednesday BOOLEAN NOT NULL,RepeatThursday BOOLEAN NOT NULL,RepeatFriday BOOLEAN NOT NULL,RepeatSaturday BOOLEAN NOT NULL,RepeatSunday BOOLEAN NOT NULL,Enabled BOOLEAN NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (CueID),CONSTRAINT fk_Cues_Tracks_TrackID FOREIGN KEY (TrackID) REFERENCES Tracks(TrackID) ON DELETE CASCADE)",
                            function (error, results, fields) {
                                if (error) {
                                    return conn.rollback(function () {
                                        throw error;
                                    });
                                }
                                // okay
                                conn.query(
                                    "INSERT INTO Settings SET Feild = ?, Data = ?",
                                    ["CuesTableVersion", CuesTableVersion],
                                    function (error, results, fields) {
                                        if (error) {
                                            if (error.code != "ER_DUP_ENTRY") {
                                                return conn.rollback(function () {
                                                    throw error;
                                                });
                                            }
                                            // okay but key already exists
                                            conn.query(
                                                "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                [CuesTableVersion, "CuesTableVersion"],
                                                function (error, results, fields) {
                                                    if (error) {
                                                        if (error.code != "ER_DUP_ENTRY") {
                                                            return conn.rollback(function () {
                                                                throw error;
                                                            });
                                                        }
                                                    }
                                                    // okay
                                                    conn.commit(function (err) {
                                                        if (err) {
                                                            return conn.rollback(function () {
                                                                throw error;
                                                            });
                                                        }
                                                        // okay
                                                        logger.info("Created Cues Table A V" + CuesTableVersion);
                                                    });
                                                }
                                            );
                                        } else {
                                            // okay
                                            conn.commit(function (err) {
                                                if (err) {
                                                    return conn.rollback(function () {
                                                        throw error;
                                                    });
                                                }
                                                // okay
                                                logger.info("Created Cues Table V" + CuesTableVersion);
                                            });
                                        }
                                    }
                                );
                            }
                        );
                    });
                });
            } else {
                // table does exist no need to create, instead check version
                db.query(
                    "SELECT Data FROM Settings WHERE Feild = ?",
                    ["CuesTableVersion"],
                    function (error, results, fields) {
                        if (error) throw error;
                        // check the key was found
                        if (results.length == 1) {
                            // version matches
                            if (results[0].Data == CuesTableVersion) {
                                logger.info("Cues table up to date V" + CuesTableVersion);
                            } else {
                                //TODO: upgrade version
                                logger.info("Cues table wrong version" + CuesTableVersion);
                                throw error;
                            }
                        } else {
                            throw error;
                        }
                    }
                );
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
                db.getConnection(function (error, conn) {
                    if (error) throw error;
                    conn.beginTransaction(function (error) {
                        conn.query(
                            "CREATE TABLE Users (UserID BIGINT NOT NULL UNIQUE,Email varchar(255) COLLATE utf8_unicode_ci NOT NULL UNIQUE,DisplayName varchar(255) NOT NULL,Password varchar(2048) NOT NULL,Access int(1) NOT NULL,Enabled BOOLEAN NOT NULL DEFAULT True,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (UserID));",
                            function (error, results, fields) {
                                if (error) {
                                    return conn.rollback(function () {
                                        throw error;
                                    });
                                }
                                // okay
                                conn.query(
                                    "INSERT INTO Settings SET Feild = ?, Data = ?",
                                    ["UsersTableVersion", UsersTableVersion],
                                    function (error, results, fields) {
                                        if (error) {
                                            if (error.code != "ER_DUP_ENTRY") {
                                                return conn.rollback(function () {
                                                    throw error;
                                                });
                                            }
                                            // okay but key already exists
                                            conn.query(
                                                "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                [UsersTableVersion, "UsersTableVersion"],
                                                function (error, results, fields) {
                                                    if (error) {
                                                        if (error.code != "ER_DUP_ENTRY") {
                                                            return conn.rollback(function () {
                                                                throw error;
                                                            });
                                                        }
                                                    }
                                                    // okay
                                                    conn.commit(function (err) {
                                                        if (err) {
                                                            return conn.rollback(function () {
                                                                throw error;
                                                            });
                                                        }
                                                        // okay
                                                        logger.info("Created Users Table A V" + UsersTableVersion);
                                                        // put in setup mode
                                                        nconf.set("setup", true);
                                                        nconf.save(configSave);
                                                    });
                                                }
                                            );
                                        } else {
                                            // okay
                                            conn.commit(function (err) {
                                                if (err) {
                                                    return conn.rollback(function () {
                                                        throw error;
                                                    });
                                                }
                                                // okay
                                                logger.info("Created Users Table V" + UsersTableVersion);
                                                // put in setup mode
                                                nconf.set("setup", true);
                                                nconf.save(configSave);
                                            });
                                        }
                                    }
                                );
                            }
                        );
                    });
                });
            } else {
                // table does exist no need to create, instead check version
                db.query(
                    "SELECT Data FROM Settings WHERE Feild = ?",
                    ["UsersTableVersion"],
                    function (error, results, fields) {
                        if (error) throw error;
                        // check the key was found
                        if (results.length == 1) {
                            // version matches
                            if (results[0].Data == UsersTableVersion) {
                                logger.info("Users table up to date V" + UsersTableVersion);
                            } else {
                                //TODO: upgrade version
                                logger.info("Users table wrong version" + UsersTableVersion);
                                throw error;
                            }
                        } else {
                            throw error;
                        }
                    }
                );
            }
        }
    });
};
