import { Router } from 'express';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { adminOrderRoutes, storeOrderRoutes } from './routes/orderRoutes.js';
import { adminProductRoutes, storeProductRoutes } from './routes/productRoutes.js';
import { adminChatRoutes, customerChatRoutes } from './routes/chatRoutes.js';

const api = Router();
const adminApi = Router();

api.use('/auth', authRoutes);
api.use('/products', storeProductRoutes);
api.use('/orders', storeOrderRoutes);
api.use('/chat', customerChatRoutes);

adminApi.use('/chat', adminChatRoutes);
adminApi.use('/', adminRoutes);

export { api, adminApi };
