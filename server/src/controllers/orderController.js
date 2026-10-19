import { createOrder, listCustomerOrders, listOrders, updateOrderStatus } from '../services/orderService.js';

export async function postOrder(req, res) {
  const order = await createOrder(req.body, req.customer);
  return res.status(201).json({ order });
}

export async function getCustomerOrders(req, res) {
  const orders = await listCustomerOrders(req.customer.id);
  return res.json({ orders });
}

export async function getOrders(req, res) {
  const orders = await listOrders(req.query.status);
  return res.json({ orders });
}

export async function patchOrderStatus(req, res) {
  const order = await updateOrderStatus(req.params.id, req.body.status);
  return res.json({ order });
}
