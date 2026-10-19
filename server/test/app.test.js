import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test('health endpoint reports API and database readiness', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'http://localhost:8080' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', database: 'disconnected' });
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:8080');
});

test('unknown routes return a clear JSON 404', async () => {
  const response = await fetch(`${baseUrl}/api/missing`);
  assert.equal(response.status, 404);
  assert.match((await response.json()).message, /Route not found/);
});

test('malformed JSON is returned as a client error', async () => {
  const response = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: 'Request body must contain valid JSON.' });
});

test('customer order history requires a customer token', async () => {
  const response = await fetch(`${baseUrl}/api/orders/mine`);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: 'Please sign in to access your account.' });
});

test('permanently deleting a product requires an admin token', async () => {
  const response = await fetch(`${baseUrl}/api/admin/products/507f1f77bcf86cd799439011/permanent`, {
    method: 'DELETE',
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: 'Admin sign-in is required.' });
});

test('customer registration rejects invalid input before database access', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', email: 'invalid', password: 'short' }),
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'Please check the submitted fields.');
});
