var axios = require("axios");

const urlGrab = process.env.API_URL + "/backend/grab";

exports.grabTrack = async function () {
    await axios
        .get(urlGrab)
        .then((response) => {
            if (response.status == 200) {
                var json = response.data.payload;
                console.log(player.play(json));
            } else {
                console.log("wtf wierd error");
            }
        })
        .catch((error) => {
            if (error.response) {
                if (error.response.status != 404) {
                    console.log("server error");
                }
            } else if (error.request) {
                console.log("no response");
            } else {
                console.log("no axios error");
            }
        });
};
