import jwt from 'jsonwebtoken';
import { Customer } from '../models/Customer.js';

export async function requireCustomer(req, res, next) {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Please sign in to access your account.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'customer') {
      return res.status(403).json({ message: 'A customer account is required.' });
    }
    const customer = await Customer.findById(payload.sub).select('_id name email');
    if (!customer) return res.status(401).json({ message: 'Your account session is no longer valid.' });
    req.customer = customer;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    }
    return next(error);
  }
}
