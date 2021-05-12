// import dependancies
var express = require("express");
var session = require("express-session");
var nconf = require("nconf");
var fs = require("fs");
var mysql = require("mysql");
var validator = require("validator");
var crypto = require("crypto");
const cors = require("cors");
const { serializeError } = require("serialize-error");
var morgan = require("morgan");
var logger = require("./functions/winston").logger;
var idgen = require("./functions/idgen");
var initsql = require("./functions/initsql");
var auth = require("./middleware/auth");

//setup config
const configFile = process.env.NODE_ENV == "production" ? "/default.json" : "../config/default.json";
const configSave = function (err) {
    fs.readFile(configFile, function (err, data) {
        logger.info({ save: JSON.parse(data.toString()) });
    });
};

// make the some modules global
global.idgen = idgen;
global.auth = auth;
global.logger = logger;
global.serializeError = serializeError;
global.nconf = nconf;
global.configSave = configSave;

// setup nconf
nconf.env().file({ file: configFile });

nconf.defaults({
    playback: {
        enabled: true,
        volume: {
            music: 70,
            voice: 100,
        },
    },
    database: {
        db: "WhizzPlayerDB",
    },
    session: {
        secret: crypto.randomBytes(8).toString("hex"),
    },
});

// temp connect to the mysql server
const tempConnection = mysql.createConnection({
    host: nconf.any("DATABASE_HOST", "database:host"),
    user: nconf.any("DATABASE_USER", "database:user"),
    password: nconf.any("DATABASE_PASS", "database:pass"),
    supportBigNumbers: true,
    bigNumberStrings: true,
    timezone: "utc",
});

// connect to mysql and create database and tables if not exists
tempConnection.connect((err) => {
    if (err) throw err;

    // setup the db name
    const dbUse = nconf.any("DATABASE_DB", "database:db");
    console.log(dbUse);

    // create the databse if does not exists
    tempConnection.query("CREATE DATABASE IF NOT EXISTS " + dbUse, async (err, result) => {
        if (err) throw err;

        tempConnection.destroy();

        // connect to actual db
        var connection = await mysql.createPool({
            connectionLimit: 10,
            host: nconf.any("DATABASE_HOST", "database:host"),
            user: nconf.any("DATABASE_USER", "database:user"),
            password: nconf.any("DATABASE_PASS", "database:pass"),
            database: dbUse,
            supportBigNumbers: true,
            bigNumberStrings: true,
            timezone: "utc",
        });

        console.log("Connected to main DB!");
        // make the db global
        global.db = connection;
        // check all the tables over
        initsql.checkTables();
    });
});

// setup global validators
global.validator = validator;
function checkCharacters(input) {
    return true;
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.locals.errors = [];
    res.locals.reqid = crypto.randomBytes(20).toString("hex");
    next();
});

// setup logging
morgan.token("json", function (tokens, req, res) {
    return JSON.stringify({
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        content: tokens.res(req, res, "content-length"),
        time: tokens["response-time"](req, res),
        reqID: res.locals.reqID,
    });
});

const stream = {
    write: function (message, encoding) {
        logger.http(message);
    },
};

app.use(morgan("json", { stream: stream }));

// set the cors allowed all
const corsOptions = {
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
        secret: nconf.any("SESSION_SECRET", "session:secret"),
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
