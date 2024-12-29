/*
  Warnings:

  - You are about to drop the `MaterialInventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialOrderItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('MATERIAL', 'PRODUCT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "MaterialInventory" DROP CONSTRAINT "MaterialInventory_materialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialMovement" DROP CONSTRAINT "MaterialMovement_materialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialOrderItem" DROP CONSTRAINT "MaterialOrderItem_materialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialOrderItem" DROP CONSTRAINT "MaterialOrderItem_orderId_fkey";

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "currency" DROP NOT NULL,
ALTER COLUMN "defaultCostPerUnit" DROP NOT NULL,
ALTER COLUMN "defaultUnit" DROP NOT NULL;

-- DropTable
DROP TABLE "MaterialInventory";

-- DropTable
DROP TABLE "MaterialMovement";

-- DropTable
DROP TABLE "MaterialOrder";

-- DropTable
DROP TABLE "MaterialOrderItem";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "type" "InventoryType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "materialId" TEXT,
    "productId" TEXT,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "InventoryType" NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "referenceNumber" TEXT,
    "supplier" TEXT,
    "recipient" TEXT,
    "totalPrice" DOUBLE PRECISION,
    "currency" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedDelivery" TIMESTAMP(3),
    "actualDelivery" TIMESTAMP(3),
    "status" "TransactionStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
