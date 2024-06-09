-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Todos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Todos_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Todos" ("authorId", "createdAt", "description", "id", "title", "updatedAt") SELECT "authorId", "createdAt", "description", "id", "title", "updatedAt" FROM "Todos";
DROP TABLE "Todos";
ALTER TABLE "new_Todos" RENAME TO "Todos";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
