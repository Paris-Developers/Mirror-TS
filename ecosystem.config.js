module.exports ={
    apps: [{
        name: "Mirror",
        script: "./built/src/index.js",
        // Mirror exits with 78 when config.json's production_host names another machine, and
        // restarting it would only refuse to log in again
        stop_exit_codes: [78],
        env: {
            NODE_ENV: "production",
        }
    }]
}