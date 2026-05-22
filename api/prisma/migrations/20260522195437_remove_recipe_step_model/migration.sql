/*
  Warnings:

  - The values [SECOND,MINUTE,HOUR] on the enum `TimeUnit` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `recipe_steps` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `method` to the `recipes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TimeUnit_new" AS ENUM ('SECONDS', 'MINUTES', 'HOURS', 'DAYS');
ALTER TABLE "recipes" ALTER COLUMN "prepTimeUnit" TYPE "TimeUnit_new" USING ("prepTimeUnit"::text::"TimeUnit_new");
ALTER TABLE "recipes" ALTER COLUMN "cookTimeUnit" TYPE "TimeUnit_new" USING ("cookTimeUnit"::text::"TimeUnit_new");
ALTER TYPE "TimeUnit" RENAME TO "TimeUnit_old";
ALTER TYPE "TimeUnit_new" RENAME TO "TimeUnit";
DROP TYPE "public"."TimeUnit_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "recipe_steps" DROP CONSTRAINT "recipe_steps_user_id_fkey";

-- DropForeignKey
ALTER TABLE "recipe_steps" DROP CONSTRAINT "recipe_steps_user_id_recipe_id_fkey";

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "method" TEXT NOT NULL;

-- DropTable
DROP TABLE "recipe_steps";
