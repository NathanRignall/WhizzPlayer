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

// connect to the mysql database
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
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

// set the trusted domains for cors
const whitelist = [
    "http://localhost:3000",
    "http://10.0.15.228:3000",
    "http://10.0.15.228",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else if (origin == null) {
            callback(null, true);
        } else {
            console.log(origin);
            callback(null, true);
            //callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));

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

// last load static paths
app.use("/uploads", auth.simple());
app.use("/uploads", express.static("/uploads"));

// export app
module.exports = app;
