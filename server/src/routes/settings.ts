import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const PUBLIC_KEYS = ['site_name', 'site_subtitle', 'phone', 'email', 'whatsapp', 'free_shipping_above', 'shipping_cost'];

// GET /api/settings - public (subset)
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare(`SELECT key, value FROM settings WHERE key IN (${PUBLIC_KEYS.map(() => '?').join(',')})`)
    .all(...PUBLIC_KEYS) as any[];
  const obj: Record<string, string> = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

// GET /api/settings/all - admin
router.get('/all', requireAuth, (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
  const obj: Record<string, string> = {};
  for (const r of rows) obj[r.key] = r.value;
  res.json(obj);
});

// PUT /api/settings - admin
router.put('/', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const updateMany = db.transaction((data: Record<string, string>) => {
    for (const [k, v] of Object.entries(data)) upsert.run(k, String(v));
  });
  updateMany(req.body);
  res.json({ success: true });
});

export default router;
