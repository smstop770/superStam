import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Contact } from '../models';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/contact — public
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'שם והודעה נדרשים' });
    await new Contact({ _id: uuidv4(), name, phone: phone || '', email: email || '', message }).save();
    res.status(201).json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

// GET /api/contact — admin
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    const contacts = await Contact.find(filter).sort({ created_at: -1 });
    res.json(contacts);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

// PUT /api/contact/:id/read — mark as read
router.put('/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const c = await Contact.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'לא נמצא' });
    if ((c as any).status === 'new') await Contact.findByIdAndUpdate(req.params.id, { status: 'read' });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

// PUT /api/contact/:id/reply — admin reply
router.put('/:id/reply', requireAuth, async (req: Request, res: Response) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ error: 'תגובה נדרשת' });
    const c = await Contact.findByIdAndUpdate(req.params.id, { reply, status: 'replied', replied_at: new Date() }, { new: true });
    if (!c) return res.status(404).json({ error: 'לא נמצא' });
    res.json(c);
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

// DELETE /api/contact/:id — admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'שגיאה פנימית' }); }
});

export default router;
