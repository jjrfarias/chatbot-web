-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CrmOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'novo_lead',
    "pipeline" TEXT NOT NULL DEFAULT 'vendas',
    "value" REAL NOT NULL DEFAULT 0,
    "source" TEXT,
    "notes" TEXT,
    "lostReason" TEXT,
    "nextActionAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedToId" TEXT,
    CONSTRAINT "CrmOpportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmOpportunity_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "StaffUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CrmOpportunity" ("assignedToId", "createdAt", "customerId", "id", "lostReason", "nextActionAt", "notes", "source", "stage", "title", "updatedAt", "value") SELECT "assignedToId", "createdAt", "customerId", "id", "lostReason", "nextActionAt", "notes", "source", "stage", "title", "updatedAt", "value" FROM "CrmOpportunity";
DROP TABLE "CrmOpportunity";
ALTER TABLE "new_CrmOpportunity" RENAME TO "CrmOpportunity";
CREATE TABLE "new_Repair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT,
    "imei" TEXT,
    "deadlineLabel" TEXT NOT NULL,
    "defectsJson" TEXT NOT NULL,
    "notes" TEXT,
    "estimatedBudget" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Em andamento',
    "completedAt" DATETIME,
    "crmOpportunityId" TEXT,
    CONSTRAINT "Repair_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Repair_crmOpportunityId_fkey" FOREIGN KEY ("crmOpportunityId") REFERENCES "CrmOpportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Repair" ("color", "completedAt", "createdAt", "customerId", "customerName", "deadlineLabel", "defectsJson", "estimatedBudget", "id", "imei", "model", "notes", "status") SELECT "color", "completedAt", "createdAt", "customerId", "customerName", "deadlineLabel", "defectsJson", "estimatedBudget", "id", "imei", "model", "notes", "status" FROM "Repair";
DROP TABLE "Repair";
ALTER TABLE "new_Repair" RENAME TO "Repair";
CREATE UNIQUE INDEX "Repair_crmOpportunityId_key" ON "Repair"("crmOpportunityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
