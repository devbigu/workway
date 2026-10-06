import { z } from "zod";

const optionalLine = z.string().trim().max(120).optional().transform((value) => value || undefined);

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's full name").max(120),
  phone: z.string().trim().regex(/^\+?[0-9][0-9 ()-]{7,18}$/, "Enter a valid phone number"),
  addressLine1: z.string().trim().min(5, "Enter a complete street address").max(200),
  addressLine2: optionalLine,
  landmark: optionalLine,
  city: z.string().trim().min(2, "Enter a city").max(100),
  state: z.string().trim().min(2, "Enter a state").max(100),
  postalCode: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/, "Enter a valid postal code"),
  country: z.string().trim().min(2, "Enter a country").max(80),
  type: z.enum(["HOME", "WORK", "OTHER"]),
}).superRefine((address, context) => {
  if (/^(india|in)$/i.test(address.country) && !/^[1-9][0-9]{5}$/.test(address.postalCode)) {
    context.addIssue({ code: "custom", path: ["postalCode"], message: "Enter a valid 6-digit Indian PIN code" });
  }
});

export const createAddressSchema = z.object({
  address: addressSchema,
  saveForFuture: z.boolean().default(true),
  makeDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = z.union([
  z.object({ action: z.literal("set-default") }),
  z.object({ address: addressSchema, makeDefault: z.boolean().default(false) }),
]);

export const createCheckoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1),
    quantity: z.number().int().positive().max(999),
  })).min(1).max(100),
  addressId: z.string().min(1).max(100),
  delivery: z.enum(["standard", "priority"]),
  payment: z.enum(["online", "cod"]),
  voucher: z.string().trim().max(50).optional().default(""),
  idempotencyKey: z.string().min(8).max(100),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
