module.exports = {
    HOST: "192.168.100.154",
    USER: "WhizzPlayerDev",
    PASSWORD: "Pass1234",
    DB: "WhizzPlayerSEQ",
    dialect: "mariadb",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};
