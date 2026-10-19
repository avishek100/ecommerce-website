import test from 'node:test';
import assert from 'node:assert/strict';
import {
  customerLoginInput,
  customerRegistrationInput,
  orderInput,
  orderStatusInput,
  productInput,
} from '../src/validation.js';

test('customer registration requires a name, valid email, and password of at least eight characters', () => {
  assert.equal(
    customerRegistrationInput.safeParse({
      name: 'A Customer',
      email: 'customer@example.com',
      password: 'password123',
    }).success,
    true,
  );
  assert.equal(
    customerRegistrationInput.safeParse({
      name: '',
      email: 'bad-email',
      password: 'short',
    }).success,
    false,
  );
});

test('customer login validates email and password fields', () => {
  assert.equal(
    customerLoginInput.safeParse({ email: 'customer@example.com', password: 'password123' }).success,
    true,
  );
  assert.equal(
    customerLoginInput.safeParse({ email: 'bad-email', password: 'x' }).success,
    false,
  );
});

test('product input supplies defaults and rejects invalid price and discount', () => {
  const valid = productInput.safeParse({
    name: 'Canvas tote',
    sub: 'Natural',
    price: '24.99',
    img: 'https://example.com/tote.jpg',
    category: 'Fashion',
    brand: 'Nova Essentials',
  });
  assert.equal(valid.success, true);
  if (valid.success) assert.equal(valid.data.stock, 0);

  assert.equal(
    productInput.safeParse({
      name: 'Invalid item',
      sub: 'Variant',
      price: -1,
      img: 'asset:bag',
      off: 101,
      category: 'Fashion',
      brand: 'Nova Essentials',
    }).success,
    false,
  );
});

test('orders require customer details and valid product ids', () => {
  const valid = orderInput.safeParse({
    customer: { name: 'A Customer', email: 'customer@example.com', address: '10 Main Street' },
    items: [{ productId: '507f1f77bcf86cd799439011', quantity: 2 }],
  });
  const invalid = orderInput.safeParse({
    customer: { name: 'A Customer', email: 'not-an-email', address: '10 Main Street' },
    items: [{ productId: 'bad-id', quantity: 0 }],
  });
  assert.equal(valid.success, true);
  assert.equal(invalid.success, false);
});

test('order statuses are restricted to supported fulfillment states', () => {
  assert.equal(orderStatusInput.safeParse({ status: 'Shipped' }).success, true);
  assert.equal(orderStatusInput.safeParse({ status: 'Returned' }).success, false);
});
