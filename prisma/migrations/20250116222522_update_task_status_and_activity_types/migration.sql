/*
  Warnings:

  - The values [NOT_STARTED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'SCHEDULE_UPDATE';
ALTER TYPE "ActivityType" ADD VALUE 'ACTUAL_DATES_UPDATE';

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('TODO', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'BLOCKED');
ALTER TABLE "ProjectTask" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProjectTask" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "ProjectTask" ALTER COLUMN "status" SET DEFAULT 'TODO';
COMMIT;

-- AlterTable
ALTER TABLE "ProjectTask" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- CreateIndex
CREATE INDEX "WorkflowTask_formTemplateId_idx" ON "WorkflowTask"("formTemplateId");
