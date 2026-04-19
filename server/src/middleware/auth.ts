import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  adminId?: string;
  adminUsername?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'אין הרשאה' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: string; username: string };
    req.adminId = payload.id;
    req.adminUsername = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'טוקן לא תקין או פג תוקף' });
  }
}
