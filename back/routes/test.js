var express = require("express");
var router = express.Router();
var fs = require("fs");
var stringify = require("csv-stringify");

var someData = [
    {
        Country: "Nigeria",
        Population: "200m",
        Continent: "Africa",
        "Official Language(s)": "English",
    },
    {
        Country: "India",
        Population: "1b",
        Continent: "Asia",
        "Official Language(s)": "Hindi, English",
    },
    {
        Country: "United States of America",
        Population: "328m",
        Continent: "North America",
        "Official Language": "English",
    },
    {
        Country: "United Kingdom",
        Population: "66m",
        Continent: "Europe",
        "Official Language": "English",
    },
    {
        Country: "Brazil",
        Population: "209m",
        Continent: "South America",
        "Official Language": "Portugese",
    },
];

router.get("/write", function (req, res, next) {
    res.send("test!");

    stringify(someData, { header: false }, function (err, output) {
        fs.appendFile("logs.csv", output, function (err) {
            if (err) throw err;
            console.log("Saved!");
        });
    });
});

module.exports = router;
