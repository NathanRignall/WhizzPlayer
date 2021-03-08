// depedancies
var express = require("express");
var router = express.Router();

// functions
var grab = require("../functions/backend/grab");

// middleware
var auth = require("../middleware/auth");

// routes
router.get("/grab", auth.backend(), grab.core);

// export the router
module.exports = router;
