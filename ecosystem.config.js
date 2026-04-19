module.exports = {
  apps: [
    {
      name: 'super-stam',
      script: './server/dist/index.js',
      cwd: '/root/NewPro/super-stam',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};
