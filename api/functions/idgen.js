var intformat = require("biguint-format");
var flakeID = require("flake-idgen");

var idgenUser = new flakeID();
var idgenCue = new flakeID();
var idgenTrack = new flakeID();

exports.genterateUserID = function () {
    return String(intformat(idgenUser.next(), "dec"));
};

exports.genterateCueID = function () {
    return String(intformat(idgenCue.next(), "dec"));
};

exports.genterateTrackID = function () {
    return String(intformat(idgenTrack.next(), "dec"));
};
