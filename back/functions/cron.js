var axios = require("axios");

const urlGrab = process.env.API_URL + "/backend/grab";

const grabTrackAgain = function () {
    return setTimeout(function () {
        axios
            .get(urlGrab)
            .then((response) => {
                var json = response.data.payload;
                player.play(json);
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.status != 400) {
                        logger.error("server error from api in cron 2");
                    } else {
                        logger.debug("no song to play in cron 2");
                    }
                } else if (error.request) {
                    logger.error("no response from api in cron 2");
                } else {
                    logger.error("axios error in cron 2");
                }
            });
    }, 10000);
};

exports.grabTrack = function () {
    axios
        .get(urlGrab)
        .then((response) => {
            var json = response.data.payload;
            player.play(json);
        })
        .catch((error) => {
            if (error.response) {
                if (error.response.status != 400) {
                    logger.error("server error from api in cron 1");
                    grabTrackAgain();
                } else {
                    logger.debug("no song to play in cron 1");
                }
            } else if (error.request) {
                logger.error("no response from api in cron 1");
                grabTrackAgain();
            } else {
                logger.error("axios error in cron 1");
                grabTrackAgain();
            }
        });
};
