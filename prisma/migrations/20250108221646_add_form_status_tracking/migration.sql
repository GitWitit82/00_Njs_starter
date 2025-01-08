-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FormInstanceStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "FormInstanceStatus" ADD VALUE 'PENDING_REVIEW';
ALTER TYPE "FormInstanceStatus" ADD VALUE 'ON_HOLD';

-- AlterTable
ALTER TABLE "FormTemplate" ADD COLUMN     "priority" "FormPriority" NOT NULL DEFAULT 'STANDARD';

-- CreateTable
CREATE TABLE "FormStatusHistory" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "status" "FormInstanceStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,
    "metadata" JSONB,
    "comments" TEXT,

    CONSTRAINT "FormStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormCompletionRequirement" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "requiredForPhase" BOOLEAN NOT NULL DEFAULT false,
    "requiredForTask" BOOLEAN NOT NULL DEFAULT true,
    "completionOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormCompletionRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FormDependencies" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FormDependencies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "FormCompletionRequirement_templateId_phaseId_key" ON "FormCompletionRequirement"("templateId", "phaseId");

-- CreateIndex
CREATE INDEX "_FormDependencies_B_index" ON "_FormDependencies"("B");

-- AddForeignKey
ALTER TABLE "FormStatusHistory" ADD CONSTRAINT "FormStatusHistory_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "FormInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormStatusHistory" ADD CONSTRAINT "FormStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormCompletionRequirement" ADD CONSTRAINT "FormCompletionRequirement_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormCompletionRequirement" ADD CONSTRAINT "FormCompletionRequirement_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormDependencies" ADD CONSTRAINT "_FormDependencies_A_fkey" FOREIGN KEY ("A") REFERENCES "FormCompletionRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FormDependencies" ADD CONSTRAINT "_FormDependencies_B_fkey" FOREIGN KEY ("B") REFERENCES "FormCompletionRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
