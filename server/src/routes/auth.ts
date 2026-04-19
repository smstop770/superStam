import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'שם משתמש וסיסמה נדרשים' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'שם משתמש או סיסמה שגויים' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );

  res.json({ token, username: user.username });
});

router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

router.put('/password', requireAuth, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'נתונים לא תקינים' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.adminId) as any;
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    return res.status(401).json({ error: 'סיסמה נוכחית שגויה' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, req.adminId);
  res.json({ success: true });
});

export default router;
