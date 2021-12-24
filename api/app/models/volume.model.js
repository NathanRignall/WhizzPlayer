module.exports = (sequelize, Sequelize) => {
    const Volume = sequelize.define("volume", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        value: {
            type: Sequelize.INTEGER(3),
            allowNull: false,
            defaultValue: 75,
            validate: {
                max: 100,
                min: 0,
            },
        },
    });

    return Volume;
};
