module.exports ={
    apps: [{
        name: "Mirror",
        script: "./built/src/index.js",
        env: {
            NODE_ENV: "production",
        }
    }]
}