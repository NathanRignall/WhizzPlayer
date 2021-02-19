exports.core = function (req, res, next) {
    res.status(500).json({
        Message: "Server Error",
        Errors: res.locals.errors,
        LogID: res.locals.logID,
    });
};
