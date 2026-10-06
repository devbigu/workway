import { z } from "zod";

export const orderActionSchema = z.object({
  action: z.enum(["cancel", "return", "archive", "restore"]),
});

export const savedItemSchema = z.object({
  productId: z.string().trim().min(1).max(120),
});

export const supportRequestSchema = z.object({
  orderId: z.string().trim().max(120).optional().transform((value) => value || undefined),
  category: z.enum(["ORDER", "REFUND", "DELIVERY", "PAYMENT", "PRODUCT", "ACCOUNT", "OTHER"]),
  subject: z.string().trim().min(4, "Enter a clear subject").max(140),
  message: z.string().trim().min(12, "Tell us a little more about the issue").max(3000),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^$|^\+?[0-9][0-9 ()-]{7,18}$/, "Enter a valid phone number"),
});
