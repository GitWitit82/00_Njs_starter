-- AlterTable
ALTER TABLE "ProjectTask" ADD COLUMN     "actualEnd" TIMESTAMP(3),
ADD COLUMN     "actualStart" TIMESTAMP(3),
ADD COLUMN     "manHours" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "scheduledEnd" TIMESTAMP(3),
ADD COLUMN     "scheduledStart" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ProjectTask_workflowTaskId_idx" ON "ProjectTask"("workflowTaskId");
