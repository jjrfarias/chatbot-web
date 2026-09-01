-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TradeInModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseValue" REAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChecklistCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ChecklistOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "deduction" REAL NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ChecklistOption_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ChecklistCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cpf" TEXT,
    "notes" TEXT,
    "vip" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sale" (
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
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_tradeInModelId_fkey" FOREIGN KEY ("tradeInModelId") REFERENCES "TradeInModel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SaleTradeInAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "categoryLabel" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "optionLabel" TEXT NOT NULL,
    "deduction" REAL NOT NULL,
    CONSTRAINT "SaleTradeInAnswer_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaleTradeInAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ChecklistOption" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Repair" (
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
    CONSTRAINT "Repair_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentFee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "feePercent" REAL NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "InventoryDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 3,
    "costPrice" REAL NOT NULL,
    "salePrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InventoryPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "compatible" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 4,
    "supplier" TEXT NOT NULL,
    "costPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "amount" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "vendas" BOOLEAN NOT NULL DEFAULT false,
    "conserto" BOOLEAN NOT NULL DEFAULT false,
    "clientes" BOOLEAN NOT NULL DEFAULT false,
    "financeiro" BOOLEAN NOT NULL DEFAULT false,
    "estoque" BOOLEAN NOT NULL DEFAULT false,
    "config" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistCategory_key_key" ON "ChecklistCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentFee_key_key" ON "PaymentFee"("key");
