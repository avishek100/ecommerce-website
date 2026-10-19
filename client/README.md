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

The storefront uses `http://localhost:4000/api` by default. Set `VITE_API_URL` in `client/.env` to change it. Customers and administrators use the same sign-in form at `/login`; the server recognizes the account from the submitted email and password. Admin credentials open the separate admin console and sidebar. The `/admin` route opens the same sign-in form.

Customer registration is available at `/register` (customer accounts only). Customers can review orders placed while signed in at `/my-orders`; guest checkout remains available.
