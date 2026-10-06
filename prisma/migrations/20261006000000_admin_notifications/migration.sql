CREATE TABLE "admin_notifications" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "href" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "admin_notifications_createdAt_idx" ON "admin_notifications"("createdAt");
