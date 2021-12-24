// router
var router = require("express").Router();

// controllers
const cue = require("../controllers/cue.controller.js");

// middleware
var auth = require("../middleware/auth.middleware");

// list all cues
router.get("/", auth.simple(), cue.list); // view

// create a cue
router.post("/", auth.edit(), cue.create); // edit

// info on cue
router.get("/:id", auth.simple(), cue.info); // view

// update cue
router.put("/:id", auth.edit(), cue.edit); // edit

// delete cue
router.delete("/:id", auth.edit(), cue.delete); // edit

// export the router
module.exports = router;
