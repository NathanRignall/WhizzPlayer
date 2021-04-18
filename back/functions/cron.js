var axios = require("axios");

const urlGrab = process.env.API_URL + "/backend/grab";

exports.grabTrack = async function () {
    await axios
        .get(urlGrab)
        .then((response) => {
            var json = response.data.payload;
            player.play(json);
        })
        .catch((error) => {
            if (error.response) {
                if (error.response.status != 400) {
                    console.log("server error");
                    logger.error("server error from api in cron");
                } else {
                    logger.debug("no song to play in cron");
                }
            } else if (error.request) {
                logger.error("no response from api in cron");
            } else {
                logger.error("axios error in cron");
            }
        });
};
