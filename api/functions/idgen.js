// load the dependancies
var intformat = require("biguint-format");
var flakeID = require("flake-idgen");

// create the flakeID objects
var idgenUser = new flakeID();
var idgenCue = new flakeID();
var idgenGrid = new flakeID();
var idgenGridItem = new flakeID();
var idgenTrack = new flakeID();

// export the various functions to generate IDs
exports.genterateUserID = function () {
    return String(intformat(idgenUser.next(), "dec"));
};

exports.genterateGridID = function () {
    return String(intformat(idgenGrid.next(), "dec"));
};

exports.genterateGridItemID = function () {
    return String(intformat(idgenGridItem.next(), "dec"));
};

exports.genterateCueID = function () {
    return String(intformat(idgenCue.next(), "dec"));
};

exports.genterateTrackID = function () {
    return String(intformat(idgenTrack.next(), "dec"));
};
