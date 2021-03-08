var express = require("express");
var router = express.Router();

// index page
router.get("/", function (req, res, next) {
    res.send("whizz player API");
});

// export the router
module.exports = router;
