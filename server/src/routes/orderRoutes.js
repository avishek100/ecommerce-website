import { Router } from 'express';
import { getCustomerOrders, getOrders, patchOrderStatus, postOrder } from '../controllers/orderController.js';
import { optionalCustomer } from '../middleware/optionalCustomer.js';
import { requireCustomer } from '../middleware/requireCustomer.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { orderInput, orderStatusInput } from '../validation.js';

export const storeOrderRoutes = Router();
export const adminOrderRoutes = Router();

storeOrderRoutes.post('/', optionalCustomer, validateRequest(orderInput), postOrder);
storeOrderRoutes.get('/mine', requireCustomer, getCustomerOrders);

adminOrderRoutes.get('/', getOrders);
adminOrderRoutes.patch('/:id', validateRequest(orderStatusInput), patchOrderStatus);
