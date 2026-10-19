import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export async function getDashboardSummary() {
  const [productCount, activeProducts, orderCount, sales, pendingOrders, recentOrders] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ status: 'Processing' }),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  return {
    metrics: {
      productCount,
      activeProducts,
      orderCount,
      revenue: sales[0]?.total ?? 0,
      pendingOrders,
    },
    recentOrders,
  };
}
