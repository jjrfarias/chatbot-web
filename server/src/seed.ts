import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./auth";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "crsmart2026";

const devices = [
  { name: "iPhone 15 Pro Max", color: "Titânio Natural", storage: "256GB", price: 8999 },
  { name: "iPhone 15 Pro Max", color: "Titânio Natural", storage: "512GB", price: 10499 },
  { name: "iPhone 15 Pro", color: "Titânio Azul", storage: "128GB", price: 7499 },
  { name: "iPhone 15 Pro", color: "Titânio Azul", storage: "256GB", price: 8299 },
  { name: "iPhone 15", color: "Preto", storage: "128GB", price: 5999 },
  { name: "iPhone 14", color: "Meia-noite", storage: "128GB", price: 4799 },
  { name: "iPhone 13", color: "Estelar", storage: "128GB", price: 3999 },
  { name: "iPhone SE (3ª ger.)", color: "Preto", storage: "64GB", price: 2799 },
];

const tradeInModels = [
  { name: "iPhone 15 Pro Max", baseValue: 5800 },
  { name: "iPhone 15 Pro", baseValue: 5200 },
  { name: "iPhone 15", baseValue: 4200 },
  { name: "iPhone 14 Pro Max", baseValue: 4600 },
  { name: "iPhone 14 Pro", baseValue: 4100 },
  { name: "iPhone 14", baseValue: 3400 },
  { name: "iPhone 13", baseValue: 2800 },
  { name: "iPhone 12", baseValue: 2100 },
];

const checklist = [
  {
    key: "tela",
    label: "Tela",
    order: 1,
    options: [
      { label: "Perfeita", deduction: 0 },
      { label: "Arranhada leve", deduction: 50 },
      { label: "Riscos profundos", deduction: 120 },
      { label: "Trincada", deduction: 450 },
    ],
  },
  {
    key: "laterais_carcaca",
    label: "Laterais / carcaça",
    order: 2,
    options: [
      { label: "Perfeita", deduction: 0 },
      { label: "Riscos leves", deduction: 40 },
      { label: "Amassada", deduction: 100 },
    ],
  },
  {
    key: "tampa_traseira",
    label: "Tampa traseira",
    order: 3,
    options: [
      { label: "Perfeita", deduction: 0 },
      { label: "Arranhada", deduction: 60 },
      { label: "Trincada", deduction: 300 },
    ],
  },
  {
    key: "conector_carga",
    label: "Conector de carga",
    order: 4,
    options: [
      { label: "Funcionando", deduction: 0 },
      { label: "Com defeito", deduction: 150 },
    ],
  },
  {
    key: "saude_bateria",
    label: "Saúde da bateria",
    order: 5,
    options: [
      { label: "90% ou mais", deduction: 0 },
      { label: "80% a 89%", deduction: 80 },
      { label: "Abaixo de 80%", deduction: 200 },
    ],
  },
  {
    key: "botoes",
    label: "Botões",
    order: 6,
    options: [
      { label: "Funcionando", deduction: 0 },
      { label: "Com defeito", deduction: 100 },
    ],
  },
  {
    key: "cameras",
    label: "Câmeras",
    order: 7,
    options: [
      { label: "Funcionando", deduction: 0 },
      { label: "Com defeito", deduction: 250 },
    ],
  },
  {
    key: "face_touch_id",
    label: "Face ID / Touch ID",
    order: 8,
    options: [
      { label: "Funcionando", deduction: 0 },
      { label: "Com defeito", deduction: 180 },
    ],
  },
];

const paymentFees = [
  { key: "pix", label: "Pix", feePercent: 0, order: 1 },
  { key: "debito", label: "Débito", feePercent: 1.5, order: 2 },
  { key: "creditoVista", label: "Crédito à vista", feePercent: 3.5, order: 3 },
  { key: "credito2x", label: "Crédito 2x", feePercent: 2.5, order: 4 },
  { key: "credito3x", label: "Crédito 3x", feePercent: 3.9, order: 5 },
  { key: "credito6x", label: "Crédito 6x", feePercent: 6.9, order: 6 },
  { key: "credito10x", label: "Crédito 10x", feePercent: 9.9, order: 7 },
];

