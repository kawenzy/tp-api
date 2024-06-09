/*
  Warnings:

  - You are about to drop the column `status` on the `Side` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Side" (
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" INTEGER NOT NULL,
    "imgurl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Side" ("createdAt", "email", "imgurl", "name", "password", "token") SELECT "createdAt", "email", "imgurl", "name", "password", "token" FROM "Side";
DROP TABLE "Side";
ALTER TABLE "new_Side" RENAME TO "Side";
CREATE UNIQUE INDEX "Side_token_key" ON "Side"("token");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
