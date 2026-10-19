import { Router } from 'express';
import {
  deleteProduct,
  getAdminProducts,
  getProduct,
  getProducts,
  patchProduct,
  permanentlyDeleteProductController,
  postProduct,
} from '../controllers/productController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { productInput } from '../validation.js';

export const storeProductRoutes = Router();
export const adminProductRoutes = Router();

storeProductRoutes.get('/', getProducts);
storeProductRoutes.get('/:id', getProduct);

adminProductRoutes.get('/', getAdminProducts);
adminProductRoutes.post('/', validateRequest(productInput), postProduct);
adminProductRoutes.patch('/:id', validateRequest(productInput), patchProduct);
adminProductRoutes.delete('/:id/permanent', permanentlyDeleteProductController);
adminProductRoutes.delete('/:id', deleteProduct);
