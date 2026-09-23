import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { runtimeConfig } from "../src/lib/config";
import { parseAuditRetentionDays } from "../src/lib/audit-retention";

const days = parseAuditRetentionDays(process.env.AUDIT_RETENTION_DAYS);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: runtimeConfig.databaseUrl }) });

try { const result = await prisma.auditLog.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - days * 86_400_000) } } }); console.log(JSON.stringify({ deleted: result.count, retentionDays: days })); } finally { await prisma.$disconnect(); }
