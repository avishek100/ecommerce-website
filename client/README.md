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

## Deploy to Vercel and Render

The storefront is a TanStack Start SSR app deployed to Vercel. The Express API and MongoDB-backed data run on Render; MongoDB itself must be hosted separately, for example on MongoDB Atlas.

1. Create a Vercel project for this repository, set its **Root Directory** to `client`, and note the Vercel site origin. The build uses `vercel.json` and the Nitro Vercel preset configured in `vite.config.ts`. Set `VITE_API_URL` in Vercel’s project environment settings before deploying; the local `client/.env` is ignored by Git and is not deployed. Production builds fail if the Vercel variable is missing.
2. Create a MongoDB database and database user. Configure its network access to allow connections from Render.
3. Create a Render Blueprint from this repository using `render.yaml`. Supply `MONGODB_URI`, `CLIENT_ORIGIN` (the exact Vercel site origin, without a trailing slash), `ADMIN_NAME`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` of at least 12 characters when prompted. The blueprint generates `JWT_SECRET` and deploys the API with a persistent disk for uploaded product images.
4. After the API is deployed, open its Render Shell and run `npm run seed` once to create the administrator and sample products. The admin email and password are the values configured in the Render environment.
5. Set `VITE_API_URL` in Vercel to the deployed Render URL plus `/api` (for example, `https://novashop-api.onrender.com/api`), then deploy or redeploy the storefront. If the Vercel domain changes, update `CLIENT_ORIGIN` in Render to match it and redeploy the API.

The Render blueprint uses a paid Starter instance because Render persistent disks are not available on free instances. The disk keeps uploaded product images across deploys and restarts. The API health check is available at `/api/health`.
