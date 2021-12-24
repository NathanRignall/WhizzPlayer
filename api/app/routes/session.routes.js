// router
var router = require("express").Router();

// controllers
const session = require("../controllers/session.controller.js");

// middleware
var auth = require("../middleware/auth.middleware");

// check if the system is in setup
router.get("/setup", session.setup);
// register first user
router.post("/register", session.register);


// login user
router.post("/", session.login);
// session user info
router.get("/", auth.simple(), session.info);
// logged in user update
router.put("/", auth.simple(), session.update);


// reset password of current user
//router.post("/password", auth.simple(), session.password);

// logout sesison
//router.get("/logout", auth.simple(), session.logout);

// export the router
module.exports = router;
