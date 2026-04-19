const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

http.createServer((req, res) => {
  let filePath = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));

  // SPA fallback — serve index.html for unknown routes
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'public, max-age=31536000');

  fs.createReadStream(filePath)
    .on('error', () => {
      res.writeHead(404);
      res.end('Not found');
    })
    .pipe(res);
}).listen(PORT, () => {
  console.log(`✅ Client serving on http://localhost:${PORT}`);
});
