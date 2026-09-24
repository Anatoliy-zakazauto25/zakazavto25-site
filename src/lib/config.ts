const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const isProduction = process.env.NODE_ENV === "production" && !isBuild;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value && isProduction) throw new Error(`${name} is required in production`);
  return value ?? "";
}

export const runtimeConfig = {
  isProduction,
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET") || "local-development-secret",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
};

export function configHealth() {
  return { databaseConfigured: Boolean(runtimeConfig.databaseUrl), jwtSecretConfigured: Boolean(process.env.JWT_SECRET), siteUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SITE_URL) };
}
