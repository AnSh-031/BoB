/*
  Warnings:

  - The values [SUPER_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('BANK_ADMIN', 'BANK_AUDITOR', 'BANK_OPERATOR');
ALTER TABLE "public"."Auditor" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Auditor" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "Auditor" ALTER COLUMN "role" SET DEFAULT 'BANK_OPERATOR';
COMMIT;

-- AlterTable
ALTER TABLE "Auditor" ALTER COLUMN "role" SET DEFAULT 'BANK_OPERATOR';
