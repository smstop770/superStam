import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/products
router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { category, search, featured, limit, offset } = req.query;

  let sql = 'SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
  const params: any[] = [];

  if (category) {
    // Include products from subcategories too
    const cat = db.prepare('SELECT id FROM categories WHERE id = ? OR slug = ?').get(category, category) as any;
    if (cat) {
      const subs = db.prepare('SELECT id FROM categories WHERE id = ? OR parent_id = ?').all(cat.id, cat.id) as any[];
      const ids = subs.map(s => s.id);
      sql += ` AND p.category_id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
    }
  }

  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (featured === '1' || featured === 'true') {
    sql += ' AND p.is_featured = 1';
  }

  sql += ' ORDER BY p.is_featured DESC, p.sort_order, p.created_at DESC';

  const lim = Math.min(parseInt(limit as string) || 50, 100);
  const off = parseInt(offset as string) || 0;
  sql += ` LIMIT ${lim} OFFSET ${off}`;

  const products = db.prepare(sql).all(...params);
  const parsed = products.map((p: any) => ({
    ...p,
    images: JSON.parse(p.images || '[]'),
    variants: JSON.parse(p.variants || '[]'),
    is_featured: Boolean(p.is_featured),
    is_active: Boolean(p.is_active),
  }));

  res.json(parsed);
});

// GET /api/products/:id
router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const p = db.prepare('SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ? OR p.slug = ?')
    .get(req.params.id, req.params.id) as any;
  if (!p) return res.status(404).json({ error: 'מוצר לא נמצא' });
  res.json({ ...p, images: JSON.parse(p.images || '[]'), variants: JSON.parse(p.variants || '[]') });
});

// POST /api/products - admin
router.post('/', requireAuth, (req: Request, res: Response) => {
  const { category_id, name, slug, description, price, original_price, images, stock, variants, is_featured, is_active, sort_order } = req.body;
  if (!category_id || !name || !slug || price == null) return res.status(400).json({ error: 'שדות חובה חסרים' });

  const db = getDb();
  const id = uuidv4();
  try {
    db.prepare(`INSERT INTO products (id,category_id,name,slug,description,price,original_price,images,stock,variants,is_featured,is_active,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(id, category_id, name, slug, description || '', price, original_price || null, JSON.stringify(images || []), stock ?? 0, JSON.stringify(variants || []), is_featured ? 1 : 0, is_active !== false ? 1 : 0, sort_order || 0);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
    res.status(201).json({ ...product, images: JSON.parse(product.images), variants: JSON.parse(product.variants) });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) return res.status(400).json({ error: 'סלאג כבר קיים' });
    throw err;
  }
});

// PUT /api/products/:id - admin
router.put('/:id', requireAuth, (req: Request, res: Response) => {
  const { category_id, name, slug, description, price, original_price, images, stock, variants, is_featured, is_active, sort_order } = req.body;
  const db = getDb();
  try {
    db.prepare(`UPDATE products SET category_id=?,name=?,slug=?,description=?,price=?,original_price=?,images=?,stock=?,variants=?,is_featured=?,is_active=?,sort_order=? WHERE id=?`)
      .run(category_id, name, slug, description || '', price, original_price || null, JSON.stringify(images || []), stock ?? 0, JSON.stringify(variants || []), is_featured ? 1 : 0, is_active !== false ? 1 : 0, sort_order || 0, req.params.id);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
    if (!product) return res.status(404).json({ error: 'לא נמצא' });
    res.json({ ...product, images: JSON.parse(product.images), variants: JSON.parse(product.variants) });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) return res.status(400).json({ error: 'סלאג כבר קיים' });
    throw err;
  }
});

// DELETE /api/products/:id - admin
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
