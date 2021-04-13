const spawn = require("child_process").spawn;
const fs = require("fs");
const path = require("path");

const uploadPath =
    process.env.NODE_ENV == "production"
        ? "/uploads"
        : path.resolve(__dirname, "../../uploads");

function Player(opts) {
    this.options = {
        stdio: "ignore",
    };

    this.status = {
        playing: false,
        json: {},
        file: "",
    };

    this.play = function (json) {
        // first check if a song is playing on the system
        if (this.status.playing == true)
            return {
                success: false,
                message: "Song already playing",
                error: {
                    location: "/backend/player.js/play-1",
                    from: "state",
                },
            };
        // next check if json was sent
        if (!json)
            return {
                success: false,
                message: "No details in request",
                error: {
                    location: "/backend/player.js/play-2",
                    from: "file",
                },
            };
        // set the this vars
        this.status.playing = true;
        this.status.json = json;
        this.status.file = uploadPath + "/save/" + json.TrackID;
        // log the current satus
        console.log(
            JSON.stringify({
                action: "play",
                status: this.status,
            })
        );
        // check if the file exists
        if (fs.existsSync(this.status.file)) {
            this.process = spawn("mpg123", [this.status.file], this.options);
            // make sure the process started
            if (!this.process) {
                this.status.playing = false;
                console.log(
                    JSON.stringify({
                        action: "error",
                        message: "Error starting process",
                        status: this.status,
                    })
                );
                return {
                    success: false,
                    message: "Error starting process",
                    error: {
                        location: "/backend/player.js/play-3",
                        from: "state",
                    },
                };
            }
            // on process close
            this.process.on("close", (code) => {
                this.status.playing = false;
                console.log(
                    JSON.stringify({
                        action: "end",
                        message: "Playback ended",
                        status: this.status,
                    })
                );
            });
            // return to reg
            return {
                success: true,
                message: "Playing track",
            };
        } else {
            this.status.playing = false;
            console.log(
                JSON.stringify({
                    action: "error",
                    message: "File does not exist",
                    status: this.status,
                })
            );
            return {
                success: false,
                message: "File does not exist",
                error: {
                    location: "/backend/player.js/play-4",
                    from: "fs",
                },
            };
        }
    };

    this.halt = function () {
        if (this.process) {
            if (this.status.playing == true) {
                this.process.kill();
                this.status.playing = false;
                console.log(
                    JSON.stringify({
                        action: "killed",
                        message: "Playback ended",
                        status: this.status,
                    })
                );
                return {
                    success: true,
                    message: "Halted track",
                };
            } else {
                return {
                    success: false,
                    message: "No track currently playing",
                };
            }
        } else {
            return {
                success: false,
                message: "No track currently playing",
            };
        }
    };
}

module.exports = function (opts) {
    return new Player(opts);
};
