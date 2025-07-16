/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Artist_name_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Artist_email_key" ON "Artist"("email");

-- CreateIndex
CREATE INDEX "Artist_name_email_idx" ON "Artist"("name", "email");
