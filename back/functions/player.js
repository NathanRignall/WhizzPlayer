var spawn = require("child_process").spawn;

function Player(opts) {
    this.options = {
        stdio: "ignore",
    };

    this.status = {
        Playing: false,
        File: null,
    };

    this.play = function (file) {
        if (this.status.Playing == true)
            return {
                Success: false,
                Message: "Song already playing",
            };

        if (!file)
            return {
                Success: false,
                Message: "No song file in request",
            };

        this.status.Playing = true;

        var process = spawn("mpg123", [file], this.options);

        if (!process) {
            this.status.Playing = false;
            return {
                Success: false,
                Message: "Error starting process",
            };
        }

        process.on("close", (error) => {
            this.status.Playing = false;
            if (error) {
                console.log(error);
            }
        });

        return {
            Success: true,
            Message: "Playing track",
        };
    };
}

module.exports = function (opts) {
    return new Player(opts);
};
