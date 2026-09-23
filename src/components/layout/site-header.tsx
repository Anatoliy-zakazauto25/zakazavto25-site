"use client";

import Link from "next/link";
import { useState } from "react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={`site-header${menuOpen ? " menu-open" : ""}`}>
      <Link className="brand" href="/">
        ЗаказАвто<span>25</span>
      </Link>
      <nav id="site-navigation" aria-label="Основная навигация">
        <Link href="/#advantages">Преимущества</Link>
        <Link href="/#faq">Вопросы</Link>
        <Link href="/#reviews">Отзывы</Link>
        <Link href="/#contacts">Контакты</Link>
        <Link href="/news">Новости</Link>
        <Link href="/catalog">Автомобили</Link>
        <Link href="/about">О компании</Link>
      </nav>
      <button className="menu-button" type="button" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}>
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </button>
    </header>
  );
}
