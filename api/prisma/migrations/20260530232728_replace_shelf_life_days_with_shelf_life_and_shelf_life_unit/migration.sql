/*
  Warnings:

  - You are about to drop the column `shelfLifeDays` on the `recipes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "recipes" DROP COLUMN "shelfLifeDays",
ADD COLUMN     "shelfLife" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shelfLifeUnit" "TimeUnit" NOT NULL DEFAULT 'DAYS';
