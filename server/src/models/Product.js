import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sub: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    old: { type: Number, min: 0 },
    img: { type: String, required: true, trim: true },
    off: { type: Number, min: 0, max: 100, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    isNewArrival: { type: Boolean, default: false },
    stock: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Product = mongoose.model('Product', productSchema);
