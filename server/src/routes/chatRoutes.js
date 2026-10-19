import { Router } from "express";
import {
  listAdminConversations,
  listAdminCustomerMessages,
  listCustomerMessages,
  sendAdminMessage,
  sendCustomerMessage,
  streamAdminMessages,
  streamCustomerMessages,
} from "../controllers/chatController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { requireCustomer } from "../middleware/requireCustomer.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { chatMessageInput } from "../validation.js";

export const customerChatRoutes = Router();
export const adminChatRoutes = Router();

customerChatRoutes.use(requireCustomer);
customerChatRoutes.get("/stream", streamCustomerMessages);
customerChatRoutes.get("/messages", listCustomerMessages);
customerChatRoutes.post(
  "/messages",
  validateRequest(chatMessageInput),
  sendCustomerMessage,
);

adminChatRoutes.use(requireAdmin);
adminChatRoutes.get("/stream", streamAdminMessages);
adminChatRoutes.get("/", listAdminConversations);
adminChatRoutes.get("/:customerId/messages", listAdminCustomerMessages);
adminChatRoutes.post(
  "/:customerId/messages",
  validateRequest(chatMessageInput),
  sendAdminMessage,
);
