import { z } from "zod";

export const loginInput = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const customerLoginInput = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const customerRegistrationInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(128),
});

export const nepalProvinces = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

export const productInput = z.object({
  name: z.string().trim().min(1).max(120),
  sub: z.string().trim().min(1).max(160),
  price: z.coerce.number().finite().min(0),
  old: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().finite().min(0).optional(),
  ),
  img: z.string().trim().min(1).max(2048),
  off: z.coerce.number().finite().min(0).max(100).default(0),
  rating: z.coerce.number().finite().min(0).max(5).default(0),
  reviews: z.coerce.number().int().min(0).default(0),
  category: z.string().trim().min(1).max(80),
  brand: z.string().trim().min(1).max(80),
  isNew: z.coerce.boolean().default(false),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const orderInput = z.object({
  customer: z.object({
    name: z.string().trim().min(1).max(120),
    email: z.email(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,20}$/),
    address: z.string().trim().min(5).max(500),
    city: z.string().trim().min(1).max(120),
    province: z.enum(nepalProvinces),
    postalCode: z.string().trim().max(20).optional().default(""),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[\da-f]{24}$/i),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export const orderStatusInput = z.object({
  status: z.enum(["Processing", "Shipped", "Delivered", "Cancelled"]),
});

export const chatMessageInput = z.object({
  text: z.string().trim().min(1).max(2000),
});
