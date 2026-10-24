# Shopfront Mirror Studio

need same design same to same ecommerce

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://shopfront-mirror-studio.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b951d100-dca6-440e-a8ad-0a4d76efeb07).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Local development

The repository contains a React storefront in `client/` and the Express/MongoDB API in `server/`. You need Node.js and npm, plus a MongoDB instance.

From the repository root, configure and start the API:

```sh
cp server/.env.example server/.env
# Set MONGODB_URI, JWT_SECRET, and a strong ADMIN_PASSWORD in server/.env.
cd server
npm install
npm run seed
npm run dev
```

In a second terminal, start the storefront:

```sh
cd client
npm install
npm run dev
```

The storefront uses `VITE_API_URL` from `client/.env` (copy `client/.env.example` to get the local default `http://localhost:4000/api`). Customers and administrators use the same sign-in form at `/login`; the server recognizes the account from the submitted email and password. Admin credentials open the separate admin console and sidebar. The `/admin` route opens the same sign-in form.

Customer registration is available at `/register` (customer accounts only). Customers can review orders placed while signed in at `/my-orders`; guest checkout remains available.

The admin console has separate pages at `/admin/recent-orders`, `/admin/products`, `/admin/inventory`, and `/admin/orders`. Product photos can be selected from a local device as JPEG, PNG, or WebP files up to 5 MB. Checkout collects a phone number and Nepal delivery address (street, city, province, and optional postal code).

Customers can chat with store support at `/support` after registering or signing in. Administrators receive messages and reply in real time from **Customer chat** at `/admin/chat`.

## Deploy frontend and API together on Render

The Render Blueprint at the repository root builds both the TanStack Start storefront and Express API, then serves them on one public URL. The API is available under `/api`; uploaded product images are served under `/uploads/products`. MongoDB must be hosted separately, for example on MongoDB Atlas.

1. Create a MongoDB database and database user. Configure network access to allow connections from Render.
2. Create a Render Blueprint from this repository using `render.yaml`. Supply `MONGODB_URI`, `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` of at least 12 characters when prompted. The blueprint generates `JWT_SECRET` and provisions a persistent disk for uploaded product images.
3. After the service deploys, open its Render Shell and run `npm run seed --prefix server` once to create the administrator and sample products. The admin email and password are the values configured in the Render environment.

The storefront calls `/api` on its own origin, so no separate frontend URL or CORS origin setting is needed. The Render Blueprint uses a paid Starter instance because persistent disks are not available on free instances. The disk keeps uploaded product images across deploys and restarts. The API health check is available at `/api/health`.
