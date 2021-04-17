// depedancies
var express = require("express");
var router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// functions
var cues = require("../functions/app/cues");
var play = require("../functions/app/play");
var status = require("../functions/app/status");
var tracks = require("../functions/app/tracks");

// middleware
var auth = require("../middleware/auth");

// status routes
router.get("/status", auth.simple(), status.home); // view
router.get("/status/playing", auth.simple(), status.playing); // view
router.get("/status/all", auth.simple(), status.all); // view

// play routes
router.get("/play/halt", auth.simple(), play.halt); // view
router.get("/play/:trackid", auth.simple(), play.track); // view

// cue routes
router.get("/cues", auth.simple(), cues.list); // view
router.post("/cues", auth.edit(), cues.create); // edit
router.get("/cues/:cueid", auth.simple(), cues.info); // view
router.put("/cues/:cueid", auth.edit(), cues.edit); // edit
router.delete("/cues/:cueid", auth.edit(), cues.delete); // edit

// track routes
router.get("/tracks", auth.simple(), tracks.list); // view
router.post("/tracks", auth.edit(), tracks.create); // edit
router.post("/tracks/file", auth.edit(), upload.single("track"), tracks.upload); //edit
router.put("/tracks/:trackid", auth.edit(), tracks.edit); // edit
router.delete("/tracks/:trackid", auth.edit(), tracks.delete); // edit
router.delete("/tracks/:trackid/force", auth.edit(), tracks.deleteForce); // edit
router.get("/tracks/lookup", auth.simple(), tracks.search); // view

// export the router
module.exports = router;
