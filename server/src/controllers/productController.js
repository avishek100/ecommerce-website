import {
  archiveProduct,
  createProduct,
  getStoreProduct,
  listAdminProducts,
  listStoreProducts,
  permanentlyDeleteProduct,
  updateProduct,
} from '../services/productService.js';

export async function getProducts(req, res) {
  const products = await listStoreProducts(req.query);
  return res.json({ products });
}

export async function getProduct(req, res) {
  const product = await getStoreProduct(req.params.id);
  return res.json({ product });
}

export async function getAdminProducts(req, res) {
  const products = await listAdminProducts(req.query.includeArchived === 'true');
  return res.json({ products });
}

export async function postProduct(req, res) {
  const product = await createProduct(req.body);
  return res.status(201).json({ product });
}

export async function patchProduct(req, res) {
  const product = await updateProduct(req.params.id, req.body);
  return res.json({ product });
}

export async function deleteProduct(req, res) {
  await archiveProduct(req.params.id);
  return res.json({ message: 'Product archived.' });
}

export async function permanentlyDeleteProductController(req, res) {
  await permanentlyDeleteProduct(req.params.id);
  return res.json({ message: 'Product permanently deleted.' });
}
