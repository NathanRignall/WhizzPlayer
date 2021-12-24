module.exports = (sequelize, Sequelize) => {
    const Cue = sequelize.define("cue", {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        time: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        repeat: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        repeatMonday: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        repeatTuesday: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        repeatWednesday: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        repeatThursday: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        repeatFriday: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        repeatSaturday: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        repeatSunday: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        enabled: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    });

    return Cue;
};
