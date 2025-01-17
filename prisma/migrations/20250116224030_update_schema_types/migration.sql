/*
  Warnings:

  - Added the required column `projectPhaseId` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FormStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "FormStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "FormStatus" ADD VALUE 'ARCHIVED';
ALTER TYPE "FormStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "FormStatus" ADD VALUE 'ON_HOLD';

-- AlterTable
ALTER TABLE "FormTemplate" ALTER COLUMN "schema" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectTask" ADD COLUMN     "projectPhaseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaskActivity" ADD COLUMN     "details" TEXT,
ADD COLUMN     "metadata" JSONB;

-- CreateIndex
CREATE INDEX "ProjectTask_projectPhaseId_idx" ON "ProjectTask"("projectPhaseId");

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectPhaseId_fkey" FOREIGN KEY ("projectPhaseId") REFERENCES "ProjectPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
