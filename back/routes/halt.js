var express = require("express");
var router = express.Router();

router.get("/", async function (req, res, next) {
    // play the song
    var track = await player.halt();
    // if successful return 200
    if (track.success == true) {
        res.status(200).json({
            message: "okay",
            reqid: res.locals.reqid,
        });
    } else {
        res.status(404).json({
            message: track.message,
            reqid: res.locals.reqid,
        });
    }
});

module.exports = router;
