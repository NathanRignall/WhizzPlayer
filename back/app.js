// import dependancies
var express = require("express");
var logger = require("morgan");
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

// import the routes after globals
var indexRouter = require("./routes/index");
var playRouter = require("./routes/play");
var haltRouter = require("./routes/halt");
var statusRouter = require("./routes/status");

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

// finally load the routes
app.use("/", indexRouter);
app.use("/play", playRouter);
app.use("/halt", haltRouter);
app.use("/status", statusRouter);

// export app
module.exports = app;
