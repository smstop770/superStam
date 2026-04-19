import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Order, Product, Setting } from '../models';
import { requireAuth } from '../middleware/auth';

const router = Router();

async function sendVoiceCallToAdmins(order: any, adminPhones: any[]) {
  const token  = process.env.YEMOT_TOKEN;
  const did    = process.env.YEMOT_DID;
  const apiUrl = process.env.YEMOT_API_URL || 'https://call2all.co.il/ymot/api';
  if (!token) return;

  const phones = adminPhones.filter((item: any) => item?.name && item?.phone);
  if (!phones.length) return;

  for (const item of phones) {
    const ttsMessage =
      `שלום ${item.name}. ` +
      `הזמנה חדשה התקבלה! ` +
      `שם: ${order.customer_name}. ` +
      `טלפון: ${order.customer_phone}. ` +
      `סכום: ${order.total} שקל. ` +
      `מספר: ${order.id.slice(0, 8)}.`;
    try {
      await axios.post(
        `${apiUrl}/SendTTS`,
        new URLSearchParams({ token, phones: item.phone, callerId: did || '', ttsVoice: 'Jacob', ttsMessage }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
      );
    } catch (err: any) {
      console.error(`Voice call to ${item.name} (${item.phone}) failed:`, err?.message);
    }
  }
}

async function sendWebhook(order: any, webhookUrl: string) {
  try {
    await axios.post(webhookUrl, order, { timeout: 10000 });
    await Order.findByIdAndUpdate(order.id, { webhook_sent: true });
  } catch (err) { console.error('Webhook error:', err); }
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer_name, customer_phone, customer_email, customer_address, customer_city, items, notes } = req.body;
    if (!customer_name || !customer_phone || !items?.length) {
      return res.status(400).json({ error: 'שם, טלפון ופריטים נדרשים' });
    }

    const settingDocs = await Setting.find();
    const s: Record<string, string> = {};
    for (const doc of settingDocs) s[String(doc._id)] = doc.value;

    const shippingCost      = parseFloat(s.shipping_cost || '30');
    const freeShippingAbove = parseFloat(s.free_shipping_above || '300');

    let subtotal = 0;
    const enrichedItems: any[] = [];
    for (const item of items) {
      const product = await Product.findOne({ _id: item.product_id, is_active: true }) as any;
      if (!product) return res.status(400).json({ error: `מוצר ${item.product_id} לא נמצא` });
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      subtotal += product.price * qty;
      enrichedItems.push({ product_id: product._id, name: product.name, price: product.price, quantity: qty, variant: item.variant || {} });
    }

    const shipping = subtotal >= freeShippingAbove ? 0 : shippingCost;
    const total    = subtotal + shipping;
    const id       = uuidv4();

    const orderData = { id, customer_name, customer_phone, customer_email: customer_email || '', customer_address: customer_address || '', customer_city: customer_city || '', items: enrichedItems, subtotal, shipping, total, notes: notes || '', status: 'pending', created_at: new Date().toISOString() };

    await new Order({ _id: id, ...orderData }).save();

    if (s.order_webhook_url) sendWebhook(orderData, s.order_webhook_url).catch(() => {});
    if (s.voice_admin_phones) {
      try {
        const phonesArray = JSON.parse(s.voice_admin_phones);
        sendVoiceCallToAdmins(orderData, phonesArray).catch(() => {});
      } catch { /* invalid JSON — skip */ }
    }

    res.status(201).json({ success: true, orderId: id, total, shipping });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const lim = Math.min(parseInt(limit as string) || 50, 100);
    const off = parseInt(offset as string) || 0;
    const orders = await Order.find(filter).sort({ created_at: -1 }).skip(off).limit(lim);
    res.json(orders);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'הזמנה לא נמצאה' });
    res.json(order);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.put('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const valid = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'סטטוס לא תקין' });
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

export default router;
