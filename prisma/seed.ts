import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";
import { runtimeConfig } from "../src/lib/config";
import { validateAdminBootstrap } from "../src/lib/admin-bootstrap";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: runtimeConfig.databaseUrl }) });

async function main() {
  const admin = validateAdminBootstrap({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  if (!admin.success) throw new Error(`Invalid admin bootstrap credentials: ${admin.error.issues.map((issue) => issue.message).join("; ")}`);
  const passwordHash = await bcrypt.hash(admin.data.password, 12);

  const admin = await prisma.user.upsert({
    where: { email: admin.data.email },
    update: { passwordHash, isActive: true, role: UserRole.ADMIN },
    create: {
      email: admin.data.email,
      passwordHash,
      name: "CONTENT_REQUIRED",
      role: UserRole.ADMIN,
    },
  });

  await prisma.settings.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      updatedById: admin.id,
      jpyRate: 0.62,
      krwRate: 0.069,
      cnyRate: 12.8,
      companyAddress: "г. Владивосток, ул. 13-я Рабочая, 12с3",
      siteTitle: "ЗаказАвто",
      siteDescription: "CONTENT_REQUIRED",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
