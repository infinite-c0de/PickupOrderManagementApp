module.exports = {
  apps: [
    {
      name: "layver-web",
      cwd: "./",
      script: "npm",
      args: "run start:web",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "layver-admin",
      cwd: "./",
      script: "npm",
      args: "run start:admin",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "layver-user",
      cwd: "./",
      script: "npm",
      args: "run start:user",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "layver-partner",
      cwd: "./",
      script: "npm",
      args: "run start:partner",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
}
