type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now(); const current = buckets.get(key);
  if (!current || current.resetAt <= now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return { allowed: true, retryAfter: 0 }; }
  current.count += 1;
  return { allowed: current.count <= limit, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
}

export function tooManyRequests(retryAfter: number) {
  return Response.json({ success: false, error: { code: "RATE_LIMITED", message: "Слишком много запросов. Попробуйте позже." } }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
}
