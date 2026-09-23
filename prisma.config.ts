import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Keep local client generation usable before a .env file exists.
    // Runtime deployments still provide DATABASE_URL through the environment.
    url: process.env.DATABASE_URL ?? "postgresql://zakazavto:password@localhost:5432/zakazavto_db",
  },
});
