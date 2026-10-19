import { ChatMessage } from "../models/ChatMessage.js";
import { Customer } from "../models/Customer.js";

const adminStreams = new Set();
const customerStreams = new Map();

function sendEvent(stream, event) {
  if (!stream.writableEnded) stream.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function openChatStream(response, customerId) {
  const streams = customerId
    ? (customerStreams.get(customerId) ?? new Set())
    : adminStreams;
  if (customerId && !customerStreams.has(customerId)) {
    customerStreams.set(customerId, streams);
  }
  streams.add(response);
  sendEvent(response, { type: "ready" });

  const heartbeat = setInterval(() => {
    if (!response.writableEnded) response.write(": keep-alive\n\n");
  }, 25000);
  response.on("close", () => {
    clearInterval(heartbeat);
    streams.delete(response);
    if (customerId && streams.size === 0) customerStreams.delete(customerId);
  });
}

function publishMessage(message, customer) {
  const event = {
    type: "message",
    message: {
      id: message.id,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      sender: message.sender,
      senderName: message.senderName,
      text: message.text,
      createdAt: message.createdAt,
    },
  };
  for (const stream of adminStreams) sendEvent(stream, event);
  for (const stream of customerStreams.get(customer.id) ?? []) {
    sendEvent(stream, event);
  }
  return event.message;
}

export async function createChatMessage({ customer, sender, text, senderName }) {
  const record = await ChatMessage.create({
    customer: customer.id,
    sender,
    senderName,
    text,
  });
  return publishMessage(record, customer);
}

function serializeMessage(message, customer) {
  return {
    id: message._id.toString(),
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    sender: message.sender,
    senderName: message.senderName,
    text: message.text,
    createdAt: message.createdAt,
  };
}

export async function getCustomerMessages(customer) {
  const records = await ChatMessage.find({ customer: customer.id })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return records
    .reverse()
    .map((record) => serializeMessage(record, customer));
}

export async function getAdminConversations() {
  const latestMessages = await ChatMessage.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$customer",
        message: { $first: "$text" },
        sender: { $first: "$sender" },
        updatedAt: { $first: "$createdAt" },
      },
    },
    { $sort: { updatedAt: -1 } },
    { $limit: 100 },
  ]);
  const customers = await Customer.find({
    _id: { $in: latestMessages.map(({ _id }) => _id) },
  })
    .select("_id name email")
    .lean();
  const customersById = new Map(
    customers.map((customer) => [customer._id.toString(), customer]),
  );
  return latestMessages.flatMap((conversation) => {
    const customer = customersById.get(conversation._id.toString());
    if (!customer) return [];
    return [
      {
        customerId: customer._id.toString(),
        customerName: customer.name,
        customerEmail: customer.email,
        lastMessage: conversation.message,
        lastSender: conversation.sender,
        updatedAt: conversation.updatedAt,
      },
    ];
  });
}

export async function getAdminCustomerMessages(customerId) {
  const customer = await Customer.findById(customerId)
    .select("_id name email")
    .lean();
  if (!customer) return null;
  const records = await ChatMessage.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return records
    .reverse()
    .map((record) => serializeMessage(record, {
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
    }));
}

export async function getChatCustomer(customerId) {
  const customer = await Customer.findById(customerId)
    .select("_id name email")
    .lean();
  if (!customer) return null;
  return {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
  };
}
