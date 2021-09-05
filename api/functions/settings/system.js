// tempoary response
exports.temp = function (req, res, next) {
    nconf.set("playback:volume:music", 60);
    nconf.save(configSave);

    res.send("temp");
};
