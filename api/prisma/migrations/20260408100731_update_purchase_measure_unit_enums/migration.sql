-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MeasureUnit" ADD VALUE 'OUNCE';
ALTER TYPE "MeasureUnit" ADD VALUE 'POUND';
ALTER TYPE "MeasureUnit" ADD VALUE 'PINT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PurchaseUnit" ADD VALUE 'OUNCE';
ALTER TYPE "PurchaseUnit" ADD VALUE 'POUND';
ALTER TYPE "PurchaseUnit" ADD VALUE 'PINT';
