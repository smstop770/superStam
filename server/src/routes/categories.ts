import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

function buildTree(cats: any[]): any[] {
  const map: Record<string, any> = {};
  const roots: any[] = [];
  for (const c of cats) { map[c.id] = { ...c, children: [] }; }
  for (const c of cats) {
    if (c.parent_id) map[c.parent_id]?.children.push(map[c.id]);
    else roots.push(map[c.id]);
  }
  return roots;
}

// GET /api/categories - public
router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all();
  res.json(buildTree(cats));
});

// GET /api/categories/flat - public (flat list)
router.get('/flat', (_req: Request, res: Response) => {
  const db = getDb();
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all();
  res.json(cats);
});

// GET /api/categories/:id - public
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const cat = db.prepare('SELECT * FROM categories WHERE id = ? OR slug = ?').get(req.params.id, req.params.id);
  if (!cat) return res.status(404).json({ error: 'קטגוריה לא נמצאה' });
  res.json(cat);
});

// POST /api/categories - admin
router.post('/', requireAuth, (req: Request, res: Response) => {
  const { name, slug, description, image, parent_id, sort_order } = req.body;
  if (!name || !slug) return res.status(400).json({ error: 'שם וסלאג נדרשים' });

  const db = getDb();
  const id = uuidv4();
  try {
    db.prepare(`INSERT INTO categories (id, name, slug, description, image, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(id, name, slug, description || '', image || '', parent_id || null, sort_order || 0);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json(cat);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) return res.status(400).json({ error: 'סלאג כבר קיים' });
    throw err;
  }
});

// PUT /api/categories/:id - admin
router.put('/:id', requireAuth, (req: Request, res: Response) => {
  const { name, slug, description, image, parent_id, sort_order } = req.body;
  const db = getDb();
  try {
    db.prepare(`UPDATE categories SET name=?, slug=?, description=?, image=?, parent_id=?, sort_order=? WHERE id=?`)
      .run(name, slug, description || '', image || '', parent_id || null, sort_order || 0, req.params.id);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!cat) return res.status(404).json({ error: 'לא נמצא' });
    res.json(cat);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) return res.status(400).json({ error: 'סלאג כבר קיים' });
    throw err;
  }
});

// DELETE /api/categories/:id - admin
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
