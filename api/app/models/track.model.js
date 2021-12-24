module.exports = (sequelize, Sequelize) => {
    const Track = sequelize.define("track", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });

    return Track;
};
