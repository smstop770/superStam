module.exports = {
  apps: [
    // ── 1. Express API server — port 4003 ─────────────────────────
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
        PORT: 4003,
      },
    },

    // ── 2. React client static server — port 5173 ─────────────────
    {
      name: 'superStamClient',
      script: 'serve',
      args: '-s dist -l 5173',
      cwd: '/root/NewPro/super-stam/client',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
