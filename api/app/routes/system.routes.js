// router
var router = require("express").Router();

// controllers
const system = require("../controllers/system.controller.js");

// middleware
var auth = require("../middleware/auth.middleware");

// get system info
router.get("/", auth.simple(), system.info); // view

// export the router
module.exports = router;
