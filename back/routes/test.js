var express = require("express");
var router = express.Router();

var player = require("play-sound")((opts = {}));
const path = require("path");

router.get("/play", function (req, res, next) {
    res.send("Play!");
    // $ mplayer foo.mp3
    player.play(
        "/uploads/tracks/foo.mp3",
        { mpg123: ["-v", 1] },
        function (err) {
            if (err) throw err;
        }
    );
});

module.exports = router;
