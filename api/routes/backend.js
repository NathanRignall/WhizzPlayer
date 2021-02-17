// depedancies
var express = require("express");
var router = express.Router();

// functions
var grab = require("../functions/backend/grab");
var info = require("../functions/backend/info");

// middleware
var auth = require("../middleware/auth");

router.get("/grab/:time", auth.backend(), grab.core);
router.get("/info/:trackid", auth.backend(), info.core);

module.exports = router;
