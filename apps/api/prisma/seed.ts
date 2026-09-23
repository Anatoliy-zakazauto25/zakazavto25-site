import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: {},
    create: {
      email: 'admin@crm.com',
      password: adminPassword,
      firstName: 'Админ',
      lastName: 'Система',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
  });

  // Create Sales Manager
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: {},
    create: {
      email: 'manager@crm.com',
      password: managerPassword,
      firstName: 'Иван',
      lastName: 'Менеджер',
      role: UserRole.SALES_MANAGER,
      status: 'ACTIVE',
    },
  });

  // Create Sales Rep
  const repPassword = await bcrypt.hash('Rep123!', 10);
  const rep = await prisma.user.upsert({
    where: { email: 'rep@crm.com' },
    update: {},
    create: {
      email: 'rep@crm.com',
      password: repPassword,
      firstName: 'Петр',
      lastName: 'Продавец',
      role: UserRole.SALES_REP,
      status: 'ACTIVE',
    },
  });

  // Create Default Pipeline for Auto Sales
  const pipeline = await prisma.pipeline.upsert({
    where: { id: 'default-pipeline' },
    update: {},
    create: {
      id: 'default-pipeline',
      name: 'Продажа автомобилей',
      description: 'Основная воронка продаж авто под заказ',
      isDefault: true,
      isActive: true,
    },
  });

  // Delete existing stages for this pipeline to avoid duplicates
  await prisma.pipelineStage.deleteMany({
    where: { pipelineId: pipeline.id },
  });

  // Create Pipeline Stages
  const stages = await Promise.all([
    prisma.pipelineStage.create({
      data: {
        name: 'Новая заявка',
        probability: 10,
        order: 1,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Квалификация',
        probability: 25,
        order: 2,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Подбор авто',
        probability: 40,
        order: 3,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Расчет стоимости',
        probability: 60,
        order: 4,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Договор',
        probability: 80,
        order: 5,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Ожидание поставки',
        probability: 90,
        order: 6,
        pipelineId: pipeline.id,
      },
    }),
    prisma.pipelineStage.create({
      data: {
        name: 'Сделка закрыта',
        probability: 100,
        order: 7,
        pipelineId: pipeline.id,
      },
    }),
  ]);

  console.log('✅ Seeding completed!');
  console.log('👤 Admin: admin@crm.com / Admin123!');
  console.log('👤 Manager: manager@crm.com / Manager123!');
  console.log('👤 Sales Rep: rep@crm.com / Rep123!');
  console.log(`📊 Pipeline "${pipeline.name}" created with ${stages.length} stages`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
