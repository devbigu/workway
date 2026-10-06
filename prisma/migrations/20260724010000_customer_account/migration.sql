ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "orders" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE TYPE "SupportCategory" AS ENUM ('ORDER', 'REFUND', 'DELIVERY', 'PAYMENT', 'PRODUCT', 'ACCOUNT', 'OTHER');
CREATE TYPE "SupportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE "saved_items" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saved_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "category" "SupportCategory" NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "SupportStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "saved_items_userId_productId_key" ON "saved_items"("userId", "productId");
CREATE INDEX "saved_items_userId_createdAt_idx" ON "saved_items"("userId", "createdAt");
CREATE INDEX "support_requests_userId_createdAt_idx" ON "support_requests"("userId", "createdAt");
CREATE INDEX "support_requests_orderId_idx" ON "support_requests"("orderId");
CREATE INDEX "orders_userId_archivedAt_createdAt_idx" ON "orders"("userId", "archivedAt", "createdAt");

ALTER TABLE "saved_items" ADD CONSTRAINT "saved_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
