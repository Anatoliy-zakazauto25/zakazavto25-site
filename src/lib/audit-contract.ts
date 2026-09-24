const allowedKeys = new Set(["status", "isPublished", "isFeatured", "pricingPublic"]);

export function sanitizeAuditMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  return Object.fromEntries(Object.entries(metadata).filter(([key, value]) => allowedKeys.has(key) && ["string", "number", "boolean"].includes(typeof value)));
}
