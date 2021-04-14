// import dependancies
var express = require("express");
var session = require("express-session");
var mysql = require("mysql");
var validator = require("validator");
var crypto = require("crypto");
const cors = require("cors");
var logger = require("morgan");
var idgen = require("./functions/idgen");
var auth = require("./middleware/auth");

// make the some modules global
global.idgen = idgen;
global.auth = auth;

// temp connect to the mysql database
const tempConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
});

// connect to mysql and create database and tables if not exists
tempConnection.connect((err) => {
    if (err) throw err;
    // create the databse if does not exists
    const dbUse = process.env.DB_DB ? process.env.DB_DB : "WhizzPlayerDB";
    console.log(dbUse);
    tempConnection.query("CREATE DATABASE IF NOT EXISTS " + dbUse, (err, result) => {
        if (err) throw err;
        // connect to actual db
        const connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: dbUse,
            supportBigNumbers: true,
            bigNumberStrings: true,
            dateStrings: true,
        });
        // make the db global
        global.db = connection;
        // if a database was actually created
        if (result.affectedRows == 1) {
            console.log("Starting table creation");
            db.beginTransaction(function (err) {
                db.query(
                    "CREATE TABLE Tracks (TrackID BIGINT NOT NULL UNIQUE,TrackName varchar(255) NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (TrackID));",
                    (error, results) => {
                        if (error) throw error;
                        db.query(
                            "CREATE TABLE Cues (CueID BIGINT NOT NULL UNIQUE,CueName varchar(255) NOT NULL,TrackID BIGINT NOT NULL,PlayTime DATETIME NOT NULL,Repeats BOOLEAN NOT NULL,RepeatMonday BOOLEAN NOT NULL,RepeatTuesday BOOLEAN NOT NULL,RepeatWednesday BOOLEAN NOT NULL,RepeatThursday BOOLEAN NOT NULL,RepeatFriday BOOLEAN NOT NULL,RepeatSaturday BOOLEAN NOT NULL,RepeatSunday BOOLEAN NOT NULL,Enabled BOOLEAN NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (CueID),CONSTRAINT fk_Cues_Tracks_TrackID FOREIGN KEY (TrackID) REFERENCES Tracks(TrackID) ON DELETE CASCADE)",
                            (error, results) => {
                                if (error) throw error;
                                db.query(
                                    "CREATE TABLE Users (UserID BIGINT NOT NULL UNIQUE,Email varchar(255) COLLATE utf8_unicode_ci NOT NULL UNIQUE,DisplayName varchar(255) NOT NULL,Password varchar(2048) NOT NULL,Access int(1) NOT NULL,Enabled BOOLEAN NOT NULL DEFAULT True,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (UserID));",
                                    (error, results) => {
                                        if (error) throw error;
                                        db.query(
                                            "CREATE TABLE Settings (Feild varchar(255) UNIQUE,Data varchar(1024) NOT NULL,Created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,Modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (Feild));",
                                            (error, results) => {
                                                if (error) throw error;
                                                db.query(
                                                    "INSERT INTO Settings SET Feild = ?, Data = ?",
                                                    ["version", "1"],
                                                    (error, results) => {
                                                        if (error) throw error;
                                                        db.query(
                                                            "INSERT INTO Settings SET Feild = ?, Data = ?",
                                                            ["setup", "true"],
                                                            (error, results) => {
                                                                if (error) throw error;
                                                                db.commit((error) => {
                                                                    if (err) {
                                                                        return db.rollback(() => {
                                                                            throw error;
                                                                        });
                                                                    }
                                                                    console.log("Done DB Setup");
                                                                });
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            });
        }
    });
});

// setup global validators
global.validator = validator;
function checkCharacters(input) {
    return /^[A-z ]+$/.test(input);
}
global.checkCharacters = checkCharacters;

// import the routes after globals
var indexRouter = require("./routes/index");
var accountRouter = require("./routes/account");
var appRouter = require("./routes/app");
var settingsRouter = require("./routes/settings");
var backendRouter = require("./routes/backend");

// setup the app
var app = express();

// setup the middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.locals.errors = [];
    res.locals.reqid = crypto.randomBytes(20).toString("hex");
    next();
});

// set the trusted domains for cors production
const whitelist = ["http://localhost:3000", "http://10.0.15.228:3000", "http://10.0.15.228"];

const corsOptions =
    process.env.NODE_ENV == "production"
        ? {
              origin: function (origin, callback) {
                  if (whitelist.indexOf(origin) !== -1) {
                      callback(null, true);
                  } else if (origin == null) {
                      callback(null, true);
                  } else {
                      console.log(origin);
                      callback(new Error("Not allowed by CORS"));
                  }
              },
              credentials: true,
          }
        : {
              origin: function (origin, callback) {
                  callback(null, true);
              },
              credentials: true,
          };

app.use(cors(corsOptions));

// setup the session
app.use(
    session({
        name: "session",
        secret: process.env.SESSION_SECRET,
        keys: [process.env.SESSION_KEY1, process.env.SESSION_KEY2, process.env.SESSION_KEY3],
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            path: "/",
        },
    })
);

// finally load the routes
app.use("/", indexRouter);
app.use("/account", accountRouter);
app.use("/app", appRouter);
app.use("/settings", settingsRouter);
app.use("/backend", backendRouter);

// last load static paths
app.use("/uploads", auth.simple());

if (process.env.NODE_ENV == "production") {
    app.use("/uploads", express.static("/uploads"));
} else {
    app.use("/uploads", express.static("../uploads"));
}

// export app
module.exports = app;
