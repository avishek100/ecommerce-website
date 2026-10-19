import {
  authenticateCustomer,
  authenticateUser,
  registerCustomer,
} from "../services/authService.js";

export async function login(req, res) {
  const result = await authenticateUser(req.body);
  if (!result)
    return res.status(401).json({ message: "Email or password is incorrect." });
  return res.json(result);
}

export function getSession(req, res) {
  return res.json({
    admin: { id: req.admin.id, name: req.admin.name, email: req.admin.email },
  });
}

export async function register(req, res) {
  const result = await registerCustomer(req.body);
  if (!result)
    return res
      .status(409)
      .json({ message: "An account with this email already exists." });
  return res.status(201).json(result);
}

export async function customerLogin(req, res) {
  const result = await authenticateCustomer(req.body);
  if (!result)
    return res.status(401).json({ message: "Email or password is incorrect." });
  return res.json(result);
}

export function getCustomerSession(req, res) {
  return res.json({
    user: {
      id: req.customer.id,
      name: req.customer.name,
      email: req.customer.email,
    },
  });
}
