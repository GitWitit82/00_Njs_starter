/*
  Warnings:

  - The `status` column on the `FormResponse` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FormPriority" AS ENUM ('CRITICAL', 'STANDARD', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "status",
ADD COLUMN     "status" "FormStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "priority" "FormPriority" NOT NULL DEFAULT 'STANDARD';
