import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Admin } from './models/Admin.js';
import { Product } from './models/Product.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_NAME) {
  throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required to seed the admin account.');
}
if (process.env.ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');

await mongoose.connect(process.env.MONGODB_URI);
try {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await Admin.findOneAndUpdate(
    { email: process.env.ADMIN_EMAIL.toLowerCase() },
    { name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash },
    { upsert: true, new: true, runValidators: true },
  );

  const sampleProducts = [
    { name: 'Air Max 270 React', sub: "Women's Shoes", price: 129.99, old: 159.99, img: 'asset:sneaker', off: 25, rating: 4.8, reviews: 124, category: 'Sports', brand: 'Nike', stock: 24 },
    { name: 'Apple Watch Series 9', sub: '41mm Midnight', price: 359, old: 449, img: 'asset:watch', off: 20, rating: 4.9, reviews: 98, category: 'Electronics', brand: 'Apple', isNewArrival: true, stock: 16 },
    { name: 'Minimalist Shoulder Bag', sub: 'Olive Green', price: 39.99, old: 49.99, img: 'asset:bag', off: 20, rating: 4.9, reviews: 176, category: 'Fashion', brand: 'Nova Essentials', isNewArrival: true, stock: 31 },
    { name: 'Oversized Cotton Shirt', sub: 'Beige', price: 29.99, old: 35, img: 'asset:hero', off: 15, rating: 4.7, reviews: 62, category: 'Fashion', brand: 'Nova Essentials', isNewArrival: true, stock: 42 },
    { name: 'Fossil Gen 6 Smartwatch', sub: 'Black Silicone', price: 215.1, old: 339, img: 'asset:watch', off: 10, rating: 4.6, reviews: 54, category: 'Electronics', brand: 'Fossil', stock: 12 },
  ];
  for (const product of sampleProducts) {
    await Product.findOneAndUpdate({ name: product.name }, product, { upsert: true, new: true, runValidators: true });
  }
  console.log('Admin account and NovaShop sample products are ready.');
} finally {
  await mongoose.disconnect();
}
