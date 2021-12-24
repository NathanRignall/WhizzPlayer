// router
var router = require("express").Router();

// controllers
const play = require("../controllers/play.controller.js");

// middleware
var auth = require("../middleware/auth.middleware");

// halt track
router.post("/halt", auth.simple(), play.halt); // view

// play track
router.post("/:trackid", auth.simple(), play.play); // view

// play track
router.get("/", auth.simple(), play.status); // view

// export the router
module.exports = router;
