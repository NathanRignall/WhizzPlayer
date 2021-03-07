exports.simple = () => {
    return (req, res, next) => {
        if (req.session.UserID) {
            next();
        } else {
            res.status(401).json({
                message: "User not logged in",
                reqid: res.locals.reqid,
            });
        }
    };
};

exports.edit = () => {
    return (req, res, next) => {
        if (
            req.session.Access == 5 ||
            req.session.Access == 10 ||
            req.session.UserID
        ) {
            next();
        } else if (req.session.UserID) {
            res.status(403).json({
                message: "Access dennied with current user",
                reqid: res.locals.reqid,
            });
        } else {
            res.status(401).json({
                message: "User not logged in",
                reqid: res.locals.reqid,
            });
        }
    };
};

exports.admin = () => {
    return (req, res, next) => {
        if (req.session.Access == 10 || req.session.UserID) {
            // approve and go
            next();
        } else if (req.session.UserID) {
            res.status(403).json({
                message: "Access dennied with current user",
                reqid: res.locals.reqid,
            });
        } else {
            res.status(401).json({
                message: "User not logged in",
                reqid: res.locals.reqid,
            });
        }
    };
};

exports.backend = () => {
    return (req, res, next) => {
        next();
    };
};
