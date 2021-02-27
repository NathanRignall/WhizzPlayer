// depedancies
var express = require("express");
var router = express.Router();

// functions
var grab = require("../functions/backend/grab");

// middleware
var auth = require("../middleware/auth");

router.get("/grab/:time", auth.backend(), grab.core);

module.exports = router;
