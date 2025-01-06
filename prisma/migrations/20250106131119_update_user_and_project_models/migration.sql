/*
  Warnings:

  - The values [CUSTOM] on the enum `FormType` will be removed. If these variants are still used in the database, this will fail.
  - The values [BLOCKED] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FormType_new" AS ENUM ('FORM', 'CHECKLIST', 'SURVEY', 'INSPECTION');
ALTER TABLE "FormTemplate" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "FormTemplate" ALTER COLUMN "type" TYPE "FormType_new" USING ("type"::text::"FormType_new");
ALTER TYPE "FormType" RENAME TO "FormType_old";
ALTER TYPE "FormType_new" RENAME TO "FormType";
DROP TYPE "FormType_old";
ALTER TABLE "FormTemplate" ALTER COLUMN "type" SET DEFAULT 'FORM';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED');
ALTER TABLE "ProjectTask" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProjectTask" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "ProjectTask" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "hashedPassword" TEXT;
