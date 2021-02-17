var express = require("express");
var router = express.Router();

router.get("/:track", function (req, res, next) {
    let trackPath = "/uploads/tracks/" + req.params.track;
    res.json(player.play(trackPath));
});

module.exports = router;
