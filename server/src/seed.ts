import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const devices = [
  { name: "iPhone 16 Pro Max", storage: "256GB", price: 9999 },
  { name: "iPhone 16 Pro", storage: "128GB", price: 8499 },
  { name: "iPhone 16", storage: "128GB", price: 6499 },
  { name: "iPhone 15 Pro Max", storage: "256GB", price: 8999 },
  { name: "iPhone 15 Pro", storage: "128GB", price: 7499 },
  { name: "iPhone 15", storage: "128GB", price: 5999 },
  { name: "iPhone 14", storage: "128GB", price: 4799 },
  { name: "iPhone 13", storage: "128GB", price: 3999 },
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
      { label: "Arranhada leve", deduction: 40 },
      { label: "Riscos profundos", deduction: 120 },
      { label: "Trincada", deduction: 250 },
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
      { label: "Arranhada", deduction: 80 },
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
      { label: "Com defeito", deduction: 300 },
    ],
  },
];

async function main() {
  await prisma.saleTradeInAnswer.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.checklistOption.deleteMany();
  await prisma.checklistCategory.deleteMany();
  await prisma.tradeInModel.deleteMany();
  await prisma.device.deleteMany();

  await prisma.device.createMany({ data: devices });
  await prisma.tradeInModel.createMany({ data: tradeInModels });

  for (const category of checklist) {
    await prisma.checklistCategory.create({
      data: {
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

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
