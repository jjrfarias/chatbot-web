ALTER TABLE "CrmTask" ADD COLUMN "automationKey" TEXT;
CREATE UNIQUE INDEX "CrmTask_automationKey_key" ON "CrmTask"("automationKey");
