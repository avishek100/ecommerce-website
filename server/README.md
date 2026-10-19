# NovaShop API

Express and MongoDB API for the NovaShop storefront and admin dashboard. Source code is organized by responsibility:

- `config/` connects infrastructure such as MongoDB.
- `models/` defines Mongoose persistence models.
- `routes/` maps HTTP paths to middleware and controllers.
- `controllers/` validates HTTP boundaries and formats responses.
- `services/` contains business rules and persistence operations.
- `middleware/` handles authentication, request validation, and errors.

## Run locally

1. Install dependencies with `npm install` in this directory.
2. Copy `.env.example` to `.env`, set a MongoDB connection string, and replace the JWT secret and admin password.
3. Run `npm run seed` once to create the admin and matching sample catalog.
4. Run `npm run dev`. The API listens on port `4000` by default.
5. In `client`, set `VITE_API_URL=http://localhost:4000/api` (or use the same default) and run the frontend.

The shared sign-in endpoint is `/api/auth/login`: it authenticates an admin or customer from the submitted email and password and returns the matching role and token. Customer registration remains at `/api/auth/register`; `/api/auth/customer/login` is retained for API compatibility. Customer access uses a seven-day bearer token. Authenticated checkouts are associated with the customer account, and `GET /api/orders/mine` returns only that customer's orders. Guest checkout remains available.

The storefront product catalog and order submission are under `/api`, and protected product, order, and dashboard endpoints are under `/api/admin`. Admin access uses an eight-hour bearer token. `POST /api/admin/products/images` accepts a JPEG, PNG, or WebP image up to 5 MB for local storage; uploaded files are served from `/uploads/products/`. `DELETE /api/admin/products/:id` archives a product; `DELETE /api/admin/products/:id/permanent` permanently removes it from the catalog. Existing order-history snapshots remain intact.

Checkout requires a customer name, email, phone number, street address, city, and one of Nepal's seven provinces. A postal code is optional. Admin order views include the contact and delivery details for receiving and fulfilling each order.

Signed-in customers can chat with store support at `/support`; visitors are prompted to register or sign in before sending a message. Messages are stored in MongoDB and delivered to the customer and admin console in real time using authenticated server-sent event streams. Administrators can open the **Customer chat** page at `/admin/chat` to read and reply to conversations.
