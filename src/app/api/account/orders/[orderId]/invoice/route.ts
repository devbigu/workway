import { getCustomerOrder, requireCustomerApi, asRecord } from "@/features/account/server/account.service";
import { formatCurrency, formatDate } from "@/features/account/presentation";

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const auth = await requireCustomerApi(request);
  if (!auth) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (!auth.customer) return Response.json({ error: "Customer access required" }, { status: 403 });

  const { orderId } = await context.params;
  const order = await getCustomerOrder(auth.customer.id, orderId);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (!["PAID", "NOT_REQUIRED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(order.paymentStatus)) {
    return Response.json({ error: "Invoice is not available for this order" }, { status: 403 });
  }

  const address = asRecord(order.billingAddressSnapshot);
  const rows = order.sellerOrders.flatMap((seller) => seller.items).map((item) =>
    `<tr><td>${escapeHtml(item.productName)}<br><small>${escapeHtml(item.variantName ?? item.sku)}</small></td><td>${item.quantity}</td><td>${escapeHtml(formatCurrency(item.unitPricePaise))}</td><td>${escapeHtml(formatCurrency(item.totalPaise))}</td></tr>`
  ).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(order.orderNumber)}</title><style>body{font:14px Arial;color:#172017;max-width:850px;margin:40px auto;padding:24px}h1{font-size:28px}table{width:100%;border-collapse:collapse;margin-top:28px}th,td{text-align:left;padding:12px;border-bottom:1px solid #ddd}.totals{margin:24px 0 0 auto;width:320px}.totals p{display:flex;justify-content:space-between}.grand{font-size:18px;font-weight:bold;border-top:2px solid #222;padding-top:10px}@media print{body{margin:0}}</style></head><body><p>worklab</p><h1>Tax Invoice</h1><p>Order #${escapeHtml(order.orderNumber)} · ${escapeHtml(formatDate(order.placedAt ?? order.createdAt))}</p><h2>Bill to</h2><p>${[address.fullName,address.addressLine1,address.addressLine2,address.city,address.state,address.postalCode,address.country].filter(Boolean).map(escapeHtml).join("<br>")}</p><table><thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><p><span>Subtotal</span><b>${escapeHtml(formatCurrency(order.subtotalPaise))}</b></p><p><span>Discount</span><b>-${escapeHtml(formatCurrency(order.discountPaise))}</b></p><p><span>GST / taxes</span><b>${escapeHtml(formatCurrency(order.taxPaise))}</b></p><p><span>Delivery</span><b>${escapeHtml(formatCurrency(order.shippingPaise))}</b></p><p class="grand"><span>Grand total</span><span>${escapeHtml(formatCurrency(order.totalPaise))}</span></p></div><p>This invoice was generated from the immutable order record.</p></body></html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `attachment; filename="invoice-${order.orderNumber.replace(/[^a-zA-Z0-9-]/g, "")}.html"`,
      "cache-control": "private, no-store",
    },
  });
}
