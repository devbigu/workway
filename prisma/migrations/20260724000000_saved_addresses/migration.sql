CREATE TYPE "AddressType" AS ENUM ('HOME', 'WORK', 'OTHER');

CREATE TABLE "addresses" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "landmark" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "type" "AddressType" NOT NULL DEFAULT 'HOME',
  "isSaved" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_addresses" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "sourceAddressId" TEXT,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "landmark" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "type" "AddressType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "order_addresses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "addresses_userId_isSaved_createdAt_idx" ON "addresses"("userId", "isSaved", "createdAt");
CREATE INDEX "addresses_userId_isDefault_idx" ON "addresses"("userId", "isDefault");
CREATE UNIQUE INDEX "addresses_one_saved_default_per_user" ON "addresses"("userId") WHERE "isSaved" = true AND "isDefault" = true;
CREATE UNIQUE INDEX "order_addresses_orderId_key" ON "order_addresses"("orderId");
CREATE INDEX "order_addresses_sourceAddressId_idx" ON "order_addresses"("sourceAddressId");

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
