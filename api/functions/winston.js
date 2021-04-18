const winston = require("winston");
require("winston-daily-rotate-file");

// winston error levels
const levels = {
    error: 0,
    info: 1,
    http: 2,
    debug: 3,
};

// winston error colours
const colors = {
    error: "red",
    info: "green",
    http: "cyan",
    debug: "magenta",
};
winston.addColors(colors);

// get the error level based on node env
const level = () => {
    const env = process.env.NODE_ENV || "development";
    const isDevelopment = env === "development";
    return isDevelopment ? "debug" : "http";
};

// set the winston transports
const transports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
            winston.format.colorize({ all: true })
        ),
        json: false,
    }),

    new winston.transports.DailyRotateFile({
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        filename: "logs/errors/log-%DATE%.log",
        datePattern: "YYYY-MM",
        level: "error",
        json: true,
        timestamp: true,
        maxSize: "20m",
        maxFiles: "6",
    }),

    new winston.transports.DailyRotateFile({
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        filename: "logs/all/log-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        json: true,
        timestamp: true,
        maxSize: "20m",
        maxFiles: "14",
    }),
];

// export the winston logger
exports.logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});
