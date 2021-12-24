module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        hash: {
            type: Sequelize.STRING(2048),
            allowNull: false,
        },
        access: {
            type: Sequelize.INTEGER(2),
            allowNull: false,
            default: 0,
            validate: {
                isAccess(value) {
                    if (!(value == 0 || value == 5 || value == 10)) {
                        throw new Error("Only access code values are allowed!");
                    }
                },
            },
        },
    });

    return User;
};
