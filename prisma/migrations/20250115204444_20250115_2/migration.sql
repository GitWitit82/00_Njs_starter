/*
  Warnings:

  - You are about to drop the column `actualEnd` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `actualStart` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledEnd` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledStart` on the `ProjectTask` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ProjectTask_workflowTaskId_idx";

-- AlterTable
ALTER TABLE "ProjectTask" DROP COLUMN "actualEnd",
DROP COLUMN "actualStart",
DROP COLUMN "scheduledEnd",
DROP COLUMN "scheduledStart";
