-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceColor" TEXT NOT NULL,
    "devicePrice" REAL NOT NULL,
    "hasTradeIn" BOOLEAN NOT NULL DEFAULT false,
    "tradeInModelId" TEXT,
    "tradeInModelName" TEXT,
    "tradeInBaseValue" REAL,
    "tradeInDeductions" REAL NOT NULL DEFAULT 0,
    "tradeInFinalValue" REAL NOT NULL DEFAULT 0,
    "warrantyKey" TEXT NOT NULL DEFAULT 'padrao',
    "warrantyLabel" TEXT NOT NULL DEFAULT 'Padrão CR SMART · 3 meses',
    "warrantyPrice" REAL NOT NULL DEFAULT 0,
    "paymentMethod" TEXT NOT NULL,
    "paymentLabel" TEXT NOT NULL,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "feePercent" REAL NOT NULL DEFAULT 0,
    "feeValue" REAL NOT NULL DEFAULT 0,
    "totalToPay" REAL NOT NULL,
    "crmOpportunityId" TEXT,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_tradeInModelId_fkey" FOREIGN KEY ("tradeInModelId") REFERENCES "TradeInModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_crmOpportunityId_fkey" FOREIGN KEY ("crmOpportunityId") REFERENCES "CrmOpportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("createdAt", "customerId", "customerName", "customerPhone", "deviceColor", "deviceId", "deviceName", "devicePrice", "feePercent", "feeValue", "hasTradeIn", "id", "installments", "orderNumber", "paymentLabel", "paymentMethod", "totalToPay", "tradeInBaseValue", "tradeInDeductions", "tradeInFinalValue", "tradeInModelId", "tradeInModelName", "warrantyKey", "warrantyLabel", "warrantyPrice") SELECT "createdAt", "customerId", "customerName", "customerPhone", "deviceColor", "deviceId", "deviceName", "devicePrice", "feePercent", "feeValue", "hasTradeIn", "id", "installments", "orderNumber", "paymentLabel", "paymentMethod", "totalToPay", "tradeInBaseValue", "tradeInDeductions", "tradeInFinalValue", "tradeInModelId", "tradeInModelName", "warrantyKey", "warrantyLabel", "warrantyPrice" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE UNIQUE INDEX "Sale_crmOpportunityId_key" ON "Sale"("crmOpportunityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
