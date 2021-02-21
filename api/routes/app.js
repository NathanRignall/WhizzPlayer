// depedancies
var express = require("express");
var router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// functions
var cue = require("../functions/app/cue");
var play = require("../functions/app/play");
var status = require("../functions/app/status");
var tracks = require("../functions/app/tracks");

// middleware
var auth = require("../middleware/auth");

// status routes
router.get("/status", auth.simple(), status.home); // view
router.get("/status/all", auth.simple(), status.all); // view

// play routes
router.get("/play/halt", auth.simple(), play.halt); // view
router.get("/play/:trackid", auth.simple(), play.track); // view

// cue routes
router.get("/cue", auth.simple(), cue.temp); // view
router.post("/cue", auth.edit(), cue.temp); // edit
router.get("/cue/:cueid", auth.simple(), cue.temp); // view
router.put("/cue/:cueid", auth.edit(), cue.temp); // edit
router.delete("/cue/:cueid", auth.edit(), cue.temp); // edit

// track routes
router.get("/tracks", auth.simple(), tracks.list); // view
router.post("/tracks", auth.edit(), tracks.create); // edit
router.post("/tracks/file", auth.edit(), upload.single("track"), tracks.upload); //edit
router.put("/tracks/:trackid", auth.edit(), tracks.edit); // edit
router.delete("/tracks/:trackid", auth.edit(), tracks.delete); // edit

module.exports = router;
