import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
// No vitest alias config, so route the real modules through their "@/" ids.
vi.mock("@/features/account/schemas", () => import("../src/features/account/schemas"));
vi.mock("@/lib/admin-auth", () => import("../src/lib/admin-auth"));

import { adminUserUpdate } from "../src/features/users/server/user.service";

const form = (fields: [string, string][]) => {
  const data = new FormData();
  for (const [key, value] of fields) data.append(key, value);
  return data;
};
const base: [string, string][] = [["name", "Asha Rao"], ["email", " Asha@Example.com "], ["phone", ""]];

describe("adminUserUpdate", () => {
  test("customers get profile and access changes but never a role or permissions", () => {
    const result = adminUserUpdate("admin", { id: "c1", role: "CUSTOMER", blockedAt: null }, form([...base, ["role", "ADMIN"], ["permissions", "staff:write"]]));
    expect(result).toEqual({ data: { name: "Asha Rao", email: "asha@example.com", phone: null, accessEnabled: false, blockedAt: expect.any(Date) } });
  });

  test("staff role and permissions are set, unknown permissions dropped", () => {
    const result = adminUserUpdate("admin", { id: "s1", role: "SUPPORT_STAFF", blockedAt: new Date() }, form([...base, ["accessEnabled", "on"], ["role", "ORDER_MANAGER"], ["permissions", "reports:read"], ["permissions", "root:all"]]));
    expect(result).toMatchObject({ data: { accessEnabled: true, blockedAt: null, role: "ORDER_MANAGER", permissions: ["reports:read"] } });
  });

  test("admins editing themselves cannot change role, access or permissions", () => {
    const result = adminUserUpdate("a1", { id: "a1", role: "ADMIN", blockedAt: null }, form([...base, ["role", "SUPPORT_STAFF"]]));
    expect(result).toEqual({ data: { name: "Asha Rao", email: "asha@example.com", phone: null } });
  });

  test("invalid input and invalid roles are rejected", () => {
    expect(adminUserUpdate("admin", { id: "s1", role: "ADMIN", blockedAt: null }, form([["name", "Asha"], ["email", "nope"], ["phone", ""]]))).toEqual({ error: "Enter a valid email" });
    expect(adminUserUpdate("admin", { id: "s1", role: "ADMIN", blockedAt: null }, form([...base, ["role", "CUSTOMER"]]))).toHaveProperty("error");
  });
});
