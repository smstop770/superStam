import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Product, Category } from '../models';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, featured, limit, offset } = req.query;
    const filter: any = { is_active: true };
    if (category) {
      const cat = await Category.findOne({ $or: [{ _id: category }, { slug: category }] });
      if (cat) {
        const subs = await Category.find({ $or: [{ _id: cat._id }, { parent_id: cat._id }] });
        filter.category_id = { $in: subs.map(s => String(s._id)) };
      }
    }
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    if (featured === '1' || featured === 'true') filter.is_featured = true;
    const lim = Math.min(parseInt(limit as string) || 50, 100);
    const off = parseInt(offset as string) || 0;
    const ps = await Product.find(filter).sort({ is_featured: -1, sort_order: 1, created_at: -1 }).skip(off).limit(lim);
    const catIds = [...new Set(ps.map(p => (p as any).category_id))];
    const cats = await Category.find({ _id: { $in: catIds } });
    const catMap: Record<string, any> = {};
    for (const c of cats) catMap[String(c._id)] = c.toJSON();
    res.json(ps.map(p => { const o = p.toJSON() as any; return { ...o, category_name: catMap[o.category_id]?.name || '', category_slug: catMap[o.category_id]?.slug || '' }; }));
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const p = await Product.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!p) return res.status(404).json({ error: 'מוצר לא נמצא' });
    const cat = await Category.findById((p as any).category_id);
    const cj = cat ? (cat.toJSON() as any) : {};
    res.json({ ...(p.toJSON() as any), category_name: cj.name || '', category_slug: cj.slug || '' });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category_id, name, slug, description, price, original_price, images, stock, variants, is_featured, is_active, sort_order } = req.body;
    if (!category_id || !name || !slug || price == null) return res.status(400).json({ error: 'שדות חובה חסרים' });
    const p = await new Product({ _id: uuidv4(), category_id, name, slug, description: description || '', price, original_price: original_price || null, images: images || [], stock: stock ?? 0, variants: variants || [], is_featured: !!is_featured, is_active: is_active !== false, sort_order: sort_order || 0 }).save();
    res.status(201).json(p);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ error: 'סלאג כבר קיים' });
    res.status(500).json({ error: 'שגיאה פנימית' });
  }
});

router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category_id, name, slug, description, price, original_price, images, stock, variants, is_featured, is_active, sort_order } = req.body;
    const p = await Product.findByIdAndUpdate(req.params.id, { category_id, name, slug, description: description || '', price, original_price: original_price || null, images: images || [], stock: stock ?? 0, variants: variants || [], is_featured: !!is_featured, is_active: is_active !== false, sort_order: sort_order || 0 }, { new: true });
    if (!p) return res.status(404).json({ error: 'לא נמצא' });
    res.json(p);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ error: 'סלאג כבר קיים' });
    res.status(500).json({ error: 'שגיאה פנימית' });
  }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

export default router;
