#!/usr/bin/env bash

set -euo pipefail

echo "Creating e-commerce project structure..."

# The default Next.js page conflicts with src/app/(shop)/page.tsx
# Preserve it as a backup instead of deleting it.
if [[ -f "src/app/page.tsx" && ! -f "src/app/page.tsx.backup" ]]; then
  mv "src/app/page.tsx" "src/app/page.tsx.backup"
  echo "Backed up src/app/page.tsx"
fi

# Directories that may otherwise remain empty
mkdir -p \
  "prisma/migrations" \
  "public/images" \
  "public/documents"

# Create files without overwriting existing content
while IFS= read -r file; do
  [[ -z "$file" ]] && continue

  mkdir -p "$(dirname "$file")"
  touch "$file"
done <<'FILES'
prisma/schema.prisma
prisma/seed.ts

src/app/layout.tsx
src/app/globals.css
src/app/loading.tsx
src/app/error.tsx
src/app/not-found.tsx

src/app/(auth)/layout.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/(auth)/forgot-password/page.tsx

src/app/(shop)/layout.tsx
src/app/(shop)/page.tsx
src/app/(shop)/products/page.tsx
src/app/(shop)/products/[slug]/page.tsx
src/app/(shop)/categories/[slug]/page.tsx
src/app/(shop)/search/page.tsx
src/app/(shop)/cart/page.tsx
src/app/(shop)/checkout/page.tsx
src/app/(shop)/checkout/success/page.tsx
src/app/(shop)/about/page.tsx
src/app/(shop)/contact/page.tsx
src/app/(shop)/terms/page.tsx
src/app/(shop)/privacy/page.tsx

src/app/account/layout.tsx
src/app/account/page.tsx
src/app/account/profile/page.tsx
src/app/account/addresses/page.tsx
src/app/account/orders/page.tsx
src/app/account/orders/[orderId]/page.tsx
src/app/account/invoices/page.tsx

src/app/admin/layout.tsx
src/app/admin/page.tsx
src/app/admin/products/page.tsx
src/app/admin/products/new/page.tsx
src/app/admin/products/[productId]/page.tsx
src/app/admin/categories/page.tsx
src/app/admin/inventory/page.tsx
src/app/admin/orders/page.tsx
src/app/admin/orders/[orderId]/page.tsx
src/app/admin/shipments/page.tsx
src/app/admin/users/page.tsx
src/app/admin/settings/page.tsx

src/app/staff/layout.tsx
src/app/staff/page.tsx
src/app/staff/orders/page.tsx
src/app/staff/orders/[orderId]/page.tsx
src/app/staff/shipments/page.tsx
src/app/staff/inventory/page.tsx

src/app/api/auth/[...all]/route.ts
src/app/api/products/route.ts
src/app/api/cart/route.ts
src/app/api/checkout/route.ts
src/app/api/orders/route.ts
src/app/api/payments/create-order/route.ts
src/app/api/payments/verify/route.ts
src/app/api/payments/webhook/route.ts

src/features/home/components/hero-section.tsx
src/features/home/components/category-section.tsx
src/features/home/components/featured-products.tsx
src/features/home/index.ts

src/features/auth/components/login-form.tsx
src/features/auth/components/signup-form.tsx
src/features/auth/server/auth.service.ts
src/features/auth/schemas.ts
src/features/auth/types.ts
src/features/auth/index.ts

src/features/products/components/product-card.tsx
src/features/products/components/product-grid.tsx
src/features/products/components/product-details.tsx
src/features/products/components/variant-selector.tsx
src/features/products/components/product-form.tsx
src/features/products/server/product.service.ts
src/features/products/server/product.repository.ts
src/features/products/schemas.ts
src/features/products/types.ts
src/features/products/utils.ts
src/features/products/index.ts

src/features/search/components/search-bar.tsx
src/features/search/components/search-results.tsx
src/features/search/server/search.service.ts
src/features/search/index.ts

src/features/cart/components/cart-item.tsx
src/features/cart/components/cart-drawer.tsx
src/features/cart/components/cart-summary.tsx
src/features/cart/store/cart.store.ts
src/features/cart/server/cart.service.ts
src/features/cart/types.ts
src/features/cart/index.ts

src/features/checkout/components/checkout-form.tsx
src/features/checkout/components/address-form.tsx
src/features/checkout/components/order-summary.tsx
src/features/checkout/server/checkout.service.ts
src/features/checkout/schemas.ts
src/features/checkout/index.ts

src/features/payments/components/razorpay-button.tsx
src/features/payments/server/razorpay.ts
src/features/payments/server/payment.service.ts
src/features/payments/index.ts

src/features/orders/components/order-list.tsx
src/features/orders/components/order-details.tsx
src/features/orders/components/order-status.tsx
src/features/orders/server/order.service.ts
src/features/orders/server/order.repository.ts
src/features/orders/types.ts
src/features/orders/index.ts

src/features/inventory/components/inventory-table.tsx
src/features/inventory/components/stock-form.tsx
src/features/inventory/server/inventory.service.ts
src/features/inventory/index.ts

src/features/shipping/components/shipment-form.tsx
src/features/shipping/components/tracking-timeline.tsx
src/features/shipping/server/shipping.service.ts
src/features/shipping/index.ts

src/features/users/components/user-table.tsx
src/features/users/components/profile-form.tsx
src/features/users/server/user.service.ts
src/features/users/index.ts

src/features/dashboard/components/admin-dashboard.tsx
src/features/dashboard/components/staff-dashboard.tsx
src/features/dashboard/index.ts

src/components/layout/global-header.tsx
src/components/layout/desktop-nav.tsx
src/components/layout/mobile-nav.tsx
src/components/layout/account-menu.tsx
src/components/layout/site-footer.tsx
src/components/layout/admin-sidebar.tsx
src/components/layout/staff-sidebar.tsx

src/components/shared/page-header.tsx
src/components/shared/data-table.tsx
src/components/shared/empty-state.tsx
src/components/shared/loading-spinner.tsx
src/components/shared/pagination.tsx

src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/ui/card.tsx
src/components/ui/dialog.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/form.tsx
src/components/ui/select.tsx
src/components/ui/sheet.tsx
src/components/ui/table.tsx
src/components/ui/textarea.tsx

src/lib/auth.ts
src/lib/db.ts
src/lib/permissions.ts
src/lib/storage.ts
src/lib/env.ts
src/lib/constants.ts
src/lib/utils.ts

src/hooks/use-debounce.ts
src/hooks/use-mobile.ts

src/providers/app-provider.tsx

src/types/api.ts
src/types/user.ts
src/types/common.ts

src/proxy.ts

.env.example
components.json
eslint.config.mjs
next.config.ts
postcss.config.mjs
tsconfig.json
README.md
FILES

echo
echo "Structure created successfully."
echo "Landing page:       src/app/(shop)/page.tsx"
echo "Global header:      src/components/layout/global-header.tsx"
echo "Root layout:        src/app/layout.tsx"
echo "Default page backup: src/app/page.tsx.backup"
