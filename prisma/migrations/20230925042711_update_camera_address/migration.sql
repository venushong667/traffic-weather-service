/*
  Warnings:

  - Added the required column `address` to the `Camera` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Camera" ADD COLUMN     "address" TEXT NOT NULL;
