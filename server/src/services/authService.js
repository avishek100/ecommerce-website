import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { Customer } from "../models/Customer.js";

export async function authenticateAdmin({ email, password }) {
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash)))
    return null;
  const token = jwt.sign(
    { sub: admin.id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" },
  );
  return {
    role: "admin",
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email },
  };
}

function createCustomerSession(customer) {
  const token = jwt.sign(
    { sub: customer.id, role: "customer" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  return {
    token,
    user: { id: customer.id, name: customer.name, email: customer.email },
  };
}

export async function registerCustomer({ name, email, password }) {
  const existingCustomer = await Customer.exists({
    email: email.toLowerCase(),
  });
  if (existingCustomer) return null;
  const passwordHash = await bcrypt.hash(password, 12);
  const customer = await Customer.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
  });
  return createCustomerSession(customer);
}

export async function authenticateCustomer({ email, password }) {
  const customer = await Customer.findOne({ email: email.toLowerCase() });
  if (!customer || !(await bcrypt.compare(password, customer.passwordHash)))
    return null;
  return createCustomerSession(customer);
}

export async function authenticateUser({ email, password }) {
  const adminSession = await authenticateAdmin({ email, password });
  if (adminSession) return adminSession;

  const customerSession = await authenticateCustomer({ email, password });
  if (!customerSession) return null;
  return { ...customerSession, role: "customer" };
}
