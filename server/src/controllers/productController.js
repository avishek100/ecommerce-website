import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
  archiveProduct,
  createProduct,
  getStoreProduct,
  listAdminProducts,
  listStoreProducts,
  permanentlyDeleteProduct,
  updateProduct,
} from "../services/productService.js";

const productImagesDirectory = fileURLToPath(
  new URL("../../uploads/products/", import.meta.url),
);
const imageFormats = {
  "image/jpeg": {
    extension: "jpg",
    matches: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  "image/png": {
    extension: "png",
    matches: (buffer) =>
      buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  "image/webp": {
    extension: "webp",
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP",
  },
};

export async function getProducts(req, res) {
  const products = await listStoreProducts(req.query);
  return res.json({ products });
}

export async function getProduct(req, res) {
  const product = await getStoreProduct(req.params.id);
  return res.json({ product });
}

export async function getAdminProducts(req, res) {
  const products = await listAdminProducts(
    req.query.includeArchived === "true",
  );
  return res.json({ products });
}

export async function postProduct(req, res) {
  const product = await createProduct(req.body);
  return res.status(201).json({ product });
}

export async function patchProduct(req, res) {
  const product = await updateProduct(req.params.id, req.body);
  return res.json({ product });
}

export async function deleteProduct(req, res) {
  await archiveProduct(req.params.id);
  return res.json({ message: "Product archived." });
}

export async function permanentlyDeleteProductController(req, res) {
  await permanentlyDeleteProduct(req.params.id);
  return res.json({ message: "Product permanently deleted." });
}

export async function postProductImage(req, res) {
  const format = req.file && imageFormats[req.file.mimetype];
  if (!format || !format.matches(req.file.buffer)) {
    return res
      .status(400)
      .json({ message: "The uploaded file is not a valid supported image." });
  }

  const filename = `${randomUUID()}.${format.extension}`;
  await mkdir(productImagesDirectory, { recursive: true });
  await writeFile(
    fileURLToPath(
      new URL(`../../uploads/products/${filename}`, import.meta.url),
    ),
    req.file.buffer,
    { flag: "wx" },
  );
  return res.status(201).json({ image: `/uploads/products/${filename}` });
}
