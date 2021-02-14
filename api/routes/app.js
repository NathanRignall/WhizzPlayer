// depedancies
var express = require("express");
var router = express.Router();

// functions
var cue = require("../functions/app/cue");
var play = require("../functions/app/play");
var status = require("../functions/app/status");
var track = require("../functions/app/track");

// middleware
var auth = require("../middleware/auth");

router.get("/cue", auth.simple(), cue.temp); // view
router.post("/cue", auth.edit(), cue.temp); // edit
router.get("/cue/:cueid", auth.simple(), cue.temp); // view
router.put("/cue/:cueid", auth.edit(), cue.temp); // edit
router.delete("/cue/:cueid", auth.edit(), cue.temp); // edit

router.get("/play", auth.simple(), play.temp); // view
router.get("/status", auth.simple(), status.temp); // view
router.get("/track", auth.simple(), track.temp); // view

router.get("/play/test", play.test); // test

module.exports = router;
