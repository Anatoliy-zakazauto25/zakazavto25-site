"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter(); const pathname = usePathname(); const [ready, setReady] = useState(false);
  // Auth is client-only because the access token is intentionally kept out of SSR.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!localStorage.getItem("token")) router.replace(`/login?next=${encodeURIComponent(pathname)}`); else setReady(true); }, [pathname, router]);
  function logout() { localStorage.removeItem("token"); router.replace("/login"); }
  if (!ready) return <main className="admin-loading">Проверяем доступ...</main>;
  return <div className="admin-frame"><aside className="admin-sidebar"><Link className="admin-brand" href="/admin/vehicles">Заказ<span>Авто</span></Link><nav><Link className={pathname.startsWith("/admin/vehicles") ? "active" : ""} href="/admin/vehicles">Автомобили</Link><Link className={pathname.startsWith("/admin/leads") ? "active" : ""} href="/admin/leads">Заявки</Link><Link className={pathname.startsWith("/admin/orders") ? "active" : ""} href="/admin/orders">Заказы</Link><Link className={pathname.startsWith("/admin/audit") ? "active" : ""} href="/admin/audit">Аудит</Link><span>Клиенты <small>скоро</small></span><Link className={pathname.startsWith("/admin/settings") ? "active" : ""} href="/admin/settings">Настройки</Link></nav><button className="admin-logout" onClick={logout}>Выйти</button></aside><div className="admin-main">{children}</div></div>;
}
