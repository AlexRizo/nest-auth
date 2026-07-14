/*
  Warnings:

  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('ADMIN', 'STAFF', 'CLIENT_ADMIN', 'CLIENT_STAFF');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fullAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "UserRoleEnum" NOT NULL;
