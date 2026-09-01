/*
  Warnings:

  - Added the required column `storeId` to the `ChecklistCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `CrmInteraction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `CrmMessageTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `CrmOpportunity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `CrmTag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `CrmTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `InventoryDevice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `InventoryPart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `PaymentFee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Repair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `StaffUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `StaffUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `StaffUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `TradeInModel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChecklistCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ChecklistCategory_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChecklistCategory" ("id", "key", "label", "order") SELECT "id", "key", "label", "order" FROM "ChecklistCategory";
DROP TABLE "ChecklistCategory";
ALTER TABLE "new_ChecklistCategory" RENAME TO "ChecklistCategory";
CREATE UNIQUE INDEX "ChecklistCategory_storeId_key_key" ON "ChecklistCategory"("storeId", "key");
CREATE TABLE "new_ChecklistOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "deduction" REAL NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ChecklistOption_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChecklistCategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChecklistOption" ("categoryId", "deduction", "id", "label", "order") SELECT "categoryId", "deduction", "id", "label", "order" FROM "ChecklistOption";
DROP TABLE "ChecklistOption";
ALTER TABLE "new_ChecklistOption" RENAME TO "ChecklistOption";
CREATE TABLE "new_CrmInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,
    "staffId" TEXT,
    CONSTRAINT "CrmInteraction_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmInteraction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmInteraction_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CrmInteraction" ("content", "createdAt", "customerId", "id", "staffId", "type") SELECT "content", "createdAt", "customerId", "id", "staffId", "type" FROM "CrmInteraction";
DROP TABLE "CrmInteraction";
ALTER TABLE "new_CrmInteraction" RENAME TO "CrmInteraction";
CREATE TABLE "new_CrmMessageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CrmMessageTemplate_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CrmMessageTemplate" ("active", "category", "content", "id", "key", "name", "order") SELECT "active", "category", "content", "id", "key", "name", "order" FROM "CrmMessageTemplate";
DROP TABLE "CrmMessageTemplate";
ALTER TABLE "new_CrmMessageTemplate" RENAME TO "CrmMessageTemplate";
CREATE UNIQUE INDEX "CrmMessageTemplate_storeId_key_key" ON "CrmMessageTemplate"("storeId", "key");
CREATE TABLE "new_CrmOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
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
    CONSTRAINT "CrmOpportunity_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmOpportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmOpportunity_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "StaffUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CrmOpportunity" ("assignedToId", "createdAt", "customerId", "id", "lostReason", "nextActionAt", "notes", "pipeline", "source", "stage", "title", "updatedAt", "value") SELECT "assignedToId", "createdAt", "customerId", "id", "lostReason", "nextActionAt", "notes", "pipeline", "source", "stage", "title", "updatedAt", "value" FROM "CrmOpportunity";
DROP TABLE "CrmOpportunity";
ALTER TABLE "new_CrmOpportunity" RENAME TO "CrmOpportunity";
CREATE TABLE "new_CrmTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#56554f',
    CONSTRAINT "CrmTag_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CrmTag" ("color", "id", "name") SELECT "color", "id", "name" FROM "CrmTag";
DROP TABLE "CrmTag";
ALTER TABLE "new_CrmTag" RENAME TO "CrmTag";
CREATE UNIQUE INDEX "CrmTag_storeId_name_key" ON "CrmTag"("storeId", "name");
CREATE TABLE "new_CrmTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,
    "opportunityId" TEXT,
    "assignedToId" TEXT,
    "automationKey" TEXT,
    CONSTRAINT "CrmTask_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmTask_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CrmTask_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "CrmOpportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CrmTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "StaffUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CrmTask" ("assignedToId", "automationKey", "completed", "completedAt", "createdAt", "customerId", "dueAt", "id", "opportunityId", "title") SELECT "assignedToId", "automationKey", "completed", "completedAt", "createdAt", "customerId", "dueAt", "id", "opportunityId", "title" FROM "CrmTask";
DROP TABLE "CrmTask";
ALTER TABLE "new_CrmTask" RENAME TO "CrmTask";
CREATE UNIQUE INDEX "CrmTask_automationKey_key" ON "CrmTask"("automationKey");
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf" TEXT,
    "notes" TEXT,
    "vip" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("cpf", "createdAt", "id", "name", "notes", "phone", "vip") SELECT "cpf", "createdAt", "id", "name", "notes", "phone", "vip" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE TABLE "new_Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Device_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Device" ("active", "color", "createdAt", "id", "name", "price", "storage") SELECT "active", "color", "createdAt", "id", "name", "price", "storage" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    CONSTRAINT "Expense_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "date", "description", "id", "paymentMethod") SELECT "amount", "date", "description", "id", "paymentMethod" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE TABLE "new_InventoryDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 3,
    "costPrice" REAL NOT NULL,
    "salePrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryDevice_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InventoryDevice" ("color", "condition", "costPrice", "createdAt", "id", "minQuantity", "name", "quantity", "salePrice", "storage") SELECT "color", "condition", "costPrice", "createdAt", "id", "minQuantity", "name", "quantity", "salePrice", "storage" FROM "InventoryDevice";
DROP TABLE "InventoryDevice";
ALTER TABLE "new_InventoryDevice" RENAME TO "InventoryDevice";
CREATE TABLE "new_InventoryPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "compatible" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 4,
    "supplier" TEXT NOT NULL,
    "costPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryPart_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InventoryPart" ("compatible", "costPrice", "createdAt", "id", "minQuantity", "name", "quantity", "supplier") SELECT "compatible", "costPrice", "createdAt", "id", "minQuantity", "name", "quantity", "supplier" FROM "InventoryPart";
DROP TABLE "InventoryPart";
ALTER TABLE "new_InventoryPart" RENAME TO "InventoryPart";
CREATE TABLE "new_PaymentFee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "feePercent" REAL NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PaymentFee_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PaymentFee" ("feePercent", "id", "key", "label", "order") SELECT "feePercent", "id", "key", "label", "order" FROM "PaymentFee";
DROP TABLE "PaymentFee";
ALTER TABLE "new_PaymentFee" RENAME TO "PaymentFee";
CREATE UNIQUE INDEX "PaymentFee_storeId_key_key" ON "PaymentFee"("storeId", "key");
CREATE TABLE "new_Repair" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
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
    CONSTRAINT "Repair_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Repair_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Repair_crmOpportunityId_fkey" FOREIGN KEY ("crmOpportunityId") REFERENCES "CrmOpportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Repair" ("color", "completedAt", "createdAt", "crmOpportunityId", "customerId", "customerName", "deadlineLabel", "defectsJson", "estimatedBudget", "id", "imei", "model", "notes", "status") SELECT "color", "completedAt", "createdAt", "crmOpportunityId", "customerId", "customerName", "deadlineLabel", "defectsJson", "estimatedBudget", "id", "imei", "model", "notes", "status" FROM "Repair";
DROP TABLE "Repair";
ALTER TABLE "new_Repair" RENAME TO "Repair";
CREATE UNIQUE INDEX "Repair_crmOpportunityId_key" ON "Repair"("crmOpportunityId");
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
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
    CONSTRAINT "Sale_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_tradeInModelId_fkey" FOREIGN KEY ("tradeInModelId") REFERENCES "TradeInModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_crmOpportunityId_fkey" FOREIGN KEY ("crmOpportunityId") REFERENCES "CrmOpportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("createdAt", "crmOpportunityId", "customerId", "customerName", "customerPhone", "deviceColor", "deviceId", "deviceName", "devicePrice", "feePercent", "feeValue", "hasTradeIn", "id", "installments", "orderNumber", "paymentLabel", "paymentMethod", "totalToPay", "tradeInBaseValue", "tradeInDeductions", "tradeInFinalValue", "tradeInModelId", "tradeInModelName", "warrantyKey", "warrantyLabel", "warrantyPrice") SELECT "createdAt", "crmOpportunityId", "customerId", "customerName", "customerPhone", "deviceColor", "deviceId", "deviceName", "devicePrice", "feePercent", "feeValue", "hasTradeIn", "id", "installments", "orderNumber", "paymentLabel", "paymentMethod", "totalToPay", "tradeInBaseValue", "tradeInDeductions", "tradeInFinalValue", "tradeInModelId", "tradeInModelName", "warrantyKey", "warrantyLabel", "warrantyPrice" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE UNIQUE INDEX "Sale_crmOpportunityId_key" ON "Sale"("crmOpportunityId");
CREATE TABLE "new_StaffUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "vendas" BOOLEAN NOT NULL DEFAULT false,
    "conserto" BOOLEAN NOT NULL DEFAULT false,
    "clientes" BOOLEAN NOT NULL DEFAULT false,
    "financeiro" BOOLEAN NOT NULL DEFAULT false,
    "estoque" BOOLEAN NOT NULL DEFAULT false,
    "config" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "StaffUser_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StaffUser" ("clientes", "config", "conserto", "estoque", "financeiro", "id", "isOwner", "name", "role", "vendas") SELECT "clientes", "config", "conserto", "estoque", "financeiro", "id", "isOwner", "name", "role", "vendas" FROM "StaffUser";
DROP TABLE "StaffUser";
ALTER TABLE "new_StaffUser" RENAME TO "StaffUser";
CREATE UNIQUE INDEX "StaffUser_email_key" ON "StaffUser"("email");
CREATE TABLE "new_TradeInModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseValue" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradeInModel_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TradeInModel" ("active", "baseValue", "createdAt", "id", "name") SELECT "active", "baseValue", "createdAt", "id", "name" FROM "TradeInModel";
DROP TABLE "TradeInModel";
ALTER TABLE "new_TradeInModel" RENAME TO "TradeInModel";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
