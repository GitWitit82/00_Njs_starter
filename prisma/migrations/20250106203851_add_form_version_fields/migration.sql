/*
  Warnings:

  - You are about to drop the column `templateId` on the `FormResponse` table. All the data in the column will be lost.
  - Added the required column `instanceId` to the `FormResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `FormResponse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FormInstanceStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('CREATED', 'UPDATED', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_projectTaskId_fkey";

-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_templateId_fkey";

-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "templateId",
ADD COLUMN     "formTemplateId" TEXT,
ADD COLUMN     "instanceId" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL,
ALTER COLUMN "projectTaskId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "currentVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "FormVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "templateId" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "layout" JSONB,
    "style" JSONB,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "changelog" TEXT,

    CONSTRAINT "FormVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormInstance" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "projectTaskId" TEXT NOT NULL,
    "status" "FormInstanceStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponseHistory" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metadata" JSONB,
    "status" "FormStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,
    "changeType" "ChangeType" NOT NULL,
    "comments" TEXT,

    CONSTRAINT "FormResponseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormVersion_templateId_version_key" ON "FormVersion"("templateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "FormInstance_templateId_projectTaskId_key" ON "FormInstance"("templateId", "projectTaskId");

-- AddForeignKey
ALTER TABLE "FormVersion" ADD CONSTRAINT "FormVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormVersion" ADD CONSTRAINT "FormVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormInstance" ADD CONSTRAINT "FormInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormInstance" ADD CONSTRAINT "FormInstance_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "FormVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormInstance" ADD CONSTRAINT "FormInstance_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormInstance" ADD CONSTRAINT "FormInstance_projectTaskId_fkey" FOREIGN KEY ("projectTaskId") REFERENCES "ProjectTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "FormInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_projectTaskId_fkey" FOREIGN KEY ("projectTaskId") REFERENCES "ProjectTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_formTemplateId_fkey" FOREIGN KEY ("formTemplateId") REFERENCES "FormTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponseHistory" ADD CONSTRAINT "FormResponseHistory_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "FormResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponseHistory" ADD CONSTRAINT "FormResponseHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
