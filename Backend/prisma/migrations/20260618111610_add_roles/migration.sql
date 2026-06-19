/*
  Warnings:

  - The `role` column on the `Auditor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BANK_AUDITOR', 'BANK_ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "Auditor" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BANK_AUDITOR';
