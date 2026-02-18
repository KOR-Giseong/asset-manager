/*
  Warnings:

  - You are about to drop the column `category` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostTag" AS ENUM ('FREE', 'INFO', 'QUESTION');

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "category",
ADD COLUMN     "tag" "PostTag" NOT NULL DEFAULT 'FREE';
