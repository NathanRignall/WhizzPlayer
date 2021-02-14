// depedancies
var express = require("express");
var router = express.Router();

// functions
var user = require("../functions/account/core");

// middleware
var auth = require("../middleware/auth");

router.post("/register", user.register);
router.post("/login", user.login);
router.get("/info", auth.simple(), user.info);
router.put("/info", auth.simple(), user.infoUpdate);

module.exports = router;
