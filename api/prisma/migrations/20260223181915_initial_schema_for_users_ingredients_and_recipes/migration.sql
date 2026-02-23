-- CreateEnum
CREATE TYPE "PurchaseUnit" AS ENUM ('GRAM', 'KILOGRAM', 'MILLILITRE', 'LITRE', 'PACK', 'UNIT');

-- CreateEnum
CREATE TYPE "MeasureUnit" AS ENUM ('GRAM', 'KILOGRAM', 'MILLILITRE', 'LITRE', 'PACK', 'UNIT');

-- CreateEnum
CREATE TYPE "TimeUnit" AS ENUM ('SECOND', 'MINUTE', 'HOUR');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "display_name" TEXT NOT NULL,
    "email_address" VARCHAR(320) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email_verified_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(128) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "purchaseUnit" "PurchaseUnit" NOT NULL,
    "costPerUnit" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "prepTime" DOUBLE PRECISION NOT NULL,
    "prepTimeUnit" "TimeUnit" NOT NULL,
    "cookTime" DOUBLE PRECISION NOT NULL,
    "cookTimeUnit" "TimeUnit" NOT NULL,
    "shelfLifeDays" INTEGER NOT NULL,
    "portions" INTEGER NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "user_id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "MeasureUnit" NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "user_id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "step_number" INTEGER NOT NULL,
    "text" VARCHAR(4096) NOT NULL,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_address_key" ON "users"("email_address");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_expires_at_idx" ON "email_verification_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "ingredients_user_id_idx" ON "ingredients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_user_id_id_key" ON "ingredients"("user_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_user_id_name_key" ON "ingredients"("user_id", "name");

-- CreateIndex
CREATE INDEX "recipes_user_id_idx" ON "recipes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_user_id_id_key" ON "recipes"("user_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_user_id_name_key" ON "recipes"("user_id", "name");

-- CreateIndex
CREATE INDEX "recipe_ingredients_user_id_idx" ON "recipe_ingredients"("user_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_user_id_recipe_id_idx" ON "recipe_ingredients"("user_id", "recipe_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_user_id_ingredient_id_idx" ON "recipe_ingredients"("user_id", "ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_user_id_recipe_id_ingredient_id_key" ON "recipe_ingredients"("user_id", "recipe_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "recipe_steps_user_id_idx" ON "recipe_steps"("user_id");

-- CreateIndex
CREATE INDEX "recipe_steps_user_id_recipe_id_idx" ON "recipe_steps"("user_id", "recipe_id");

-- CreateIndex
CREATE INDEX "recipe_steps_user_id_recipe_id_step_number_idx" ON "recipe_steps"("user_id", "recipe_id", "step_number");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_steps_user_id_recipe_id_step_number_key" ON "recipe_steps"("user_id", "recipe_id", "step_number");

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_user_id_recipe_id_fkey" FOREIGN KEY ("user_id", "recipe_id") REFERENCES "recipes"("user_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_user_id_ingredient_id_fkey" FOREIGN KEY ("user_id", "ingredient_id") REFERENCES "ingredients"("user_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_user_id_recipe_id_fkey" FOREIGN KEY ("user_id", "recipe_id") REFERENCES "recipes"("user_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
