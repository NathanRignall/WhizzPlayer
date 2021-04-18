var express = require("express");
var router = express.Router();

router.get("/play", async function (req, res, next) {
    // get the status from player
    var status = await player.status;
    // return 200
    res.status(200).json({
        message: "okay",
        payload: status,
        reqid: res.locals.reqid,
    });
});

router.get("/version", async function (req, res, next) {
    // return 200
    res.status(200).json({
        message: "okay",
        payload: {
            alive: true,
            version: "0.0.0",
        },
        reqid: res.locals.reqid,
    });
});

router.get("/logs/system", async function (req, res, next) {
    // return 200
    res.status(200).json({
        message: "okay",
        payload: {
            demo: true,
        },
        reqid: res.locals.reqid,
    });
});

router.get("/logs/playback", async function (req, res, next) {
    // return 200
    res.status(200).json({
        message: "okay",
        payload: {
            demo: true,
        },
        reqid: res.locals.reqid,
    });
});

module.exports = router;
