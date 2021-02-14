var express = require("express");
var router = express.Router();

// sample index
router.get("/", function (req, res, next) {
    res.send("index");
});

module.exports = router;
