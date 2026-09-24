export function parseAuditRetentionDays(value: string | undefined) {
  const days = Number(value ?? 365);
  if (!Number.isInteger(days) || days < 30 || days > 3650) throw new Error("AUDIT_RETENTION_DAYS must be an integer between 30 and 3650 days");
  return days;
}