const customers = [
  { key: "bruno", name: "Bruno Cardoso", phone: "(11) 98211-4432", cpf: "123.211.432-00", vip: true, notes: "Prefere ser atendido à tarde. Sempre pergunta sobre modelos Pro Max com pouco uso.", createdAt: new Date("2023-01-10") },
  { key: "larissa", name: "Larissa Prado", phone: "(11) 97733-2201", cpf: "456.733.201-00", vip: false, notes: null, createdAt: new Date("2024-06-02") },
  { key: "felipe", name: "Felipe Nogueira", phone: "(21) 99654-8810", cpf: "789.654.810-00", vip: true, notes: null, createdAt: new Date("2022-04-18") },
  { key: "ana", name: "Ana Beatriz Lima", phone: "(11) 98120-5567", cpf: null, vip: false, notes: null, createdAt: new Date("2025-08-19") },
  { key: "rafael", name: "Rafael Souza", phone: "(11) 99887-1234", cpf: "321.887.234-00", vip: false, notes: null, createdAt: new Date("2024-01-05") },
  { key: "camila", name: "Camila Duarte", phone: "(21) 98456-7789", cpf: null, vip: false, notes: null, createdAt: new Date("2023-09-12") },
  { key: "joao", name: "João Pedro Alves", phone: "(11) 97210-3345", cpf: null, vip: false, notes: null, createdAt: new Date("2021-11-30") },
  { key: "juliana", name: "Juliana Costa", phone: "(11) 98899-6612", cpf: null, vip: false, notes: null, createdAt: new Date("2026-08-30") },
];

const inventoryDevices = [
  { name: "iPhone 15 Pro Max", storage: "256GB", color: "Titânio Natural", condition: "Novo", quantity: 4, minQuantity: 3, costPrice: 7200, salePrice: 8999 },
  { name: "iPhone 15 Pro", storage: "128GB", color: "Titânio Azul", condition: "Novo", quantity: 2, minQuantity: 3, costPrice: 6000, salePrice: 7499 },
  { name: "iPhone 15", storage: "128GB", color: "Preto", condition: "Novo", quantity: 6, minQuantity: 3, costPrice: 4800, salePrice: 5999 },
  { name: "iPhone 14 Pro Max", storage: "128GB", color: "Roxo", condition: "Seminovo · Grade A", quantity: 1, minQuantity: 3, costPrice: 3900, salePrice: 4999 },
  { name: "iPhone 14", storage: "128GB", color: "Meia-noite", condition: "Novo", quantity: 5, minQuantity: 3, costPrice: 3700, salePrice: 4799 },
  { name: "iPhone 13", storage: "128GB", color: "Estelar", condition: "Seminovo · Grade B", quantity: 0, minQuantity: 3, costPrice: 2200, salePrice: 3199 },
  { name: "iPhone 12", storage: "64GB", color: "Azul", condition: "Seminovo · Grade B", quantity: 3, minQuantity: 3, costPrice: 1600, salePrice: 2399 },
  { name: "iPhone SE (3ª ger.)", storage: "64GB", color: "Preto", condition: "Novo", quantity: 2, minQuantity: 3, costPrice: 2100, salePrice: 2799 },
];

const inventoryParts = [
  { name: "Tela OLED", compatible: "iPhone 13", quantity: 8, minQuantity: 5, supplier: "ABC Peças", costPrice: 480 },
  { name: "Tela OLED", compatible: "iPhone 14", quantity: 3, minQuantity: 5, supplier: "ABC Peças", costPrice: 620 },
  { name: "Bateria", compatible: "iPhone 12 / 13", quantity: 12, minQuantity: 6, supplier: "Power Cell", costPrice: 95 },
  { name: "Bateria", compatible: "iPhone 14", quantity: 2, minQuantity: 6, supplier: "Power Cell", costPrice: 110 },
  { name: "Conector de carga", compatible: "Universal Lightning", quantity: 15, minQuantity: 8, supplier: "FlexParts", costPrice: 45 },
  { name: "Câmera traseira", compatible: "iPhone 14 Pro", quantity: 0, minQuantity: 3, supplier: "OptiCam", costPrice: 380 },
  { name: "Tampa traseira", compatible: "iPhone 13", quantity: 6, minQuantity: 4, supplier: "ABC Peças", costPrice: 150 },
  { name: "Alto-falante", compatible: "iPhone 12", quantity: 4, minQuantity: 4, supplier: "SoundTech", costPrice: 60 },
];

