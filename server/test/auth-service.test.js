import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../src/models/Admin.js";
import { Customer } from "../src/models/Customer.js";
import { authenticateUser } from "../src/services/authService.js";

test("shared login identifies admins and customers from their credentials", async () => {
  const originalAdminFindOne = Admin.findOne;
  const originalCustomerFindOne = Customer.findOne;
  const originalJwtSecret = process.env.JWT_SECRET;
  const jwtSecret = "test-secret-that-is-at-least-32-characters";
  process.env.JWT_SECRET = jwtSecret;

  try {
    const adminPasswordHash = await bcrypt.hash("admin-password", 4);
    const customerPasswordHash = await bcrypt.hash("customer-password", 4);
    Admin.findOne = async ({ email }) =>
      email === "admin@example.com"
        ? {
            id: "507f1f77bcf86cd799439011",
            role: "admin",
            name: "Store Admin",
            email,
            passwordHash: adminPasswordHash,
          }
        : null;
    Customer.findOne = async ({ email }) =>
      email === "customer@example.com"
        ? {
            id: "507f1f77bcf86cd799439012",
            name: "Store Customer",
            email,
            passwordHash: customerPasswordHash,
          }
        : null;

    const adminResult = await authenticateUser({
      email: "ADMIN@example.com",
      password: "admin-password",
    });
    assert.equal(adminResult.role, "admin");
    assert.equal(adminResult.admin.email, "admin@example.com");
    assert.equal(jwt.verify(adminResult.token, jwtSecret).role, "admin");

    const customerResult = await authenticateUser({
      email: "customer@example.com",
      password: "customer-password",
    });
    assert.equal(customerResult.role, "customer");
    assert.equal(customerResult.user.email, "customer@example.com");
    assert.equal(jwt.verify(customerResult.token, jwtSecret).role, "customer");

    const invalidResult = await authenticateUser({
      email: "customer@example.com",
      password: "incorrect-password",
    });
    assert.equal(invalidResult, null);
  } finally {
    Admin.findOne = originalAdminFindOne;
    Customer.findOne = originalCustomerFindOne;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});
