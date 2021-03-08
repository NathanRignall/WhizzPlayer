// depedancies
var express = require("express");
var router = express.Router();

// functions
var logs = require("../functions/settings/logs");
var network = require("../functions/settings/network");
var power = require("../functions/settings/power");
var system = require("../functions/settings/system");
var user = require("../functions/settings/user");

// middleware
var auth = require("../middleware/auth");

// routes
router.get("/logs", auth.admin(), logs.temp);
router.get("/network", auth.admin(), network.temp);
router.get("/power", auth.admin(), power.temp);
router.get("/system", auth.admin(), system.temp);
router.get("/user", auth.admin(), user.temp);

// export the router
module.exports = router;
