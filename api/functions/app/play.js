var axios = require("axios");

var urlTestPlay = "http://back:5000/test/play/";

exports.temp = function (req, res, next) {
    res.send("temp");
};

exports.test = function (req, res, next) {
    axios
        .get(urlTestPlay)
        .then((response) => {
            res.locals.success = true;
            res.locals.code = 100;
            res.json(responseFormat(res));
        })
        .catch((error) => {
            res.locals.errors.push({ code: error.code, from: "axios" });
            res.locals.success = false;
            res.locals.code = 500;
            res.json(responseFormat(res));
        });
};
