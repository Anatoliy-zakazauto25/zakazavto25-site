export function parsePagination(searchParams: URLSearchParams, defaultLimit = 20) {
  const rawPage = Number(searchParams.get("page") ?? 1); const rawLimit = Number(searchParams.get("limit") ?? searchParams.get("perPage") ?? defaultLimit);
  return { page: Number.isFinite(rawPage) ? Math.max(1, Math.floor(rawPage)) : 1, perPage: Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.floor(rawLimit))) : defaultLimit };
}
