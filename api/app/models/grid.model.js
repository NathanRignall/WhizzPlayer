module.exports = (sequelize, Sequelize) => {
    const Grid = sequelize.define("grid", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        layout: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "{}",
        },
    });

    return Grid;
};
