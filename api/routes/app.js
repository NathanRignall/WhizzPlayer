// depedancies
var express = require("express");
var router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// functions
var grids = require("../functions/app/grids");
var cues = require("../functions/app/cues");
var play = require("../functions/app/play");
var status = require("../functions/app/status");
var tracks = require("../functions/app/tracks");

// middleware
var auth = require("../middleware/auth");

// status routes
router.get("/status", auth.simple(), status.stats); // view
router.get("/status/playing", auth.simple(), status.playing); // view
router.get("/status/logs/api", auth.simple(), status.logsAPI); // view
router.get("/status/logs/back", auth.simple(), status.logsBack); // view
router.get("/status/logs/playback", auth.simple(), status.logsPlayback); // view

// play routes
router.get("/play/halt", auth.simple(), play.halt); // view
router.get("/play/:trackid", auth.simple(), play.track); // view

// grid routes
router.get("/grids", auth.simple(), grids.list); // view
router.post("/grids", auth.edit(), grids.create); // edit
router.get("/grids/:gridid", auth.simple(), grids.info); // view
router.put("/grids/:gridid", auth.edit(), grids.edit); // edit
router.delete("/grids/:gridid", auth.edit(), grids.delete); // edit

router.get("/grids/:gridid/items", auth.simple(), grids.itemsList); // view
router.post("/grids/:gridid/items", auth.edit(), grids.itemsCreate); // edit
router.put("/grids/:gridid/items/:itemid", auth.edit(), grids.itemsEdit); // edit
router.delete("/grids/:gridid/items/:itemid", auth.edit(), grids.itemsDelete); // edit

router.put("/grids/:gridid/layout", auth.edit(), grids.layout); // edit

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
