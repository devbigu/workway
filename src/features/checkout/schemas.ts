import { z } from "zod";

export const checkoutAddressSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  email: z.email(),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pin: z.string().trim().regex(/^[0-9]{6}$/),
  gstin: z.string().trim().max(20).optional().default(""),
});

export const createCheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1),
    quantity: z.number().int().positive().max(999),
  })).min(1).max(100),
  address: checkoutAddressSchema,
  delivery: z.enum(["standard", "priority"]),
  payment: z.enum(["online", "cod"]),
  voucher: z.string().trim().max(50).optional().default(""),
  idempotencyKey: z.string().min(8).max(100),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
