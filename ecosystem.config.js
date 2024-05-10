module.exports = {
  apps: [
    {
      name: "Linking-pal",
      script: "dist/index.js", // Path to your main application file
      watch: true, // Enable file watch and automatic restart
      ignore_watch: ["node_modules", "logs"], // Directories or files to ignore watching
      env: {
        NODE_ENV: "development" // Environment variables
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
