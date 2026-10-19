import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { api, adminApi } from "./routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const origins = (
  process.env.CLIENT_ORIGIN ??
  "http://localhost:3000,http://localhost:5173,http://localhost:8080"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: origins }));
app.use(express.json({ limit: "1mb" }));
app.use(
  "/uploads/products",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(
    fileURLToPath(new URL("../uploads/products/", import.meta.url)),
    {
      dotfiles: "deny",
      fallthrough: true,
      index: false,
    },
  ),
);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});
app.use("/api", api);
app.use("/api/admin", adminApi);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
