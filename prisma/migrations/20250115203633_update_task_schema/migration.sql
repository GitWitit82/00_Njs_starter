/*
  Warnings:

  - You are about to drop the column `actualEnd` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `actualStart` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `manHours` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `projectPhaseId` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledEnd` on the `ProjectTask` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledStart` on the `ProjectTask` table. All the data in the column will be lost.
  - The `priority` column on the `ProjectTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `ProjectTask` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `content` on the `TaskActivity` table. All the data in the column will be lost.
  - You are about to drop the `_TaskDependencies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `phaseId` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `ProjectTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `details` to the `TaskActivity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProjectTask" DROP CONSTRAINT "ProjectTask_projectPhaseId_fkey";

-- DropForeignKey
ALTER TABLE "_TaskDependencies" DROP CONSTRAINT "_TaskDependencies_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskDependencies" DROP CONSTRAINT "_TaskDependencies_B_fkey";

-- DropIndex
DROP INDEX "ProjectTask_projectPhaseId_idx";

-- Drop existing constraints
ALTER TABLE "ProjectTask" DROP CONSTRAINT IF EXISTS "ProjectTask_workflowTaskId_fkey";
ALTER TABLE "ProjectTask" DROP CONSTRAINT IF EXISTS "ProjectTask_projectId_fkey";
ALTER TABLE "ProjectTask" DROP CONSTRAINT IF EXISTS "ProjectTask_phaseId_fkey";

-- Create default admin user if not exists
INSERT INTO "User" (
    id,
    name,
    role,
    "createdAt",
    "updatedAt"
)
SELECT 
    'default_admin',
    'Default Admin',
    'ADMIN',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE role = 'ADMIN');

-- Create default workflow if not exists
INSERT INTO "Workflow" (
    id,
    name,
    description,
    "createdAt",
    "updatedAt"
)
SELECT 
    'default_workflow',
    'Default Workflow',
    'Default workflow for data migration',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Workflow");

-- Create default phase if not exists
INSERT INTO "Phase" (
    id,
    name,
    description,
    "order",
    "workflowId",
    "createdAt",
    "updatedAt"
)
SELECT 
    'default_workflow_phase',
    'Default Phase',
    'Default phase for data migration',
    0,
    'default_workflow',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Phase");

-- Set default values for any null projectId (using a default project if needed)
INSERT INTO "Project" (
    id, 
    name, 
    description, 
    "projectType",
    "customerName",
    status, 
    "startDate",
    "workflowId",
    "managerId",
    "createdAt", 
    "updatedAt"
)
SELECT 
    'default_project', 
    'Default Project', 
    'Default project for data migration',
    'VEHICLE_WRAP',
    'Default Customer',
    'IN_PROGRESS', 
    NOW(),
    'default_workflow',
    'default_admin',
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Project" WHERE id = 'default_project');

-- Set default values for any null phaseId (using a default phase if needed)
INSERT INTO "ProjectPhase" (
    id, 
    name, 
    description, 
    "projectId", 
    "order", 
    status,
    "phaseId",
    "createdAt", 
    "updatedAt"
)
SELECT 
    'default_phase', 
    'Default Phase', 
    'Default phase for data migration', 
    'default_project', 
    0, 
    'NOT_STARTED',
    'default_workflow_phase',
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "ProjectPhase" WHERE id = 'default_phase');

-- First, create temporary columns
ALTER TABLE "ProjectTask" ADD COLUMN "new_projectId" TEXT;
ALTER TABLE "ProjectTask" ADD COLUMN "new_phaseId" TEXT;

-- Copy data from old columns to new ones
UPDATE "ProjectTask" pt
SET "new_projectId" = pp."projectId",
    "new_phaseId" = pt."projectPhaseId"
FROM "ProjectPhase" pp
WHERE pt."projectPhaseId" = pp.id;

UPDATE "ProjectTask" pt
SET "new_projectId" = 'default_project'
WHERE pt."new_projectId" IS NULL;

UPDATE "ProjectTask" pt
SET "new_phaseId" = 'default_phase'
WHERE pt."new_phaseId" IS NULL;

-- Drop old columns
ALTER TABLE "ProjectTask" DROP COLUMN "manHours";
ALTER TABLE "ProjectTask" DROP COLUMN "projectPhaseId";

-- Add new columns with correct constraints
ALTER TABLE "ProjectTask" ADD COLUMN "projectId" TEXT NOT NULL DEFAULT 'default_project';
ALTER TABLE "ProjectTask" ADD COLUMN "phaseId" TEXT NOT NULL DEFAULT 'default_phase';

-- Copy data from temporary columns
UPDATE "ProjectTask"
SET "projectId" = "new_projectId",
    "phaseId" = "new_phaseId";

-- Drop temporary columns
ALTER TABLE "ProjectTask" DROP COLUMN "new_projectId";
ALTER TABLE "ProjectTask" DROP COLUMN "new_phaseId";

-- Remove default values
ALTER TABLE "ProjectTask" ALTER COLUMN "projectId" DROP DEFAULT;
ALTER TABLE "ProjectTask" ALTER COLUMN "phaseId" DROP DEFAULT;

-- Add foreign key constraints
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "ProjectPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_workflowTaskId_fkey" FOREIGN KEY ("workflowTaskId") REFERENCES "WorkflowTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update status and priority columns
ALTER TABLE "ProjectTask" DROP COLUMN IF EXISTS "status";
ALTER TABLE "ProjectTask" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'NOT_STARTED';

ALTER TABLE "ProjectTask" DROP COLUMN IF EXISTS "priority";
ALTER TABLE "ProjectTask" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'MEDIUM';

-- Create indexes
CREATE INDEX "ProjectTask_projectId_idx" ON "ProjectTask"("projectId");
CREATE INDEX "ProjectTask_phaseId_idx" ON "ProjectTask"("phaseId");
CREATE INDEX "ProjectTask_workflowTaskId_idx" ON "ProjectTask"("workflowTaskId");

-- AlterTable
ALTER TABLE "TaskActivity" DROP COLUMN "content",
ADD COLUMN     "details" TEXT NOT NULL;

-- DropTable
DROP TABLE "_TaskDependencies";
