import multer from "multer";
import { HttpError } from "../utils/HttpError.js";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!imageTypes.has(file.mimetype)) {
      callback(new HttpError(400, "Choose a JPEG, PNG, or WebP image."));
      return;
    }
    callback(null, true);
  },
});
