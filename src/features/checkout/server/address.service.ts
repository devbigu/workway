import type { AddressInput, CreateAddressInput } from "@/features/checkout/schemas";
import type { CheckoutAddress } from "@/features/checkout/types";
import { db } from "@/lib/db";

export const MAX_SAVED_ADDRESSES = 10;

export class AddressError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const selectAddress = {
  id: true,
  fullName: true,
  phone: true,
  addressLine1: true,
  addressLine2: true,
  landmark: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  type: true,
  isSaved: true,
  isDefault: true,
} as const;

export async function listSavedAddresses(userId: string): Promise<CheckoutAddress[]> {
  return db.address.findMany({
    where: { userId, isSaved: true },
    select: selectAddress,
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}

export async function createCustomerAddress(userId: string, input: CreateAddressInput) {
  return db.$transaction(async (transaction) => {
    const savedCount = await transaction.address.count({ where: { userId, isSaved: true } });
    if (input.saveForFuture && savedCount >= MAX_SAVED_ADDRESSES) {
      throw new AddressError(`You can save up to ${MAX_SAVED_ADDRESSES} addresses`, 409);
    }
    await transaction.address.deleteMany({ where: { userId, isSaved: false } });

    const isDefault = input.saveForFuture && (input.makeDefault || savedCount === 0);
    if (isDefault) {
      await transaction.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }

    return transaction.address.create({
      data: {
        userId,
        ...input.address,
        addressLine2: input.address.addressLine2 ?? null,
        landmark: input.address.landmark ?? null,
        isSaved: input.saveForFuture,
        isDefault,
      },
      select: selectAddress,
    });
  }, { isolationLevel: "Serializable" });
}

async function requireOwnedAddress(addressId: string, userId: string) {
  const address = await db.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== userId) {
    throw new AddressError("You do not have access to this address", 403);
  }
  return address;
}

export async function updateCustomerAddress(
  userId: string,
  addressId: string,
  input: { action: "set-default" } | { address: AddressInput; makeDefault: boolean },
) {
  await requireOwnedAddress(addressId, userId);

  return db.$transaction(async (transaction) => {
    const current = await transaction.address.findUnique({ where: { id: addressId } });
    if (!current || current.userId !== userId) throw new AddressError("You do not have access to this address", 403);
    const isDefaultAction = "action" in input;
    const makeDefault = isDefaultAction || input.makeDefault;
    if (!current.isSaved && makeDefault) throw new AddressError("A checkout-only address cannot be made the default", 400);
    if (makeDefault) {
      await transaction.address.updateMany({ where: { userId, isDefault: true, id: { not: addressId } }, data: { isDefault: false } });
    }

    return transaction.address.update({
      where: { id: addressId },
      data: isDefaultAction
        ? { isDefault: true }
        : {
            ...input.address,
            addressLine2: input.address.addressLine2 ?? null,
            landmark: input.address.landmark ?? null,
            isDefault: makeDefault ? true : current.isDefault,
          },
      select: selectAddress,
    });
  }, { isolationLevel: "Serializable" });
}

export async function deleteCustomerAddress(userId: string, addressId: string) {
  const address = await requireOwnedAddress(addressId, userId);

  await db.$transaction(async (transaction) => {
    await transaction.address.delete({ where: { id: addressId } });
    if (address.isDefault) {
      const replacement = await transaction.address.findFirst({
        where: { userId, isSaved: true },
        orderBy: { updatedAt: "desc" },
        select: { id: true },
      });
      if (replacement) await transaction.address.update({ where: { id: replacement.id }, data: { isDefault: true } });
    }
  }, { isolationLevel: "Serializable" });
}
