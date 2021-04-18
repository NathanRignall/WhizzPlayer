var express = require("express");
var router = express.Router();

router.post("/", async function (req, res, next) {
    // get the info from json
    var json = req.body;
    // play the song
    var track = await player.play(json);
    // if successful return 200
    if (track.success == true) {
        res.status(200).json({
            message: "okay",
            reqid: res.locals.reqid,
        });
    } else if (track.server == false) {
        res.status(400).json({
            message: track.message,
            reqid: res.locals.reqid,
        });
    } else {
        res.locals.errors = track.error;
        res.status(500).json({
            message: "Server error",
            errors: res.locals.errors,
            reqid: res.locals.reqid,
        });
    }
});

module.exports = router;
