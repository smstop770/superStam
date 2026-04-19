import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "שם משתמש וסיסמה נדרשים" });
    const user = await AdminUser.findOne({ username }) as any;
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "שם משתמש או סיסמה שגויים" });
    }
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );
    res.json({ token, username: user.username });
  } catch { res.status(500).json({ error: "שגיאה פנימית" }); }
});

router.get("/me", requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ id: req.adminId, username: req.adminUsername });
});

router.put("/password", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6)
      return res.status(400).json({ error: "נתונים לא תקינים" });
    const user = await AdminUser.findById(req.adminId) as any;
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash))
      return res.status(401).json({ error: "סיסמה נוכחית שגויה" });
    user.password_hash = bcrypt.hashSync(newPassword, 10);
    await user.save();
    res.json({ success: true });
  } catch { res.status(500).json({ error: "שגיאה פנימית" }); }
});

export default router;
