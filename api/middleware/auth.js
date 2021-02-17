exports.simple = () => {
    return (req, res, next) => {
        if (req.session.UserID) {
            // approve and go
            next();
        } else {
            // retun the correct vars
            res.locals.success = false;
            // not logged in
            res.locals.code = 400;
            res.json(responseFormat(res));
        }
    };
};

exports.edit = () => {
    return (req, res, next) => {
        if (req.session.Access == 5 || req.session.Access == 10) {
            // approve and go
            next();
        } else if (req.session.UserID) {
            // retun the correct vars
            res.locals.success = false;
            // no edit access
            res.locals.code = 401;
            res.json(responseFormat(res));
        } else {
            // retun the correct vars
            res.locals.success = false;
            // not logged in
            res.locals.code = 400;
            res.json(responseFormat(res));
        }
    };
};

exports.admin = () => {
    return (req, res, next) => {
        if (req.session.Access == 10) {
            // approve and go
            next();
        } else if (req.session.UserID) {
            // retun the correct vars
            res.locals.success = false;
            // not an admin
            res.locals.code = 402;
            res.json(responseFormat(res));
        } else {
            // retun the correct vars
            res.locals.success = false;
            // not logged in
            res.locals.code = 400;
            res.json(responseFormat(res));
        }
    };
};

exports.backend = () => {
    return (req, res, next) => {
        next();
    };
};
