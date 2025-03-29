module.exports = {
    apps: [
      {
        name: "core-node",
        script: "dist/server.js",
        instances: "max",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
          PORT: 3000
        },
        env_development: {
          NODE_ENV: "development",
          PORT: 3000
        }
      }
    ]
  };
  