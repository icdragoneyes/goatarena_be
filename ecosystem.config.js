module.exports = {
  apps: [
    {
      name: "overunder",
      script: "./src/server.js", // Adjust the path to your main script
      instances: 1, // Number of instances to run, or 'max' to scale based on CPU cores
      autorestart: true,
      watch: false, // Set to true to watch for file changes
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: "development",
        BOT_TOKEN: process.env.BOT_TOKEN,
        JWT_SECRET: process.env.JWT_SECRET,
      },
      env_production: {
        NODE_ENV: "production",
        BOT_TOKEN: process.env.BOT_TOKEN,
        JWT_SECRET: process.env.JWT_SECRET,
      },
    },
  ],
};
