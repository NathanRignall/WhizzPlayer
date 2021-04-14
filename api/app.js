// import dependancies
var express = require("express");
var session = require("express-session");
var mysql = require("mysql");
var validator = require("validator");
var crypto = require("crypto");
const cors = require("cors");
var logger = require("morgan");
var idgen = require("./functions/idgen");
var initsql = require("./functions/initsql");
var auth = require("./middleware/auth");

// make the some modules global
global.idgen = idgen;
global.auth = auth;

// temp connect to the mysql server
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

    // setup the db name
    const dbUse = process.env.DB_DB ? process.env.DB_DB : "WhizzPlayerDB";
    console.log(dbUse);

    // create the databse if does not exists
    tempConnection.query("CREATE DATABASE IF NOT EXISTS " + dbUse, async (err, result) => {
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
        // check all the tables over
        initsql.checkTables();
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
