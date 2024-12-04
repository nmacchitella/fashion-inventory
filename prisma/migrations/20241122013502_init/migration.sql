/*
  Warnings:

  - You are about to drop the column `costPerUnit` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Material` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Material` table. All the data in the column will be lost.
  - Added the required column `defaultCostPerUnit` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultUnit` to the `Material` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('RECEIVED', 'CONSUMED', 'ADJUSTED', 'RETURNED', 'SCRAPPED');

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "costPerUnit",
DROP COLUMN "location",
DROP COLUMN "photos",
DROP COLUMN "quantity",
DROP COLUMN "unit",
ADD COLUMN     "defaultCostPerUnit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "defaultUnit" "MeasurementUnit" NOT NULL;

-- CreateTable
CREATE TABLE "MaterialInventory" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "location" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialMovement" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "type" "MovementType" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialMovement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaterialInventory" ADD CONSTRAINT "MaterialInventory_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
