// import dependancies
var express = require("express");
var session = require("express-session");
var mysql = require("mysql");
var validator = require("validator");
var crypto = require("crypto");
var logger = require("morgan");
var responseFormat = require("./functions/response");
var idgen = require("./functions/idgen");

// make the some modules global
global.responseFormat = responseFormat;
global.idgen = idgen;

// connect to the mysql database
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    supportBigNumbers: true,
    bigNumberStrings: true,
});
connection.connect();
global.db = connection;

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

// setup the session
app.use(
    session({
        name: "session",
        secret: process.env.SESSION_SECRET,
        keys: [
            process.env.SESSION_KEY1,
            process.env.SESSION_KEY2,
            process.env.SESSION_KEY3,
        ],
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

// export app
module.exports = app;
