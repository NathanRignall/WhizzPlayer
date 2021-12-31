const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorsAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// import the models to the system
db.cues = require("./cue.model.js")(sequelize, Sequelize);
db.grids = require("./grid.model.js")(sequelize, Sequelize);
db.gridItems = require("./gridItem.model.js")(sequelize, Sequelize);
db.tracks = require("./track.model.js")(sequelize, Sequelize);
db.users = require("./user.model.js")(sequelize, Sequelize);
db.volumes = require("./volume.model.js")(sequelize, Sequelize);

// cue - track relationship
db.tracks.hasMany(db.cues, { as: "cues" });
db.cues.belongsTo(db.tracks, {
    foreignKey: "trackId",
    as: "track",
});

// gridItem - track relationship
db.tracks.hasMany(db.gridItems, { as: "gridItems" });
db.gridItems.belongsTo(db.tracks, {
    foreignKey: "trackId",
    as: "track",
});

// track - volume relationship
// db.volumes.hasMany(db.tracks, { as: "tracks" });
// db.tracks.belongsTo(db.volumes, {
//   foreignKey: "volumeId",
//   as: "volume",
// });

// grid - gridItems relationship
db.grids.hasMany(db.gridItems, { as: "items" });
db.gridItems.belongsTo(db.grids, {
    foreignKey: "gridId",
    as: "grid",
});

// export the whole db model formed
module.exports = db;
