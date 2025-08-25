-- CreateEnum
CREATE TYPE "public"."CardType" AS ENUM ('NUMBER', 'SKIP', 'REVERSE', 'DRAW_TWO', 'WILD', 'WILD_DRAW_FOUR');

-- CreateEnum
CREATE TYPE "public"."CardColor" AS ENUM ('RED', 'BLUE', 'GREEN', 'YELLOW');

-- CreateTable
CREATE TABLE "public"."cards" (
    "id" SERIAL NOT NULL,
    "type" "public"."CardType" NOT NULL,
    "color" "public"."CardColor",
    "value" INTEGER,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);
