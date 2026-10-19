import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { customerLogin, getCustomerSession, login, register } from '../controllers/authController.js';
import { requireCustomer } from '../middleware/requireCustomer.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { customerLoginInput, customerRegistrationInput, loginInput } from '../validation.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please try again later.' },
});

router.post('/login', loginLimiter, validateRequest(loginInput), login);
router.post('/register', loginLimiter, validateRequest(customerRegistrationInput), register);
router.post('/customer/login', loginLimiter, validateRequest(customerLoginInput), customerLogin);
router.get('/customer/session', requireCustomer, getCustomerSession);

export default router;
