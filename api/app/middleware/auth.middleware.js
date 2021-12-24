exports.simple = () => {
    return (req, res, next) => {
        // check if the user is logged in
        if (req.session.user) {
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
        // check if the user is logged in
        if (req.session.user) {
            // check if the user has edit permisions
            if (req.session.user.access == 5 || req.session.user.access == 10) {
                next();
            } else {
                res.status(403).json({
                    message: "Access dennied with current user",
                    reqid: res.locals.reqid,
                });
            }
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
        // check if the user is logged in
        if (req.session.user) {
            // check if the user has edit permisions
            if (req.session.user.access == 10) {
                next();
            } else {
                res.status(403).json({
                    message: "Access dennied with current user",
                    reqid: res.locals.reqid,
                });
            }
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
        // temporary backend authentication (none existant)
        next();
    };
};
