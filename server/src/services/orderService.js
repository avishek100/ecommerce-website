import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { HttpError } from '../utils/HttpError.js';

export async function createOrder(input, customer) {
  const quantities = new Map();
  for (const item of input.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  const products = await Product.find({
    _id: { $in: [...quantities.keys()] },
    isActive: true,
  }).lean();
  if (products.length !== quantities.size) {
    throw new HttpError(400, 'One or more products are no longer available. Refresh your cart and try again.');
  }
  const byId = new Map(products.map((product) => [String(product._id), product]));
  const items = [...quantities].map(([productId, quantity]) => {
    const product = byId.get(productId);
    return { product: product._id, name: product.name, img: product.img, price: product.price, quantity };
  });
  const total = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  return Order.create({
    customer: customer
      ? { ...input.customer, name: customer.name, email: customer.email }
      : input.customer,
    ...(customer ? { customerAccount: customer.id } : {}),
    items,
    total,
  });
}

export async function listCustomerOrders(customerId) {
  return Order.find({ customerAccount: customerId }).sort({ createdAt: -1 }).limit(100).lean();
}

export async function listOrders(status) {
  const filter = ['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status) ? { status } : {};
  return Order.find(filter).sort({ createdAt: -1 }).limit(300).lean();
}

export async function updateOrderStatus(id, status) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Order not found.');
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
  if (!order) throw new HttpError(404, 'Order not found.');
  return order;
}
