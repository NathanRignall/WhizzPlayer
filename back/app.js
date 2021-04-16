// import dependancies
var express = require("express");
var morgan = require("morgan");
var logger = require("./functions/winston").logger;
var crypto = require("crypto");
var CronJob = require("cron").CronJob;
var player = require("./functions/player")();
var cronTasks = require("./functions/cron");

// cron check job
var job = new CronJob(
    "0 * * * * *",
    function () {
        cronTasks.grabTrack();
    },
    null,
    true,
    "America/Los_Angeles"
);
job.start();

// make the some modules global
global.player = player;
global.logger = logger;

// import the routes after globals
var indexRouter = require("./routes/index");
var playRouter = require("./routes/play");
var haltRouter = require("./routes/halt");
var statusRouter = require("./routes/status");

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

// finally load the routes
app.use("/", indexRouter);
app.use("/play", playRouter);
app.use("/halt", haltRouter);
app.use("/status", statusRouter);

// export app
module.exports = app;
