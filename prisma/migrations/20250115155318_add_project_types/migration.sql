/*
  Warnings:

  - Added the required column `customerName` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectType` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('VEHICLE_WRAP', 'SIGN', 'MURAL');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "projectType" "ProjectType" NOT NULL,
ADD COLUMN     "vinNumber" TEXT;
