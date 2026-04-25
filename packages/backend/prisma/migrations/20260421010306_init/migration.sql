/*
  Warnings:

  - You are about to alter the column `txHash` on the `donations` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(66)`.
  - You are about to alter the column `txHash` on the `requests` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(66)`.

*/
-- AlterTable
ALTER TABLE "donations" ALTER COLUMN "txHash" SET DATA TYPE VARCHAR(66);

-- AlterTable
ALTER TABLE "requests" ALTER COLUMN "txHash" SET DATA TYPE VARCHAR(66);

-- CreateIndex
CREATE INDEX "donations_txHash_idx" ON "donations"("txHash");

-- CreateIndex
CREATE INDEX "donations_donorId_status_idx" ON "donations"("donorId", "status");

-- CreateIndex
CREATE INDEX "donations_expiryTimestamp_status_idx" ON "donations"("expiryTimestamp", "status");

-- CreateIndex
CREATE INDEX "requests_txHash_idx" ON "requests"("txHash");

-- CreateIndex
CREATE INDEX "requests_status_urgencyLevel_idx" ON "requests"("status", "urgencyLevel");

-- CreateIndex
CREATE INDEX "requests_location_status_idx" ON "requests"("location", "status");
