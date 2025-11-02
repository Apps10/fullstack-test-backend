/*
  Warnings:

  - Added the required column `totalAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "totalAmount" DECIMAL(12,2) NOT NULL;
