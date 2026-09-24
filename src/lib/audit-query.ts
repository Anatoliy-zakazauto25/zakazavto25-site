export function parseAuditQuery(searchParams: URLSearchParams) {
  const rawPage = Number(searchParams.get("page") ?? 1); const rawLimit = Number(searchParams.get("limit") ?? 30);
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1;
  const perPage = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.floor(rawLimit))) : 30;
  const entityType = searchParams.get("entityType")?.trim().slice(0, 80) || undefined;
  const action = searchParams.get("action")?.trim().slice(0, 80) || undefined;
  return { page, perPage, entityType, action };
}
