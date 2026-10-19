import {
  createChatMessage,
  getAdminConversations,
  getAdminCustomerMessages,
  getCustomerMessages,
  getChatCustomer,
  openChatStream,
} from "../services/chatService.js";

export async function listCustomerMessages(req, res) {
  return res.json({ messages: await getCustomerMessages(req.customer) });
}

export async function sendCustomerMessage(req, res) {
  const message = await createChatMessage({
    customer: req.customer,
    sender: "customer",
    senderName: req.customer.name,
    text: req.body.text,
  });
  return res.status(201).json({ message });
}

export function streamCustomerMessages(req, res) {
  openChatStream(res, req.customer.id);
}

export async function listAdminConversations(_req, res) {
  return res.json({ conversations: await getAdminConversations() });
}

export async function listAdminCustomerMessages(req, res) {
  if (!/^[\da-f]{24}$/i.test(req.params.customerId))
    return res.status(400).json({ message: "Customer id is invalid." });
  const messages = await getAdminCustomerMessages(req.params.customerId);
  if (!messages) return res.status(404).json({ message: "Customer not found." });
  return res.json({ messages });
}

export async function sendAdminMessage(req, res) {
  if (!/^[\da-f]{24}$/i.test(req.params.customerId))
    return res.status(400).json({ message: "Customer id is invalid." });
  const customer = await getChatCustomer(req.params.customerId);
  if (!customer) return res.status(404).json({ message: "Customer not found." });
  const message = await createChatMessage({
    customer,
    sender: "admin",
    senderName: req.admin.name,
    text: req.body.text,
  });
  return res.status(201).json({ message });
}

export function streamAdminMessages(_req, res) {
  openChatStream(res);
}
