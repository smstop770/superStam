import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getDb } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

async function sendVoiceCallToAdmins(order: any, adminPhones: string) {
  const token   = process.env.YEMOT_TOKEN;
  const did     = process.env.YEMOT_DID;
  const apiUrl  = process.env.YEMOT_API_URL || 'https://call2all.co.il/ymot/api';

  if (!token) { console.warn('YEMOT_TOKEN not set — skipping voice calls'); return; }

  const phones = adminPhones.split(',').map(p => p.trim()).filter(Boolean);
  if (!phones.length) return;

  const ttsMessage =
    `הזמנה חדשה התקבלה בסופר סת"ם! ` +
    `שם הלקוח: ${order.customer_name}. ` +
    `טלפון: ${order.customer_phone}. ` +
    `סכום: ${order.total} שקלים. ` +
    `מספר הזמנה: ${order.id.slice(0, 8)}. ` +
    `תודה!`;

  for (const phone of phones) {
    const params = new URLSearchParams({
      token,
      phones: phone,
      callerId: did || '',
      ttsVoice: 'Jacob',
      ttsMessage,
    });

    try {
      const res = await axios.post(`${apiUrl}/SendTTS`, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      });
      console.log(`Voice call to ${phone}:`, res.data);
    } catch (err: any) {
      console.error(`Voice call to ${phone} failed:`, err?.message);
    }
  }
}

async function sendWebhook(order: any, webhookUrl: string) {
  try {
    await axios.post(webhookUrl, order, { timeout: 10000 });
    getDb().prepare('UPDATE orders SET webhook_sent = 1 WHERE id = ?').run(order.id);
  } catch (err) {
    console.error('Webhook error:', err);
  }
}

// POST /api/orders - public (create order)
router.post('/', async (req: Request, res: Response) => {
  const { customer_name, customer_phone, customer_email, customer_address, customer_city, items, notes } = req.body;

  if (!customer_name || !customer_phone || !items?.length) {
    return res.status(400).json({ error: 'שם, טלפון ופריטים נדרשים' });
  }

  const db = getDb();
  const settings = db.prepare('SELECT key, value FROM settings').all() as any[];
  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  const shippingCost = parseFloat(settingsMap.shipping_cost || '30');
  const freeShippingAbove = parseFloat(settingsMap.free_shipping_above || '300');

  // Validate items and calculate total
  let subtotal = 0;
  const enrichedItems: any[] = [];
  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id) as any;
    if (!product) return res.status(400).json({ error: `מוצר ${item.product_id} לא נמצא` });
    const qty = Math.max(1, parseInt(item.quantity) || 1);
    subtotal += product.price * qty;
    enrichedItems.push({ product_id: product.id, name: product.name, price: product.price, quantity: qty, variant: item.variant || {} });
  }

  const shipping = subtotal >= freeShippingAbove ? 0 : shippingCost;
  const total = subtotal + shipping;

  const id = uuidv4();
  const orderData = {
    id,
    customer_name,
    customer_phone,
    customer_email: customer_email || '',
    customer_address: customer_address || '',
    customer_city: customer_city || '',
    items: enrichedItems,
    subtotal,
    shipping,
    total,
    notes: notes || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  db.prepare(`INSERT INTO orders (id,customer_name,customer_phone,customer_email,customer_address,customer_city,items,subtotal,shipping,total,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, customer_name, customer_phone, customer_email || '', customer_address || '', customer_city || '', JSON.stringify(enrichedItems), subtotal, shipping, total, notes || '');

  // Send webhook
  const webhookUrl = settingsMap.order_webhook_url;
  if (webhookUrl) {
    sendWebhook(orderData, webhookUrl).catch(() => {});
  }

  // Send voice calls to all admin phones
  const voicePhones = settingsMap.voice_admin_phones || '';
  if (voicePhones) {
    sendVoiceCallToAdmins(orderData, voicePhones).catch(() => {});
  }

  res.status(201).json({ success: true, orderId: id, total, shipping });
});

// GET /api/orders - admin
router.get('/', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const { status, limit, offset } = req.query;
  let sql = 'SELECT * FROM orders';
  const params: any[] = [];
  if (status) { sql += ' WHERE status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';
  const lim = Math.min(parseInt(limit as string) || 50, 100);
  const off = parseInt(offset as string) || 0;
  sql += ` LIMIT ${lim} OFFSET ${off}`;

  const orders = db.prepare(sql).all(...params);
  const parsed = orders.map((o: any) => ({ ...o, items: JSON.parse(o.items || '[]') }));
  res.json(parsed);
});

// GET /api/orders/:id - admin
router.get('/:id', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as any;
  if (!order) return res.status(404).json({ error: 'הזמנה לא נמצאה' });
  res.json({ ...order, items: JSON.parse(order.items || '[]') });
});

// PUT /api/orders/:id/status - admin
router.put('/:id/status', requireAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const valid = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'סטטוס לא תקין' });
  const db = getDb();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// DELETE /api/orders/:id - admin
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
