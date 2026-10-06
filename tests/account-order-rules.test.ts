import { beforeEach, describe, expect, test, vi } from "vitest";

const { findFirst } = vi.hoisted(() => ({ findFirst: vi.fn() }));

vi.mock("@/lib/db", () => ({
  db: {
    order: { findFirst, findMany: vi.fn(), updateMany: vi.fn() },
  },
}));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import {
  ACTIVE_ORDER_STATUSES,
  canArchiveOrder,
  getCustomerOrder,
  isCancellationEligible,
  isPaymentEligible,
  isReturnEligible,
} from "../src/features/account/server/account.service";

beforeEach(() => findFirst.mockReset());

describe("customer account order rules", () => {
  test("active order filters contain only fulfilment work in progress", () => {
    expect(ACTIVE_ORDER_STATUSES).toEqual(["PLACED", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"]);
    expect(ACTIVE_ORDER_STATUSES).not.toContain("DELIVERED");
    expect(ACTIVE_ORDER_STATUSES).not.toContain("PENDING_PAYMENT");
  });

  test("COD is never eligible for online payment", () => {
    expect(isPaymentEligible({ status: "PENDING_PAYMENT", paymentStatus: "PENDING", buyerSnapshot: { paymentMethod: "cod" } })).toBe(false);
    expect(isPaymentEligible({ status: "PENDING_PAYMENT", paymentStatus: "PENDING", buyerSnapshot: { paymentMethod: "online" } })).toBe(true);
  });

  test("cancellation closes once packing begins", () => {
    expect(isCancellationEligible("PROCESSING")).toBe(true);
    expect(isCancellationEligible("PACKED")).toBe(false);
    expect(isCancellationEligible("DELIVERED")).toBe(false);
  });

  test("returns are limited to 14 days after delivery", () => {
    const now = new Date("2026-07-24T12:00:00Z");
    expect(isReturnEligible({ status: "DELIVERED", updatedAt: now, statusHistory: [{ toStatus: "DELIVERED", createdAt: new Date("2026-07-15T12:00:00Z") }] }, now)).toBe(true);
    expect(isReturnEligible({ status: "DELIVERED", updatedAt: now, statusHistory: [{ toStatus: "DELIVERED", createdAt: new Date("2026-07-01T12:00:00Z") }] }, now)).toBe(false);
  });

  test("only completed lifecycle orders can be archived", () => {
    expect(canArchiveOrder("DELIVERED")).toBe(true);
    expect(canArchiveOrder("CANCELLED")).toBe(true);
    expect(canArchiveOrder("SHIPPED")).toBe(false);
  });

  test("owned order lookup always scopes by both order and customer", async () => {
    findFirst.mockResolvedValue(null);
    await expect(getCustomerOrder("customer-a", "order-b")).resolves.toBeNull();
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "order-b", userId: "customer-a" } }));
  });
});
