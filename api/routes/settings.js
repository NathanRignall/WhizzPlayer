// depedancies
var express = require("express");
var router = express.Router();

// functions
var logs = require("../functions/settings/logs");
var network = require("../functions/settings/network");
var power = require("../functions/settings/power");
var system = require("../functions/settings/system");
var users = require("../functions/settings/users");

// middleware
var auth = require("../middleware/auth");

// routes
router.get("/logs", auth.admin(), logs.temp);
router.get("/network", auth.admin(), network.temp);
router.get("/power", auth.admin(), power.temp);
router.get("/system", auth.admin(), system.temp);

// users
router.get("/users", auth.admin(), users.list);
router.post("/users", auth.admin(), users.create);
router.put("/users/:userid", auth.admin(), users.edit);
router.delete("/users/:userid", auth.admin(), users.delete);

// export the router
module.exports = router;
