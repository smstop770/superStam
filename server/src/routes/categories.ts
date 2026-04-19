import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Category } from '../models';
import { requireAuth } from '../middleware/auth';

const router = Router();

function buildTree(cats: any[]): any[] {
  const map: Record<string, any> = {};
  const roots: any[] = [];
  for (const c of cats) map[c.id] = { ...c, children: [] };
  for (const c of cats) {
    if (c.parent_id) map[c.parent_id]?.children.push(map[c.id]);
    else roots.push(map[c.id]);
  }
  return roots;
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const cats = await Category.find().sort({ sort_order: 1, name: 1 });
    res.json(buildTree(cats.map(c => c.toJSON())));
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.get('/flat', async (_req: Request, res: Response) => {
  try {
    const cats = await Category.find().sort({ sort_order: 1, name: 1 });
    res.json(cats);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const cat = await Category.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!cat) return res.status(404).json({ error: 'קטגוריה לא נמצאה' });
    res.json(cat);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, parent_id, sort_order } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'שם וסלאג נדרשים' });
    const cat = await new Category({ _id: uuidv4(), name, slug, description: description || '', image: image || '', parent_id: parent_id || null, sort_order: sort_order || 0 }).save();
    res.status(201).json(cat);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ error: 'סלאג כבר קיים' });
    res.status(500).json({ error: 'שגיאה פנימית' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, slug, description, image, parent_id, sort_order } = req.body;
    const cat = await Category.findByIdAndUpdate(req.params.id, { name, slug, description: description || '', image: image || '', parent_id: parent_id || null, sort_order: sort_order || 0 }, { new: true });
    if (!cat) return res.status(404).json({ error: 'לא נמצא' });
    res.json(cat);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ error: 'סלאג כבר קיים' });
    res.status(500).json({ error: 'שגיאה פנימית' });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

export default router;