async function main() {
  await prisma.customerTag.deleteMany();
  await prisma.crmTask.deleteMany();
  await prisma.crmInteraction.deleteMany();
  await prisma.crmOpportunity.deleteMany();
  await prisma.crmTag.deleteMany();
  await prisma.crmMessageTemplate.deleteMany();
  await prisma.saleTradeInAnswer.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.repair.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.checklistOption.deleteMany();
  await prisma.checklistCategory.deleteMany();
  await prisma.tradeInModel.deleteMany();
  await prisma.device.deleteMany();
  await prisma.paymentFee.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryDevice.deleteMany();
  await prisma.inventoryPart.deleteMany();
  await prisma.staffUser.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: { name: "CR Smart", tagline: "Vendas & Assistência iPhone" },
  });
  const storeId = store.id;

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);
  const staffRows = await Promise.all(
    [
      { name: "Marcos Silva", email: "marcos@crsmart.com.br", role: "Dono da loja", isOwner: true, vendas: true, conserto: true, clientes: true, financeiro: true, estoque: true, config: true },
      { name: "Ana Ferreira", email: "ana@crsmart.com.br", role: "Atendente", isOwner: false, vendas: true, conserto: false, clientes: true, financeiro: false, estoque: false, config: false },
      { name: "Diego Martins", email: "diego@crsmart.com.br", role: "Técnico", isOwner: false, vendas: false, conserto: true, clientes: false, financeiro: false, estoque: true, config: false },
      { name: "Camila Rocha", email: "camila@crsmart.com.br", role: "Atendente", isOwner: false, vendas: true, conserto: false, clientes: true, financeiro: false, estoque: false, config: false },
    ].map((s) => prisma.staffUser.create({ data: { ...s, storeId, passwordHash } })),
  );
  void staffRows;

  await prisma.device.createMany({ data: devices.map((d) => ({ ...d, storeId })) });
  const tradeInRows = await Promise.all(
    tradeInModels.map((t) => prisma.tradeInModel.create({ data: { ...t, storeId } })),
  );
  await prisma.paymentFee.createMany({ data: paymentFees.map((f) => ({ ...f, storeId })) });
  await prisma.inventoryDevice.createMany({ data: inventoryDevices.map((d) => ({ ...d, storeId })) });
  await prisma.inventoryPart.createMany({ data: inventoryParts.map((p) => ({ ...p, storeId })) });

  for (const category of checklist) {
    await prisma.checklistCategory.create({
      data: {
        storeId,
        key: category.key,
        label: category.label,
        order: category.order,
        options: {
          create: category.options.map((o, i) => ({
            label: o.label,
            deduction: o.deduction,
            order: i,
          })),
        },
      },
    });
  }

  const customerRows: Record<string, { id: string; name: string; phone: string }> = {};
  for (const c of customers) {
    const row = await prisma.customer.create({
      data: { storeId, name: c.name, phone: c.phone, cpf: c.cpf, vip: c.vip, notes: c.notes, createdAt: c.createdAt },
    });
    customerRows[c.key] = row;
  }

  const tradeIn14ProMax = tradeInRows.find((t) => t.name === "iPhone 14 Pro Max")!;
  const device15Pro = await prisma.device.findFirstOrThrow({ where: { storeId, name: "iPhone 15 Pro", storage: "128GB" } });
  const device15ProMax256 = await prisma.device.findFirstOrThrow({ where: { storeId, name: "iPhone 15 Pro Max", storage: "256GB" } });
  const device14 = await prisma.device.findFirstOrThrow({ where: { storeId, name: "iPhone 14" } });

  const checklistCats = await prisma.checklistCategory.findMany({ where: { storeId }, include: { options: true }, orderBy: { order: "asc" } });
  const answerFor = (categoryKey: string, optionLabel: string) => {
    const cat = checklistCats.find((c) => c.key === categoryKey)!;
    const opt = cat.options.find((o) => o.label === optionLabel)!;
    return { categoryId: cat.id, categoryLabel: cat.label, optionId: opt.id, optionLabel: opt.label, deduction: opt.deduction };
  };

  const brunoTradeAnswers = [
    answerFor("tela", "Riscos profundos"),
    answerFor("laterais_carcaca", "Amassada"),
    answerFor("tampa_traseira", "Trincada"),
    answerFor("conector_carga", "Funcionando"),
    answerFor("saude_bateria", "90% ou mais"),
    answerFor("botoes", "Com defeito"),
    answerFor("cameras", "Funcionando"),
    answerFor("face_touch_id", "Funcionando"),
  ];
  const brunoDeductions = brunoTradeAnswers.reduce((s, a) => s + a.deduction, 0);
  const brunoTradeFinal = tradeIn14ProMax.baseValue - brunoDeductions;

  await prisma.sale.create({
    data: {
      storeId,
      orderNumber: "CR-08421",
      createdAt: new Date("2026-09-01T14:00:00"),
      customerId: customerRows.bruno.id,
      customerName: customerRows.bruno.name,
      customerPhone: customerRows.bruno.phone,
      deviceId: device15Pro.id,
      deviceName: device15Pro.name,
      deviceColor: device15Pro.color,
      devicePrice: device15Pro.price,
      hasTradeIn: true,
      tradeInModelId: tradeIn14ProMax.id,
      tradeInModelName: tradeIn14ProMax.name,
      tradeInBaseValue: tradeIn14ProMax.baseValue,
      tradeInDeductions: brunoDeductions,
      tradeInFinalValue: brunoTradeFinal,
      warrantyKey: "padrao",
      warrantyLabel: "Padrão CR SMART · 3 meses",
      warrantyPrice: 0,
      paymentMethod: "pix",
      paymentLabel: "Pix",
      installments: 1,
      feePercent: 0,
      feeValue: 0,
      totalToPay: device15Pro.price - brunoTradeFinal,
      answers: { create: brunoTradeAnswers },
    },
  });

  await prisma.sale.create({
    data: {
      storeId,
      orderNumber: "CR-05190",
      createdAt: new Date("2023-01-10T11:00:00"),
      customerId: customerRows.bruno.id,
      customerName: customerRows.bruno.name,
      customerPhone: customerRows.bruno.phone,
      deviceId: device14.id,
      deviceName: "iPhone 12",
      deviceColor: "Azul",
      devicePrice: 2899,
      hasTradeIn: false,
      paymentMethod: "pix",
      paymentLabel: "Pix",
      installments: 1,
      feePercent: 0,
      feeValue: 0,
      totalToPay: 2899,
    },
  });

  await prisma.sale.create({
    data: {
      storeId,
      orderNumber: "CR-08390",
      createdAt: new Date("2026-08-30T16:30:00"),
      customerId: customerRows.felipe.id,
      customerName: customerRows.felipe.name,
      customerPhone: customerRows.felipe.phone,
      deviceId: device15ProMax256.id,
      deviceName: device15ProMax256.name,
      deviceColor: device15ProMax256.color,
      devicePrice: device15ProMax256.price,
      hasTradeIn: false,
      paymentMethod: "credito3x",
      paymentLabel: "Crédito 3x",
      installments: 3,
      feePercent: 3.9,
      feeValue: 0,
      totalToPay: device15ProMax256.price,
    },
  });

  await prisma.sale.create({
    data: {
      storeId,
      orderNumber: "CR-07120",
      createdAt: new Date("2026-07-15T10:00:00"),
      customerId: customerRows.rafael.id,
      customerName: customerRows.rafael.name,
      customerPhone: customerRows.rafael.phone,
      deviceId: device14.id,
      deviceName: device14.name,
      deviceColor: device14.color,
      devicePrice: device14.price,
      hasTradeIn: false,
      paymentMethod: "pix",
      paymentLabel: "Pix",
      installments: 1,
      feePercent: 0,
      feeValue: 0,
      totalToPay: device14.price,
    },
  });

  await prisma.repair.create({
    data: {
      storeId,
      createdAt: new Date("2026-09-01T09:30:00"),
      customerId: customerRows.larissa.id,
      customerName: customerRows.larissa.name,
      model: "iPhone 13",
      color: "Estelar",
      imei: null,
      deadlineLabel: "48 horas",
      defectsJson: JSON.stringify([{ id: "telaQuebrada", label: "Tela quebrada", price: 350 }]),
      notes: null,
      estimatedBudget: 350,
      status: "Em andamento",
    },
  });

  await prisma.repair.create({
    data: {
      storeId,
      createdAt: new Date("2026-08-29T15:00:00"),
      customerId: customerRows.ana.id,
      customerName: customerRows.ana.name,
      model: "iPhone 12",
      color: null,
      imei: null,
      deadlineLabel: "24 horas",
      defectsJson: JSON.stringify([{ id: "bateria", label: "Bateria viciada", price: 220 }]),
      notes: null,
      estimatedBudget: 220,
      status: "Aguardando peça",
    },
  });

  await prisma.repair.create({
    data: {
      storeId,
      createdAt: new Date("2025-03-14T13:00:00"),
      customerId: customerRows.bruno.id,
      customerName: customerRows.bruno.name,
      model: "iPhone 12",
      color: null,
      imei: null,
      deadlineLabel: "24 horas",
      defectsJson: JSON.stringify([{ id: "bateria", label: "Bateria viciada", price: 220 }]),
      notes: null,
      estimatedBudget: 220,
      status: "Concluído",
      completedAt: new Date("2025-03-15T13:00:00"),
    },
  });

  await prisma.expense.create({
    data: { storeId, date: new Date("2026-09-01T12:00:00"), description: "Compra de peças · Fornecedor ABC Peças", paymentMethod: "Transferência", amount: 1240 },
  });
  await prisma.expense.create({
    data: { storeId, date: new Date("2026-08-28T09:00:00"), description: "Aluguel do ponto comercial", paymentMethod: "Transferência", amount: 4500 },
  });

  console.log("Seed concluído.");
  console.log(`Loja criada: ${store.name} (${store.id})`);
  console.log(`Login: marcos@crsmart.com.br / ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
