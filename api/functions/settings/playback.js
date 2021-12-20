/*
    Nathan Rignall 2021
    Updated code styling 20/12/2021
    API functions for playback settings
*/

// get info on all the playback config
exports.info = function (req, res, next) {
    const playback = nconf.get("playback");
    
    // retun the correct vars
    res.status(200).json({
        payload: playback,
        message: "okay",
        reqid: res.locals.reqid,
    });
};

// set the volume for specific volumeID in config
exports.volumeSet = function (req, res, next) {
    // get req parms
    const VolumeID = req.params.volumeid;

    // get the info from json
    const json = req.body;
    // set the vars from post
    const Volume = json.volume;

    // get nconf current
    const playback = nconf.get("playback");

    // check if given the volumeid right parameters
    if (!Volume) {
        // retun the correct vars
        return res.status(400).json({
            message: "No volumeID parameter",
            reqid: res.locals.reqid,
        });
    }

    // check if given the volume right parameters
    if (!Volume) {
        // retun the correct vars
        return res.status(400).json({
            message: "No volume parameter",
            reqid: res.locals.reqid,
        });
    }

    // check if volumeid is valid
    if(!playback.volume.hasOwnProperty(VolumeID)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Invalid volumeID",
            reqid: res.locals.reqid,
        });
    }

    // check if volumeid has anything that could break nconf
    if(VolumeID.includes(":")) {
        // retun the correct vars
        return res.status(400).json({
            message: "Invalid chars in volumeID",
            reqid: res.locals.reqid,
        });
    }

    // check if volume is an integer
    if(!Number.isInteger(Volume)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Volume is not a recognised integer",
            reqid: res.locals.reqid,
        });
    }
    
    // check if volume is within bounds
    if(!(0 <= Volume <= 100)) {
        // retun the correct vars
        return res.status(400).json({
            message: "Volume is out of bounds",
            reqid: res.locals.reqid,
        });
    }

    // actually set the nconf value
    nconf.set(`playback:volume:${VolumeID}`, Volume);
    nconf.save(configSave);

    // retun the correct vars
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};

// set the system to enabled or disabled
exports.enabledSet = function (req, res, next) {
    // get the info from json
    const json = req.body;
    // set the vars from post
    const Enabled = json.enabled;
    
    // check if enabled parameter
    if(!json.hasOwnProperty("enabled")) {
        // retun the correct vars
        return res.status(400).json({
            message: "No enabled parameter",
            reqid: res.locals.reqid,
        });
    }

    // check if enabled is boolean
    if(typeof Enabled != "boolean") {
        // retun the correct vars
        return res.status(400).json({
            message: "Enabled parameter is not boolean",
            reqid: res.locals.reqid,
        });
    }

    // set the nconf value
    nconf.set(`playback:enabled`, Enabled);
    nconf.save(configSave);

    // retun the correct vars
    res.status(200).json({
        message: "okay",
        reqid: res.locals.reqid,
    });
};