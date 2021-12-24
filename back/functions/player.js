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
        volume: 0,
    };

    this.play = function (json) {
        // first check if a track is playing on the system
        if (this.status.playing == true) {
            logger.error({
                details: "Track already playing",
                json: json,
            });
            return {
                success: false,
                server: false,
                message: "Track already playing",
            };
        }
        // next check if json was sent
        if (!json) {
            logger.error({
                location: "/backend/player.js/play-1",
                from: "json",
                message: "No details in request",
            });
            return {
                success: false,
                server: true,
                message: "No details in request",
                error: {
                    location: "/backend/player.js/play-1",
                    from: "json",
                    message: "No details in request",
                },
            };
        }
        // set the this vars
        this.status.playing = true;
        this.status.json = json;
        this.status.file = uploadPath + "/save/" + json.id;
        this.status.volume = json.volume ? json.volume : 99;
        // log the current satus
        logger.playback({
            action: "play",
            details: "Play track",
            status: this.status,
        });

        // check if the file exists
        if (fs.existsSync(this.status.file)) {
            // format volume factor
            let volumeFactor = Math.round((32768 * this.status.volume) / 100);
            // start process
            this.process = spawn(
                "mpg123",
                ["-f", volumeFactor, this.status.file],
                this.options
            );
            // make sure the process started
            if (!this.process) {
                this.status.playing = false;
                logger.error({
                    location: "/backend/player.js/play-2",
                    message: "Error starting process",
                    status: this.status,
                });
                return {
                    success: false,
                    server: true,
                    message: "Error starting process",
                    error: {
                        location: "/backend/player.js/play-2",
                        from: "state",
                        message: "Error starting process",
                    },
                };
            }
            // on process close
            this.process.on("close", (code) => {
                this.status.playing = false;
                logger.playback({
                    action: "end",
                    details: "Playback ended",
                    status: this.status,
                });
            });
            // return to reg
            return {
                success: true,
                message: "Playing track",
            };
        } else {
            this.status.playing = false;
            logger.error({
                location: "/backend/player.js/play-3",
                from: "fs",
                message: "File does not exist",
                status: this.status,
            });
            return {
                success: false,
                server: true,
                message: "File does not exist",
                error: {
                    location: "/backend/player.js/play-3",
                    from: "fs",
                    message: "File does not exist",
                },
            };
        }
    };

    this.halt = function () {
        if (this.process) {
            if (this.status.playing == true) {
                this.process.kill();
                this.status.playing = false;
                logger.playback({
                    action: "halt",
                    details: "Playback ended",
                    status: this.status,
                });
                return {
                    success: true,
                    message: "Halted track",
                };
            } else {
                logger.info({
                    action: "halt",
                    details: "No track currently playing",
                });
                return {
                    success: false,
                    server: false,
                    message: "No track currently playing",
                };
            }
        } else {
            logger.info({
                action: "halt",
                details: "No track currently playing",
            });
            return {
                success: false,
                server: false,
                message: "No track currently playing",
            };
        }
    };
}

module.exports = function (opts) {
    return new Player(opts);
};
