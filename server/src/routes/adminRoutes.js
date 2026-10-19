import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { getSession } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { adminOrderRoutes } from './orderRoutes.js';
import { adminProductRoutes } from './productRoutes.js';

const router = Router();

router.use(requireAdmin);
router.get('/session', getSession);
router.get('/dashboard', getDashboard);
router.use('/products', adminProductRoutes);
router.use('/orders', adminOrderRoutes);

export default router;
