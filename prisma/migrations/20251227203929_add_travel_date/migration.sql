-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "holidayId" TEXT,
    "travelDate" DATETIME,
    "priceThreshold" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Alert_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alert_holidayId_fkey" FOREIGN KEY ("holidayId") REFERENCES "Holiday" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Alert" ("createdAt", "email", "holidayId", "id", "isActive", "priceThreshold", "routeId", "updatedAt") SELECT "createdAt", "email", "holidayId", "id", "isActive", "priceThreshold", "routeId", "updatedAt" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE INDEX "Alert_email_idx" ON "Alert"("email");
CREATE INDEX "Alert_isActive_idx" ON "Alert"("isActive");
CREATE INDEX "Alert_travelDate_idx" ON "Alert"("travelDate");
CREATE UNIQUE INDEX "Alert_email_routeId_holidayId_travelDate_key" ON "Alert"("email", "routeId", "holidayId", "travelDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
