export type ClientApiResult<T> = { response: Response; data: T | null; error: string | null };

export async function clientApi<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ClientApiResult<T>> {
  try {
    const response = await fetch(input, init);
    const data = await response.json().catch(() => null) as (T & { error?: { message?: string } }) | null;
    const statusMessage = response.status === 401 ? "Сессия истекла. Войдите снова." : response.status === 429 ? "Слишком много запросов. Попробуйте позже." : response.status >= 500 ? "Сервис временно недоступен." : `Ошибка запроса (${response.status})`;
    return { response, data, error: response.ok ? null : data?.error?.message ?? statusMessage };
  } catch { return { response: new Response(null, { status: 500 }), data: null, error: "Сервис временно недоступен." }; }
}

export function authHeaders(token: string | null, json = false) {
  return { ...(json ? { "content-type": "application/json" } : {}), authorization: `Bearer ${token ?? ""}` };
}
