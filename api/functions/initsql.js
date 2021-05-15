exports.checkTables = () => {
    checkSettingsTable()
        .then(checkTracksTable)
        .then(checkCuesTable)
        .then(checkGridsTable)
        .then(checkGridsItemsTable)
        .then(checkUsersTable)
        .catch((error) => {
            throw error;
        });
};

const checkOtherTables = async function () {};

const checkSettingsTable = () => {
    console.log("settings start");
    // return the promise
    return new Promise((resolve, reject) => {
        // check the settings table is all okay and create/edit if not
        db.query("SHOW TABLES LIKE 'Settings'", function (error, results) {
            const SettingsTableVersion = "1";
            // check if an error occured
            if (error) {
                reject(error);
            } else {
                // check if the table exists
                if (results.length == 0) {
                    // doesnt exist so time to create
                    db.getConnection(function (error, conn) {
                        if (error) reject(error);
                        conn.beginTransaction(function (error) {
                            conn.query(
                                "CREATE TABLE Settings (Feild varchar(255) UNIQUE,Data varchar(1024) NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (Feild));",
                                function (error, results, fields) {
                                    if (error) {
                                        conn.rollback(function () {
                                            reject(error);
                                        });
                                    } else {
                                        // okay
                                        conn.query(
                                            "INSERT INTO Settings SET Feild = ?, Data = ?",
                                            ["SettingsTableVersion", SettingsTableVersion],
                                            function (error, results, fields) {
                                                if (error) {
                                                    conn.rollback(function () {
                                                        reject(error);
                                                    });
                                                } else {
                                                    // okay
                                                    conn.commit(function (error) {
                                                        if (error) {
                                                            conn.rollback(function () {
                                                                reject(error);
                                                            });
                                                        }
                                                        // okay
                                                        logger.info("Created Settings Table V" + SettingsTableVersion);
                                                        resolve("Okay Settings");
                                                    });
                                                }
                                            }
                                        );
                                    }
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
                            if (error) reject(error);
                            // check the key was found
                            if (results.length == 1) {
                                // version matches
                                if (results[0].Data == SettingsTableVersion) {
                                    logger.info("Settings table up to date V" + SettingsTableVersion);
                                    checkOtherTables();
                                    resolve("Okay Settings");
                                } else {
                                    //TODO: upgrade version
                                    logger.info("Settings table wrong version" + SettingsTableVersion);
                                    reject("Wrong version settings");
                                }
                            } else {
                                reject("No key settings");
                            }
                        }
                    );
                }
            }
        });
    });
};

const checkTracksTable = () => {
    console.log("tracks start");
    // return the promise
    return new Promise((resolve, reject) => {
        // check the tracks table is all okay and create/edit if not
        db.query("SHOW TABLES LIKE 'Tracks'", function (error, results) {
            const TracksTableVersion = "1.1";
            // check if an error occured
            if (error) {
                reject(error);
            } else {
                // check if the table exists
                if (results.length == 0) {
                    // doesnt exist so time to create
                    db.getConnection(function (error, conn) {
                        if (error) reject(error);
                        conn.beginTransaction(function (error) {
                            conn.query(
                                "CREATE TABLE Tracks (TrackID BIGINT NOT NULL UNIQUE,TrackName varchar(255) NOT NULL, TrackType varchar(255) DEFAULT 'music' NOT NULL, Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (TrackID));",
                                function (error, results, fields) {
                                    if (error) {
                                        conn.rollback(function () {
                                            reject(error);
                                        });
                                    } else {
                                        // okay
                                        conn.query(
                                            "INSERT INTO Settings SET Feild = ?, Data = ?",
                                            ["TracksTableVersion", TracksTableVersion],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        conn.rollback(function () {
                                                            reject(error);
                                                        });
                                                    } else {
                                                        // okay but key already exists
                                                        conn.query(
                                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                            [TracksTableVersion, "TracksTableVersion"],
                                                            function (error, results, fields) {
                                                                if (error) {
                                                                    if (error.code != "ER_DUP_ENTRY") {
                                                                        conn.rollback(function () {
                                                                            reject(error);
                                                                        });
                                                                    }
                                                                } else {
                                                                    // okay
                                                                    conn.commit(function (error) {
                                                                        if (error) {
                                                                            conn.rollback(function () {
                                                                                reject(error);
                                                                            });
                                                                        }
                                                                        // okay
                                                                        logger.info(
                                                                            "Created Tracks Table A V" +
                                                                                TracksTableVersion
                                                                        );
                                                                        resolve("Okay Tracks");
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    }
                                                } else {
                                                    // okay
                                                    conn.commit(function (error) {
                                                        if (error) {
                                                            conn.rollback(function () {
                                                                reject(error);
                                                            });
                                                        } else {
                                                            // okay
                                                            logger.info("Created Tracks Table V" + TracksTableVersion);
                                                            resolve("Okay Tracks");
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
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
                            if (error) reject(error);
                            // check the key was found
                            if (results.length == 1) {
                                // version matches
                                if (results[0].Data == TracksTableVersion) {
                                    logger.info("Tracks table up to date V" + TracksTableVersion);
                                    resolve("Okay Tracks");
                                } else {
                                    // upgrade the version
                                    if (results[0].Data == 1) {
                                        db.getConnection(function (error, conn) {
                                            if (error) reject(error);
                                            conn.beginTransaction(function (error) {
                                                conn.query(
                                                    "ALTER TABLE Tracks ADD TrackType varchar(255) DEFAULT 'music' NOT NULL",
                                                    function (error, results, fields) {
                                                        if (error) {
                                                            conn.rollback(function () {
                                                                reject(error);
                                                            });
                                                        } else {
                                                            // okay
                                                            conn.query(
                                                                "INSERT INTO Settings SET Feild = ?, Data = ?",
                                                                ["TracksTableVersion", TracksTableVersion],
                                                                function (error, results, fields) {
                                                                    if (error) {
                                                                        if (error.code != "ER_DUP_ENTRY") {
                                                                            conn.rollback(function () {
                                                                                reject(error);
                                                                            });
                                                                        } else {
                                                                            // okay but key already exists
                                                                            conn.query(
                                                                                "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                                                [
                                                                                    TracksTableVersion,
                                                                                    "TracksTableVersion",
                                                                                ],
                                                                                function (error, results, fields) {
                                                                                    if (error) {
                                                                                        conn.rollback(function () {
                                                                                            reject(error);
                                                                                        });
                                                                                    } else {
                                                                                        // okay
                                                                                        conn.commit(function (error) {
                                                                                            if (error) {
                                                                                                conn.rollback(
                                                                                                    function () {
                                                                                                        reject(error);
                                                                                                    }
                                                                                                );
                                                                                            } else {
                                                                                                // okay
                                                                                                logger.info(
                                                                                                    "Updated Tracks Table A V" +
                                                                                                        TracksTableVersion
                                                                                                );
                                                                                                resolve("Okay Tracks");
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }
                                                                            );
                                                                        }
                                                                    } else {
                                                                        // okay
                                                                        conn.commit(function (error) {
                                                                            if (error) {
                                                                                conn.rollback(function () {
                                                                                    reject(error);
                                                                                });
                                                                            } else {
                                                                                // okay
                                                                                logger.info(
                                                                                    "Updated Tracks Table V" +
                                                                                        TracksTableVersion
                                                                                );
                                                                                resolve("Okay Tracks");
                                                                            }
                                                                        });
                                                                    }
                                                                }
                                                            );
                                                        }
                                                    }
                                                );
                                            });
                                        });
                                    } else {
                                        //no upgrade
                                        logger.info("No auto mysql db upgrade" + TracksTableVersion);
                                        reject("Wrong version tracks upgrade");
                                    }
                                }
                            } else {
                                reject("Wrong version tracks");
                            }
                        }
                    );
                }
            }
        });
    });
};

const checkCuesTable = () => {
    console.log("cues start");
    // return promise
    return new Promise((resolve, reject) => {
        // check the cues table is all okay and create/edit if not
        db.query("SHOW TABLES LIKE 'Cues'", function (error, results) {
            const CuesTableVersion = "1";
            // check if an error occured
            if (error) {
                reject(error);
            } else {
                // check if the table exists
                if (results.length == 0) {
                    // doesnt exist so time to create
                    db.getConnection(function (error, conn) {
                        if (error) reject(error);
                        conn.beginTransaction(function (error) {
                            conn.query(
                                "CREATE TABLE Cues (CueID BIGINT NOT NULL UNIQUE,CueName varchar(255) NOT NULL,TrackID BIGINT NOT NULL,PlayTime DATETIME NOT NULL,Repeats BOOLEAN NOT NULL,RepeatMonday BOOLEAN NOT NULL,RepeatTuesday BOOLEAN NOT NULL,RepeatWednesday BOOLEAN NOT NULL,RepeatThursday BOOLEAN NOT NULL,RepeatFriday BOOLEAN NOT NULL,RepeatSaturday BOOLEAN NOT NULL,RepeatSunday BOOLEAN NOT NULL,Enabled BOOLEAN NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (CueID),CONSTRAINT fk_Cues_Tracks_TrackID FOREIGN KEY (TrackID) REFERENCES Tracks(TrackID) ON DELETE CASCADE)",
                                function (error, results, fields) {
                                    if (error) {
                                        conn.rollback(function () {
                                            reject(error);
                                        });
                                    } else {
                                        // okay
                                        conn.query(
                                            "INSERT INTO Settings SET Feild = ?, Data = ?",
                                            ["CuesTableVersion", CuesTableVersion],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        conn.rollback(function () {
                                                            reject(error);
                                                        });
                                                    } else {
                                                        // okay but key already exists
                                                        conn.query(
                                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                            [CuesTableVersion, "CuesTableVersion"],
                                                            function (error, results, fields) {
                                                                if (error) {
                                                                    conn.rollback(function () {
                                                                        reject(error);
                                                                    });
                                                                } else {
                                                                    // okay
                                                                    conn.commit(function (error) {
                                                                        if (error) {
                                                                            conn.rollback(function () {
                                                                                reject(error);
                                                                            });
                                                                        } else {
                                                                            // okay
                                                                            logger.info(
                                                                                "Created Cues Table A V" +
                                                                                    CuesTableVersion
                                                                            );
                                                                            resolve("Okay Cues");
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    }
                                                } else {
                                                    // okay
                                                    conn.commit(function (error) {
                                                        if (error) {
                                                            conn.rollback(function () {
                                                                reject(error);
                                                            });
                                                        } else {
                                                            // okay
                                                            logger.info("Created Cues Table V" + CuesTableVersion);
                                                            resolve("Okay Cues");
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
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
                            if (error) reject(error);
                            // check the key was found
                            if (results.length == 1) {
                                // version matches
                                if (results[0].Data == CuesTableVersion) {
                                    logger.info("Cues table up to date V" + CuesTableVersion);
                                    resolve("Okay Cues");
                                } else {
                                    //TODO: upgrade version
                                    logger.info("Cues table wrong version" + CuesTableVersion);
                                    reject("Wrong version cues upgrade");
                                }
                            } else {
                                reject("Wrong version cues");
                            }
                        }
                    );
                }
            }
        });
    });
};

const checkGridsTable = () => {
    console.log("grids start");
    // return promise
    return new Promise((resolve, reject) => {
        // check the grids table is all okay and create/edit if not
        db.query("SHOW TABLES LIKE 'Grids'", function (error, results) {
            const GridsTableVersion = "1";
            // check if an error occured
            if (error) {
                reject(error);
            } else {
                // check if the table exists
                if (results.length == 0) {
                    // doesnt exist so time to create
                    db.getConnection(function (error, conn) {
                        if (error) reject(error);
                        conn.beginTransaction(function (error) {
                            conn.query(
                                "CREATE TABLE Grids (GridID BIGINT NOT NULL UNIQUE, GridName varchar(255) NOT NULL, Layout varchar(10240) DEFAULT '{}', Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP, PRIMARY KEY (GridID))",

                                function (error, results, fields) {
                                    if (error) {
                                        conn.rollback(function () {
                                            reject(error);
                                        });
                                    } else {
                                        // okay
                                        conn.query(
                                            "INSERT INTO Settings SET Feild = ?, Data = ?",
                                            ["GridsTableVersion", GridsTableVersion],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        conn.rollback(function () {
                                                            reject(error);
                                                        });
                                                    } else {
                                                        // okay but key already exists
                                                        conn.query(
                                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                            [GridsTableVersion, "GridsTableVersion"],
                                                            function (error, results, fields) {
                                                                if (error) {
                                                                    conn.rollback(function () {
                                                                        reject(error);
                                                                    });
                                                                } else {
                                                                    // okay
                                                                    conn.commit(function (error) {
                                                                        if (error) {
                                                                            conn.rollback(function () {
                                                                                reject(error);
                                                                            });
                                                                        } else {
                                                                            // okay
                                                                            logger.info(
                                                                                "Created Grids Table A V" +
                                                                                    GridsTableVersion
                                                                            );
                                                                            resolve("Okay Grids");
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    }
                                                } else {
                                                    // okay
                                                    conn.commit(function (error) {
                                                        if (error) {
                                                            conn.rollback(function () {
                                                                reject(error);
                                                            });
                                                        } else {
                                                            // okay
                                                            logger.info("Created Grids Table V" + GridsTableVersion);
                                                            resolve("Okay Grids");
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        });
                    });
                } else {
                    // table does exist no need to create, instead check version
                    db.query(
                        "SELECT Data FROM Settings WHERE Feild = ?",
                        ["GridsTableVersion"],
                        function (error, results, fields) {
                            if (error) reject(error);
                            // check the key was found
                            if (results.length == 1) {
                                // version matches
                                if (results[0].Data == GridsTableVersion) {
                                    logger.info("Grids table up to date V" + GridsTableVersion);
                                    resolve("Okay Grids");
                                } else {
                                    //TODO: upgrade version
                                    logger.info("Grids table wrong version" + GridsTableVersion);
                                    reject("Wrong version grids upgrade");
                                }
                            } else {
                                reject("Wrong version grids");
                            }
                        }
                    );
                }
            }
        });
    });
};

const checkGridsItemsTable = () => {
    console.log("grid items start");
    // return the promise
    return new Promise((resolve, reject) => {
        // check the grids items table is all okay and create/edit if not
        db.query("SHOW TABLES LIKE 'GridItems'", function (error, results) {
            const GridsItemsTableVersion = "1";
            // check if an error occured
            if (error) {
                reject(error);
            } else {
                // check if the table exists
                if (results.length == 0) {
                    // doesnt exist so time to create
                    db.getConnection(function (error, conn) {
                        if (error) reject(error);
                        conn.beginTransaction(function (error) {
                            conn.query(
                                "CREATE TABLE GridItems (GridItemID BIGINT NOT NULL UNIQUE,GridItemName varchar(255) NOT NULL,GridItemColour varchar(255) NOT NULL,TrackID BIGINT NOT NULL,GridID BIGINT NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (GridItemID),CONSTRAINT fk_Grids_Grids_GridID FOREIGN KEY (GridID) REFERENCES Grids(GridID) ON DELETE CASCADE,CONSTRAINT fk_Grids_Tracks_TrackID FOREIGN KEY (TrackID) REFERENCES Tracks(TrackID) ON DELETE CASCADE)",
                                function (error, results, fields) {
                                    if (error) {
                                        conn.rollback(function () {
                                            reject(error);
                                        });
                                    } else {
                                        // okay
                                        conn.query(
                                            "INSERT INTO Settings SET Feild = ?, Data = ?",
                                            ["GridsItemsTableVersion", GridsItemsTableVersion],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        conn.rollback(function () {
                                                            reject(error);
                                                        });
                                                    } else {
                                                        // okay but key already exists
                                                        conn.query(
                                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                            [GridsItemsTableVersion, "GridsItemsTableVersion"],
                                                            function (error, results, fields) {
                                                                if (error) {
                                                                    conn.rollback(function () {
                                                                        reject(error);
                                                                    });
                                                                } else {
                                                                    // okay
                                                                    conn.commit(function (error) {
                                                                        if (error) {
                                                                            conn.rollback(function () {
                                                                                reject(error);
                                                                            });
                                                                        } else {
                                                                            // okay
                                                                            logger.info(
                                                                                "Created Grid Item Table A V" +
                                                                                    GridsItemsTableVersion
                                                                            );
                                                                            resolve("Okay Grid Items");
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    }
                                                } else {
                                                    // okay
                                                    conn.commit(function (error) {
                                                        if (error) {
                                                            conn.rollback(function () {
                                                                reject(error);
                                                            });
                                                        } else {
                                                            // okay
                                                            logger.info(
                                                                "Created Grid Items Table V" + GridsItemsTableVersion
                                                            );
                                                            resolve("Okay Grid Items");
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        });
                    });
                } else {
                    // table does exist no need to create, instead check version
                    db.query(
                        "SELECT Data FROM Settings WHERE Feild = ?",
                        ["GridsItemsTableVersion"],
                        function (error, results, fields) {
                            if (error) reject(error);
                            // check the key was found
                            if (results.length == 1) {
                                // version matches
                                if (results[0].Data == GridsItemsTableVersion) {
                                    logger.info("Grid items table up to date V" + GridsItemsTableVersion);
                                    resolve("Okay Grid Items");
                                } else {
                                    //TODO: upgrade version
                                    logger.info("Grid items table wrong version" + GridsItemsTableVersion);
                                    reject("Wrong version grid items upgrade");
                                }
                            } else {
                                reject("Wrong version grid items");
                            }
                        }
                    );
                }
            }
        });
    });
};

const checkUsersTable = async () => {
    console.log("users start");
    // return the promise
    return new Promise((resolve, reject) => {
        // check the users table is all okay and create/edit if not
        db.query("SHOW TABLES LIKE 'Users'", function (error, results) {
            const UsersTableVersion = "1";
            // check if an error occured
            if (error) {
                reject(error);
            } else {
                // check if the table exists
                if (results.length == 0) {
                    // doesnt exist so time to create
                    db.getConnection(function (error, conn) {
                        if (error) reject(error);
                        conn.beginTransaction(function (error) {
                            conn.query(
                                "CREATE TABLE Users (UserID BIGINT NOT NULL UNIQUE,Email varchar(255) COLLATE utf8_unicode_ci NOT NULL UNIQUE,DisplayName varchar(255) NOT NULL,Password varchar(2048) NOT NULL,Access int(1) NOT NULL,Enabled BOOLEAN NOT NULL DEFAULT True,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (UserID));",
                                function (error, results, fields) {
                                    if (error) {
                                        conn.rollback(function () {
                                            reject(error);
                                        });
                                    } else {
                                        // okay
                                        conn.query(
                                            "INSERT INTO Settings SET Feild = ?, Data = ?",
                                            ["UsersTableVersion", UsersTableVersion],
                                            function (error, results, fields) {
                                                if (error) {
                                                    if (error.code != "ER_DUP_ENTRY") {
                                                        conn.rollback(function () {
                                                            reject(error);
                                                        });
                                                    } else {
                                                        // okay but key already exists
                                                        conn.query(
                                                            "UPDATE Settings SET Data = ? WHERE Feild = ?",
                                                            [UsersTableVersion, "UsersTableVersion"],
                                                            function (error, results, fields) {
                                                                if (error) {
                                                                    conn.rollback(function () {
                                                                        reject(error);
                                                                    });
                                                                } else {
                                                                    // okay
                                                                    conn.commit(function (error) {
                                                                        if (error) {
                                                                            conn.rollback(function () {
                                                                                reject(error);
                                                                            });
                                                                        } else {
                                                                            // okay
                                                                            logger.info(
                                                                                "Created Users Table A V" +
                                                                                    UsersTableVersion
                                                                            );
                                                                            // put in setup mode
                                                                            nconf.set("setup", true);
                                                                            nconf.save(configSave);
                                                                            resolve("Okay Users");
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        );
                                                    }
                                                } else {
                                                    // okay
                                                    conn.commit(function (error) {
                                                        if (error) {
                                                            conn.rollback(function () {
                                                                reject(error);
                                                            });
                                                        } else {
                                                            // okay
                                                            logger.info("Created Users Table V" + UsersTableVersion);
                                                            // put in setup mode
                                                            nconf.set("setup", true);
                                                            nconf.save(configSave);
                                                            resolve("Okay Users");
                                                        }
                                                    });
                                                }
                                            }
                                        );
                                    }
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
                            if (error) reject(error);
                            // check the key was found
                            if (results.length == 1) {
                                // version matches
                                if (results[0].Data == UsersTableVersion) {
                                    logger.info("Users table up to date V" + UsersTableVersion);
                                    resolve("Okay Users");
                                } else {
                                    //TODO: upgrade version
                                    logger.info("Users table wrong version" + UsersTableVersion);
                                    reject("Wrong version users upgrade");
                                }
                            } else {
                                reject("Wrong version users");
                            }
                        }
                    );
                }
            }
        });
    });
};
