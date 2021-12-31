// router
var router = require("express").Router();

// controllers
const grid = require("../controllers/grid.controller.js");

// middleware
var auth = require("../middleware/auth.middleware");

// list all grids
router.get("/", auth.simple(), grid.list); // view

// create a grid
router.post("/", auth.edit(), grid.create); // edit

// all info on grid
router.get("/:id", auth.simple(), grid.info); // view

// update grid info
router.put("/:id", auth.edit(), grid.edit); // edit

// update grid layout only
router.put("/:id/layout", auth.edit(), grid.layoutEdit); // edit

// delete grid
router.delete("/:id", auth.edit(), grid.delete); // edit

// create a gridItem
router.post("/:gridId", auth.edit(), grid.itemCreate); // edit

// update gridItem
router.put("/:gridId/:id", auth.edit(), grid.itemEdit); // edit

// delete gridItem
router.delete("/:gridId/:id", auth.edit(), grid.itemDelete); // edit

// export the router
module.exports = router;
