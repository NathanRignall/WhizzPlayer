var messages = {
    100: "Success",
    101: "Loading",
    200: "General error",
    210: "Missing inputs",
    211: "Malformed inputs",
    212: "Insecure password",
    213: "Email aready used",
    214: "User does not exist",
    215: "Password inccorect",
    400: "Access dennied - Need to login",
    401: "Access dennied - View only account",
    402: "Access dennied - Not an admin",
};

const responseFormat = function (res) {
    var message = messages[res.locals.code];

    return {
        Success: res.locals.success,
        Errors: res.locals.errors,
        Code: res.locals.code,
        Message: message,
        LogID: res.locals.logID,
        Response: res.locals.response,
    };
};

module.exports = responseFormat;
