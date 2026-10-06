import type { OrderStatus } from "@/generated/prisma/enums";

export function formatCurrency(paise: bigint | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(paise) / 100);
}

export function formatDate(value: Date, includeTime = false) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(value);
}

export function labelStatus(status: string) {
  return status.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function statusTone(status: OrderStatus | string) {
  if (["DELIVERED", "FULFILLED"].includes(status)) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (["CANCELLED", "FAILED"].includes(status)) return "bg-red-50 text-red-800 ring-red-200";
  if (["RETURN_REQUESTED", "RETURNED", "REFUND_PROCESSING", "REFUNDED"].includes(status)) return "bg-purple-50 text-purple-800 ring-purple-200";
  if (["SHIPPED", "OUT_FOR_DELIVERY"].includes(status)) return "bg-amber-50 text-amber-900 ring-amber-200";
  if (["PROCESSING", "PACKED"].includes(status)) return "bg-indigo-50 text-indigo-800 ring-indigo-200";
  return "bg-blue-50 text-blue-800 ring-blue-200";
}

export function paymentLabel(status: string, method?: unknown) {
  if (method === "cod" && status === "NOT_REQUIRED") return "Cash on delivery";
  return labelStatus(status);
}
