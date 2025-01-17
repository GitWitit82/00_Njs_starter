/*
  Warnings:

  - You are about to drop the column `hashedPassword` on the `User` table. All the data in the column will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "hashedPassword",
ADD COLUMN     "password" TEXT,
ALTER COLUMN "name" SET NOT NULL;
