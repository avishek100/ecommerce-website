import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { HttpError } from '../utils/HttpError.js';

function toProductDto(product) {
  const { isNewArrival, ...rest } = product;
  return { ...rest, isNew: isNewArrival };
}

function toPersistenceFields(input) {
  const { isNew, ...fields } = input;
  return { ...fields, isNewArrival: isNew };
}

export async function listStoreProducts(query) {
  const filter = { isActive: true };
  if (typeof query.category === 'string' && query.category.trim()) {
    filter.category = query.category.trim();
  }
  if (query.isNew === 'true') filter.isNewArrival = true;
  if (query.deals === 'true') filter.off = { $gt: 0 };
  if (typeof query.q === 'string' && query.q.trim()) {
    const escaped = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = ['name', 'sub', 'brand', 'category'].map((field) => ({
      [field]: { $regex: escaped, $options: 'i' },
    }));
  }
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  return products.map(toProductDto);
}

export async function getStoreProduct(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Product not found.');
  const product = await Product.findOne({ _id: id, isActive: true }).lean();
  if (!product) throw new HttpError(404, 'Product not found.');
  return toProductDto(product);
}

export async function listAdminProducts(includeArchived) {
  const filter = includeArchived ? {} : { isActive: true };
  const products = await Product.find(filter).sort({ createdAt: -1 }).limit(300).lean();
  return products.map(toProductDto);
}

export async function createProduct(input) {
  const product = await Product.create(toPersistenceFields(input));
  return toProductDto(product.toObject());
}

export async function updateProduct(id, input) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Product not found.');
  const update = { $set: toPersistenceFields(input) };
  if (update.$set.old === undefined) {
    delete update.$set.old;
    update.$unset = { old: 1 };
  }
  const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  return toProductDto(product.toObject());
}

export async function archiveProduct(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Product not found.');
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  return toProductDto(product.toObject());
}

export async function permanentlyDeleteProduct(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Product not found.');
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new HttpError(404, 'Product not found.');
}
