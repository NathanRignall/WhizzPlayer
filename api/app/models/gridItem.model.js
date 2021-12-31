module.exports = (sequelize, Sequelize) => {
    const GridItem = sequelize.define("gridItem", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        color: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });

    return GridItem;
};
