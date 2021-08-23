module.exports = {
    async rewrites() {
        return [
            {
                source: "/api/:slug*",
                destination: "http://localhost:4000/:slug*",
            },
        ];
    },
};
