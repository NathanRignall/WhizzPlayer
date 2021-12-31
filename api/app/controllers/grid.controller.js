// load the dependancies
const crypto = require("crypto");

// load the db
const db = require("../models");
const Grid = db.grids;
const GridItem = db.gridItems;
const Track = db.tracks;

// get all grids from the database.
exports.list = (req, res) => {
    // get all grids from db
    Grid.findAll({
        attributes: { exclude: ["layout"] },
    })
        .then((data) => {
            // retun the correct vars
            res.status(200).json({
                payload: data,
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.list.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the grids",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// create a grid
exports.create = function (req, res, next) {
    // get the info from json
    const json = req.body;

    // set the vars from post
    const name = json.name;

    // check if name is present
    if (!name) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if name characters are valid
    if (!checkCharacters(name)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name provided contains invalid characters",
            reqid: res.locals.reqid,
        });
    }

    // create uuid
    const id = crypto.randomUUID();

    // create grid
    const grid = {
        id: id,
        name: name,
    };

    // Create grid in the database
    Grid.create(grid)
        .then((data) => {
            // retun the correct vars
            res.status(200).json({
                payload: data,
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.create.1",
                code: error.code,
                message: error.message || "Some error occurred while creating the grid",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// get specific grid from the database.
exports.info = (req, res) => {
    // get req params
    const id = req.params.id;

    // Find the specific grid in db
    Grid.findByPk(id, {
        include: [
            {
                model: GridItem,
                as: "items",
                include: [
                    {
                        model: Track,
                        as: "track",
                    },
                ],
            },
        ],
    })
        .then((data) => {
            if (data) {
                // make json an object
                let tempData = data.toJSON();
                tempData.layout = JSON.parse(tempData.layout);

                // retun the correct vars
                res.status(200).json({
                    payload: tempData,
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "GridID invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.info.1",
                code: error.code,
                message: error.message || "Some error occurred while finding the grid",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// update grid from the database.
exports.edit = (req, res) => {
    // get req params
    const id = req.params.id;

    // get the info from json
    const json = req.body;

    // set the vars from post
    const name = json.name;

    // check if name is present
    if (!name) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if name characters are valid
    if (!checkCharacters(name)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name provided contains invalid characters",
            reqid: res.locals.reqid,
        });
    }

    // create grid
    const grid = {
        name: name,
    };

    // Update the specific grid in the db
    Grid.update(grid, {
        where: {
            id: id,
        },
    })
        .then((number) => {
            if (number == 1) {
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "GridID invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.edit.1",
                code: error.code,
                message: error.message || "Some error occurred while updating the grid",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// update grid layout from the database.
exports.layoutEdit = (req, res) => {
    // get req params
    const id = req.params.id;

    // get the info from json
    const json = req.body;

    // set the vars from post
    const layout = json.layout;

    // check if name is present
    if (!layout) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // create grid
    const grid = {
        layout: JSON.stringify(layout),
    };

    // Update the specific grid layout in the db
    Grid.update(grid, {
        where: {
            id: id,
        },
    })
        .then((number) => {
            if (number == 1) {
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(200).json({
                    message: "okay - no update",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.layoutEdit.1",
                code: error.code,
                message: error.message || "Some error occurred while updating the grid layout",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// delete grid from the database.
exports.delete = (req, res) => {
    // get req params
    const id = req.params.id;

    // Delete the specific grid in db
    Grid.destroy({
        where: { id: id },
    })
        .then((number) => {
            if (number == 1) {
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "GridId invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.delete.1",
                code: error.code,
                message: error.message || "Some error occurred while deleting the grid",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// create a grid item
exports.itemCreate = function (req, res, next) {
    // get req params
    const gridId = req.params.gridId;

    // get the info from json
    const json = req.body;

    // set the vars from post
    const name = json.name;
    const color = json.color;
    const trackId = json.trackId;

    // check if name is present
    if (!name) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if name characters are valid
    if (!checkCharacters(name)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name provided contains invalid characters",
            reqid: res.locals.reqid,
        });
    }

    // check if color is present
    if (!color) {
        // retun the correct vars
        return res.status(400).json({
            message: "Color input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if color is valid
    if (!validator.isHexColor(color)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Color input invalid",
            reqid: res.locals.reqid,
        });
    }

    // check if trackid is present
    if (!trackId) {
        // retun the correct vars
        return res.status(400).json({
            message: "TrackId input value missing",
            reqid: res.locals.reqid,
        });
    }

    // create uuid
    const id = crypto.randomUUID();

    // create gridItem
    const gridItem = {
        id: id,
        name: name,
        color: color,
        trackId: trackId,
        gridId: gridId,
    };

    // Create gridItem in the database
    GridItem.create(gridItem)
        .then((data) => {
            // retun the correct vars
            res.status(200).json({
                payload: data,
                message: "okay",
                reqid: res.locals.reqid,
            });
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.itemCreate.1",
                code: error.code,
                message: error.message || "Some error occurred while creating the gridItem",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// edit a grid item
exports.itemEdit = function (req, res, next) {
    // get req params
    const id = req.params.id;
    const gridId = req.params.gridId;

    // get the info from json
    const json = req.body;

    // set the vars from post
    const name = json.name;
    const color = json.color;
    const trackId = json.trackId;

    // check if name is present
    if (!name) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if name characters are valid
    if (!checkCharacters(name)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Name provided contains invalid characters",
            reqid: res.locals.reqid,
        });
    }

    // check if color is present
    if (!color) {
        // retun the correct vars
        return res.status(400).json({
            message: "Color input value missing",
            reqid: res.locals.reqid,
        });
    }

    // check if color is valid
    if (!validator.isHexColor(color)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Color input invalid",
            reqid: res.locals.reqid,
        });
    }

    // check if trackid is present
    if (!trackId) {
        // retun the correct vars
        return res.status(400).json({
            message: "TrackId input value missing",
            reqid: res.locals.reqid,
        });
    }

    // create gridItem
    const gridItem = {
        name: name,
        color: color,
        trackId: trackId,
    };

    // Update the specific gridItem in the db
    GridItem.update(gridItem, {
        where: {
            id: id,
        },
    })
        .then((number) => {
            if (number == 1) {
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "GridItemId invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.itemEdit.1",
                code: error.code,
                message: error.message || "Some error occurred while updating the gridItem",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};

// delete gridItem from the database.
exports.itemDelete = (req, res) => {
    // get req params
    const id = req.params.id;

    // Delete the specific gridItem in db
    GridItem.destroy({
        where: { id: id },
    })
        .then((number) => {
            if (number == 1) {
                // retun the correct vars
                res.status(200).json({
                    message: "okay",
                    reqid: res.locals.reqid,
                });
            } else {
                // retun the correct vars
                res.status(400).json({
                    message: "GridItemId invalid",
                    reqid: res.locals.reqid,
                });
            }
        })
        .catch((error) => {
            // push the error to buffer
            res.locals.errors.push({
                location: "grid.controller.itemDelete.1",
                code: error.code,
                message: error.message || "Some error occurred while deleting the gridItem",
                from: "sequelize",
            });

            // return the correct vars
            res.status(500).json({
                message: "Server error",
                errors: res.locals.errors,
                reqid: res.locals.reqid,
            });
        });
};
