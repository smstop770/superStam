import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { getDb } from './db';
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import productsRoutes from './routes/products';
import ordersRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

// Init DB on startup
getDb();

// Middleware
app.use(cors({
  origin: isProd ? '*' : (process.env.CLIENT_URL || 'http://localhost:5173'),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
const fs = require('fs');
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ── Serve React client in production ──────────────────────────────
if (isProd) {
  const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
  if (fs.existsSync(clientDist)) {
    // Serve static assets (JS, CSS, images)
    app.use(express.static(clientDist));
    // SPA fallback — send index.html for any unknown route
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
    console.log(`📦 Serving React client from ${clientDist}`);
  }
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'שגיאה פנימית' });
});

app.listen(PORT, () => {
  console.log(`✅ Super STaM running on http://localhost:${PORT} [${isProd ? 'production' : 'development'}]`);
});
