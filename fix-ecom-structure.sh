#!/usr/bin/env bash

set -euo pipefail

echo "Adding PRD-required e-commerce structure..."

create_file() {
  local file="$1"

  mkdir -p "$(dirname "$file")"

  if [[ ! -e "$file" ]]; then
    touch "$file"
    echo "Created: $file"
  else
    echo "Exists:  $file"
  fi
}

while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  create_file "$file"
done <<'FILES'

# --------------------------------------------------
# BUYER ACCOUNT ROUTES
# --------------------------------------------------

src/app/account/organization/page.tsx
src/app/account/shipments/page.tsx
src/app/account/shipments/[shipmentId]/page.tsx
src/app/account/wishlist/page.tsx
src/app/account/notifications/page.tsx

# --------------------------------------------------
# ADMIN ROUTES
# --------------------------------------------------

src/app/admin/brands/page.tsx
src/app/admin/documents/page.tsx
src/app/admin/payments/page.tsx
src/app/admin/organizations/page.tsx
src/app/admin/coupons/page.tsx
src/app/admin/reports/page.tsx
src/app/admin/audit-logs/page.tsx

# --------------------------------------------------
# STAFF ROUTES
# --------------------------------------------------

src/app/staff/buyers/page.tsx
src/app/staff/reports/page.tsx
src/app/staff/profile/page.tsx

# --------------------------------------------------
# REQUIRED API ROUTES
# --------------------------------------------------

src/app/api/organizations/route.ts
src/app/api/inventory/route.ts
src/app/api/shipments/route.ts
src/app/api/shipments/[shipmentId]/route.ts
src/app/api/invoices/[invoiceId]/route.ts
src/app/api/invoices/[invoiceId]/download/route.ts
src/app/api/notifications/route.ts
src/app/api/coupons/route.ts
src/app/api/health/route.ts

# --------------------------------------------------
# ORGANIZATIONS FEATURE
# --------------------------------------------------

src/features/organizations/components/organization-form.tsx
src/features/organizations/components/address-form.tsx
src/features/organizations/components/address-list.tsx
src/features/organizations/server/organization.service.ts
src/features/organizations/server/organization.repository.ts
src/features/organizations/schemas.ts
src/features/organizations/types.ts
src/features/organizations/index.ts

# --------------------------------------------------
# PRODUCTS / SCIENTIFIC DOCUMENTS
# Documents remain inside products to keep structure lean
# --------------------------------------------------

src/features/products/components/product-documents.tsx
src/features/products/components/specification-table.tsx
src/features/products/components/product-gallery.tsx
src/features/products/components/product-availability.tsx
src/features/products/server/document.service.ts
src/features/products/server/category.service.ts
src/features/products/server/brand.service.ts

# --------------------------------------------------
# PRICING AND COUPONS
# --------------------------------------------------

src/features/pricing/components/price-display.tsx
src/features/pricing/components/price-summary.tsx
src/features/pricing/components/coupon-form.tsx
src/features/pricing/server/pricing.service.ts
src/features/pricing/server/coupon.service.ts
src/features/pricing/server/gst.service.ts
src/features/pricing/schemas.ts
src/features/pricing/types.ts
src/features/pricing/utils.ts
src/features/pricing/index.ts

# --------------------------------------------------
# INVOICES
# --------------------------------------------------

src/features/invoices/components/invoice-list.tsx
src/features/invoices/components/invoice-details.tsx
src/features/invoices/components/invoice-download-button.tsx
src/features/invoices/server/invoice.service.ts
src/features/invoices/server/invoice.repository.ts
src/features/invoices/types.ts
src/features/invoices/index.ts

# --------------------------------------------------
# NOTIFICATIONS
# --------------------------------------------------

src/features/notifications/components/notification-list.tsx
src/features/notifications/components/notification-item.tsx
src/features/notifications/server/notification.service.ts
src/features/notifications/server/notification.repository.ts
src/features/notifications/types.ts
src/features/notifications/index.ts

# --------------------------------------------------
# REPORTING
# --------------------------------------------------

src/features/reporting/components/report-filters.tsx
src/features/reporting/components/sales-report.tsx
src/features/reporting/components/inventory-report.tsx
src/features/reporting/server/report.service.ts
src/features/reporting/types.ts
src/features/reporting/index.ts

# --------------------------------------------------
# AUDIT LOGS
# --------------------------------------------------

src/features/audit/components/audit-log-table.tsx
src/features/audit/server/audit.service.ts
src/features/audit/server/audit.repository.ts
src/features/audit/types.ts
src/features/audit/index.ts

# --------------------------------------------------
# WISHLIST
# --------------------------------------------------

src/features/wishlist/components/wishlist-button.tsx
src/features/wishlist/components/wishlist-grid.tsx
src/features/wishlist/server/wishlist.service.ts
src/features/wishlist/types.ts
src/features/wishlist/index.ts

# --------------------------------------------------
# ADDITIONAL SHIPPING FILES
# --------------------------------------------------

src/features/shipping/components/shipment-list.tsx
src/features/shipping/components/shipment-details.tsx
src/features/shipping/server/shipping.repository.ts
src/features/shipping/types.ts

# --------------------------------------------------
# REQUIRED SHARED INFRASTRUCTURE
# --------------------------------------------------

src/lib/logger.ts
src/lib/rate-limit.ts
src/lib/idempotency.ts
src/lib/request-validation.ts
src/lib/audit.ts

# --------------------------------------------------
# TESTING
# --------------------------------------------------

src/features/products/product.service.test.ts
src/features/pricing/pricing.service.test.ts
src/features/cart/cart.service.test.ts
src/features/checkout/checkout.service.test.ts
src/features/payments/payment.service.test.ts
src/features/inventory/inventory.service.test.ts
src/features/orders/order.service.test.ts

tests/e2e/storefront.spec.ts
tests/e2e/checkout.spec.ts
tests/e2e/admin.spec.ts

.github/workflows/ci.yml

FILES

echo
echo "Checking for deferred feature folders..."

DEFERRED_FOLDERS=(
  "src/features/returns"
  "src/features/quotations"
  "src/features/wallet"
  "src/features/loyalty"
  "src/features/bulk-orders"
)

for folder in "${DEFERRED_FOLDERS[@]}"; do
  if [[ -d "$folder" ]]; then
    echo "Deferred folder already exists; review manually: $folder"
  fi
done

echo
echo "PRD structure update completed."
