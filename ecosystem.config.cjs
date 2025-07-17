module.exports = {
  apps: [
    {
      name: "padelero-backend",
      script: "./src/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};