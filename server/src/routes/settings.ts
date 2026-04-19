import { Router, Request, Response } from 'express';
import { Setting } from '../models';
import { requireAuth } from '../middleware/auth';

const router = Router();
const PUBLIC_KEYS = ['site_name', 'site_subtitle', 'phone', 'email', 'whatsapp', 'free_shipping_above', 'shipping_cost'];

router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = await Setting.find({ _id: { $in: PUBLIC_KEYS } });
    const obj: Record<string, string> = {};
    for (const r of rows) obj[String(r._id)] = r.value;
    res.json(obj);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.get('/all', requireAuth, async (_req: Request, res: Response) => {
  try {
    const rows = await Setting.find();
    const obj: Record<string, string> = {};
    for (const r of rows) obj[String(r._id)] = r.value;
    res.json(obj);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const ops = Object.entries(req.body as Record<string, string>).map(([k, v]) => ({
      updateOne: { filter: { _id: k }, update: { $set: { value: String(v) } }, upsert: true },
    }));
    if (ops.length) await Setting.bulkWrite(ops);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

export default router;
