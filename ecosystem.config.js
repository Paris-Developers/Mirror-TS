module.exports ={
    apps: [{
        name: "Mirror",
        script: "./built/src/index.js",
        // stops another Node process of the same account (like the one yt-dlp starts to run
        // YouTube's code) from opening Mirror's debugger. Node's docs only name the SIGUSR1 signal,
        // but on Windows the flag also skips the hook process._debugProcess() needs
        // (should_start_debug_signal_handler in Node's src/env-inl.h, used by src/inspector_agent.cc)
        node_args: ["--disable-sigusr1"],
        // Mirror exits with 78 when config.json's production_host names another machine, and
        // restarting it would only refuse to log in again
        stop_exit_codes: [78],
        env: {
            NODE_ENV: "production",
        }
    }]
}