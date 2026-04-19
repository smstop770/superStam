module.exports = {
  apps: [
    // ── 1. Express server — API + serves React client on port 80 ──
    {
      name: 'super-stam-server',
      script: './server/dist/index.js',
      cwd: '/root/NewPro/super-stam',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 80,
      },
    },
  ],
};
