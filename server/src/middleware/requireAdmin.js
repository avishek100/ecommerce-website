import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export async function requireAdmin(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Admin sign-in is required.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.sub).select('_id name email role');
    if (!admin || admin.role !== 'admin') {
      return res.status(401).json({ message: 'Your admin session is no longer valid.' });
    }
    req.admin = admin;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Your admin session has expired. Please sign in again.' });
    }
    return next(error);
  }
}
