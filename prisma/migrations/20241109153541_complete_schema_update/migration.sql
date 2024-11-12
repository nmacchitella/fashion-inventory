/*
  Warnings:

  - Added the required column `colorCode` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPerUnit` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Material` table without a default value. This is not possible if the table is not empty.
  - Added the required column `piece` to the `Style` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `StyleMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('GRAM', 'KILOGRAM', 'METER', 'YARD');

-- AlterTable
ALTER TABLE "Material" ADD COLUMN     "colorCode" TEXT NOT NULL,
ADD COLUMN     "costPerUnit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "unit" "MeasurementUnit" NOT NULL;

-- AlterTable
ALTER TABLE "Style" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "piece" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StyleMaterial" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "unit" "MeasurementUnit" NOT NULL;
