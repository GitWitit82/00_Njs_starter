/*
  Warnings:

  - You are about to drop the column `formTemplateId` on the `FormResponse` table. All the data in the column will be lost.
  - You are about to drop the column `projectTaskId` on the `FormResponse` table. All the data in the column will be lost.
  - Added the required column `taskId` to the `FormResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `FormResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workflowId` to the `FormTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_formTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "FormResponse" DROP CONSTRAINT "FormResponse_projectTaskId_fkey";

-- AlterTable
ALTER TABLE "FormResponse" DROP COLUMN "formTemplateId",
DROP COLUMN "projectTaskId",
ADD COLUMN     "taskId" TEXT NOT NULL,
ADD COLUMN     "templateId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "workflowId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FormTemplate" ADD CONSTRAINT "FormTemplate_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
