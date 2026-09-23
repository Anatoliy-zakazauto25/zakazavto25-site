"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const { response, data, error } = await clientApi<{ data?: { token?: string } }>("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!response.ok || !data?.data?.token) { setError(error ?? "Не удалось войти"); setLoading(false); return; }
    localStorage.setItem("token", data.data.token);
    const next = new URLSearchParams(window.location.search).get("next");
    const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin/vehicles";
    router.replace(destination);
  }

  return <main className="login-shell"><div className="login-card"><p className="eyebrow">ЗАКАЗАВТО / ADMIN</p><h1>Вход в<br /><em>панель.</em></h1><p className="login-intro">Управляйте каталогом, расчётами и материалами автомобилей.</p><form className="admin-form" onSubmit={submit}><label>Email<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Пароль<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button className="button button-red" disabled={loading}>{loading ? "Входим..." : "Войти в панель"}</button>{error && <p className="login-error">{error}</p>}</form></div></main>;
}
