// load dependancies
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

// router
var router = require("express").Router();

// controllers
const track = require("../controllers/track.controller.js");

// middleware
var auth = require("../middleware/auth.middleware");

// list all tracks
router.get("/", auth.simple(), track.list); // view

// find tracks
router.get("/find", auth.simple(), track.find); // view

// create a track
router.post("/", auth.edit(), track.create); // edit

// upload a file for a track
router.post("/file", auth.edit(), upload.single("track"), track.upload); //edit

// upload a track
// export the router
module.exports = router;
