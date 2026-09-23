# Tech Stack — ЗаказАвто

## Назначение документа

Описание технологического стека, инфраструктуры и архитектурных решений проекта ЗаказАвто.

---

## 1. Архитектурный подход

### Модульный монолит

**Решение:** Начать с модульного монолита, а не микросервисов.

**Обоснование:**
- MVP не требует распределённой архитектуры
- Проще разработка и деплой
- Ниже операционные расходы
- Легче отладка
- Возможность разделения на микросервисы в будущем (если модули правильно изолированы)

**Модули:**
- `auth` — аутентификация и авторизация
- `vehicles` — управление автомобилями
- `orders` — управление заказами
- `clients` — управление клиентами
- `reviews` — отзывы
- `cases` — кейсы
- `media` — файловое хранилище
- `pages` — контентные страницы
- `settings` — настройки системы
- `notifications` — уведомления (Telegram)
- `financial` — финансовый движок

---

## 2. Frontend

### 2.1 Публичный сайт

**Фреймворк:** Next.js 14+ (App Router)

**Обоснование:**
- Server-Side Rendering (SSR) для SEO
- Static Site Generation (SSG) для статических страниц
- API Routes для backend-интеграции
- Image Optimization встроенный
- Большое комьюнити и экосистема
- TypeScript out of the box

**UI-библиотека:** React 18+

**Стилизация:** Tailwind CSS

**Обоснование:**
- Utility-first подход
- Быстрая разработка
- Хорошая производительность
- Встроенная респонсивность
- Легко кастомизировать

**Компоненты:** Radix UI + собственная обёртка

**Обоснование:**
- Accessibility из коробки
- Headless компоненты
- Полный контроль над стилями
- Не привязка к конкретной UI-библиотеке

**State Management:** React Context + React Query (TanStack Query)

**Обоснование:**
- React Query для серверного состояния (кэширование, синхронизация)
- Context для глобального UI-состояния
- Не требуется Redux для MVP

**Формы:** React Hook Form + Zod

**Обоснование:**
- Минимальные ререндеры
- Встроенная валидация
- TypeScript-типизация через Zod
- Хорошая производительность

**Routing:** Next.js App Router

**SEO:** Next.js Metadata API

**Язык:** TypeScript

### 2.2 Админ-панель

**Подход:** Отдельное приложение на Next.js или встроенное в основное (решение принять после оценки сложности)

**Рекомендация:** Начать с встроенного `/admin/*` маршрута, при необходимости вынести на отдельный домен.

**UI-библиотека:** Shadcn/ui (Radix UI + Tailwind)

**Обоснование:**
- Быстрая разработка админки
- Готовые компоненты (Tables, Forms, Modals)
- Accessibility
- Легко кастомизировать

**Дополнительные библиотеки:**
- `@tanstack/react-table` — таблицы с сортировкой/фильтрацией/пагинацией
- `react-dropzone` — загрузка файлов
- `react-beautiful-dnd` — drag-and-drop (для сортировки фото)

---

## 3. Backend

### 3.1 Фреймворк

**Вариант 1 (рекомендуемый):** Next.js API Routes + Prisma

**Обоснование:**
- Единый проект для frontend и backend
- Проще деплой
- Встроенная типизация (TypeScript)
- Prisma для работы с БД

**Вариант 2:** Node.js + Express/Fastify + Prisma

**Обоснование:**
- Полное разделение frontend и backend
- Больше гибкости
- Легче масштабировать backend отдельно

**Рекомендация:** Начать с Next.js API Routes (вариант 1), при необходимости вынести backend отдельно.

### 3.2 Язык

TypeScript

### 3.3 ORM

**Prisma**

**Обоснование:**
- Типизация из коробки
- Автоматическая генерация типов
- Миграции
- Prisma Studio для разработки
- Хорошая производительность
- Большое комьюнити

### 3.4 Валидация

**Zod**

**Обоснование:**
- TypeScript-first
- Единая схема валидации для frontend и backend
- Автоматическая генерация типов

### 3.5 Аутентификация

**NextAuth.js (Auth.js)** или **JWT вручную**

**Рекомендация:** JWT вручную для простоты (только админ-панель требует auth).

**Библиотеки:**
- `jsonwebtoken` — генерация и верификация JWT
- `bcrypt` — хеширование паролей

### 3.6 File Upload

**Библиотека:** `multer` (если Node.js/Express) или `formidable` (если Next.js API Routes)

**Хранилище:** см. раздел "Файловое хранилище"

---

## 4. База данных

### 4.1 Основная БД

**PostgreSQL**

**Обоснование:**
- Надёжность и стабильность
- Поддержка JSON (для гибких полей)
- Полнотекстовый поиск
- Большое комьюнити
- Бесплатные хостинг-опции (Supabase, Neon)

**Альтернатива:** MySQL/MariaDB (если есть инфраструктурные ограничения)

### 4.2 Миграции

**Prisma Migrate**

**Версионирование схемы БД в Git.**

### 4.3 Резервное копирование

**Автоматические бэкапы:**
- Ежедневные бэкапы БД
- Хранение минимум 7 дней
- Тестирование восстановления 1 раз в месяц

**Решение зависит от хостинга:**
- Supabase — встроенные бэкапы
- Собственный сервер — `pg_dump` + cron

---

## 5. Файловое хранилище

### 5.1 Хранилище

**Вариант 1 (рекомендуемый):** S3-совместимое хранилище

**Сервисы:**
- AWS S3
- Cloudflare R2 (без egress-платы)
- DigitalOcean Spaces
- Yandex Object Storage

**Обоснование:**
- Масштабируемость
- CDN интеграция
- Низкая стоимость
- Надёжность

**Вариант 2:** Локальное хранилище (только для разработки)

**Рекомендация:** Cloudflare R2 (бесплатный egress) или DigitalOcean Spaces.

### 5.2 CDN

**Cloudflare CDN** (бесплатный план)

**Обоснование:**
- Глобальная сеть
- Автоматическая оптимизация изображений
- Защита от DDoS
- Бесплатный SSL

### 5.3 Обработка изображений

**Sharp** (Node.js библиотека)

**Обоснование:**
- Быстрая обработка
- Автоматическое создание thumbnails
- Конвертация в WebP
- Оптимизация размера

**Форматы:**
- Оригинал (JPEG/PNG)
- Thumbnail (WebP, 300x200)
- Medium (WebP, 800x600)
- Large (WebP, 1920x1080)

---

## 6. Уведомления

### 6.1 Telegram Bot

**Библиотека:** `node-telegram-bot-api` или `telegraf`

**Функции:**
- Уведомления о новых заявках (обезличенные)
- Уведомления об изменении статусов заказов
- Внутренние команды для менеджеров (опционально)

**Критически важно:**

Не передавать персональные данные клиентов в Telegram.

**Пример уведомления:**

```
✅ Новая заявка #1234

Тип: Подбор автомобиля
Марка: Toyota
Бюджет: 3 000 000 ₽

🔗 Открыть в админке: https://admin.zakazavto.ru/orders/1234
```

### 6.2 Email (опционально, будущая функция)

**Библиотека:** `nodemailer`

**Сервисы:**
- SendGrid
- Mailgun
- AWS SES

**Функции:**
- Подтверждение заявки
- Обновления статуса заказа
- Отчёты о проверке автомобиля

---

## 7. Deployment

### 7.1 Хостинг

**Вариант 1 (рекомендуемый):** Vercel

**Обоснование:**
- Нативная поддержка Next.js
- Автоматический деплой из Git
- Serverless Functions
- Глобальный CDN
- Бесплатный SSL
- Preview deployments
- Бесплатный план для стартапов

**Вариант 2:** DigitalOcean App Platform / Railway / Render

**Обоснование:**
- Больше контроля
- Фиксированная цена
- Поддержка Node.js

**Вариант 3:** VPS (DigitalOcean Droplet / Hetzner)

**Обоснование:**
- Полный контроль
- Минимальная цена
- Требуется настройка (Docker, Nginx, SSL)

**Рекомендация для MVP:** Vercel (frontend + API Routes) + Supabase (PostgreSQL).

### 7.2 CI/CD

**GitHub Actions** или **GitLab CI**

**Pipeline:**
1. Lint (ESLint, Prettier)
2. Type check (TypeScript)
3. Tests (если есть)
4. Build
5. Deploy to staging
6. Deploy to production (manual approval)

### 7.3 Мониторинг

**Вариант 1:** Vercel Analytics (встроенный)

**Вариант 2:** Sentry (ошибки) + Plausible/Umami (аналитика)

**Метрики:**
- Ошибки (500, 404)
- Производительность API
- Время загрузки страниц
- Uptime

### 7.4 Логирование

**Winston** или **Pino**

**Уровни:**
- `error` — ошибки приложения
- `warn` — предупреждения
- `info` — информационные сообщения
- `debug` — отладочная информация

**Хранение логов:**
- Development: консоль
- Production: файлы + логирование в Sentry

---

## 8. Безопасность

### 8.1 HTTPS

**Обязательно** для production.

**Решение:**
- Vercel — автоматический SSL
- VPS — Let's Encrypt + Certbot

### 8.2 CORS

**Настройка:**
- Публичный сайт: `https://zakazavto.ru`
- Админ-панель: `https://admin.zakazavto.ru` (если отдельный домен)

### 8.3 Rate Limiting

**express-rate-limit** или встроенное решение хостинга

**Лимиты:**
- Публичные API: 100 requests/minute/IP
- Заявки: 5 requests/minute/IP
- Админ-панель: 1000 requests/minute/user

### 8.4 Защита от SQL-инъекций

**Prisma** — автоматически защищает (параметризованные запросы).

### 8.5 XSS Protection

**React** — автоматически экранирует вывод.

**Дополнительно:** Helmet.js для HTTP-заголовков.

### 8.6 CSRF Protection

**NextAuth.js** — встроенная защита.

**Если JWT вручную:** CSRF-токены для форм.

### 8.7 Секреты

**Environment variables** (`.env`)

**Не коммитить в Git.**

**Хранение:**
- Development: `.env.local`
- Production: Vercel Environment Variables / хостинг-панель

---

## 9. Инфраструктура (рекомендация для MVP)

```
Frontend + Backend:  Vercel (Next.js)
Database:            Supabase (PostgreSQL)
File Storage:        Cloudflare R2 or DigitalOcean Spaces
CDN:                 Cloudflare
Monitoring:          Vercel Analytics + Sentry
CI/CD:               GitHub Actions
Domain:              Cloudflare DNS
```

**Стоимость MVP:**
- Vercel: $0 (Hobby) или $20/месяц (Pro)
- Supabase: $0 (Free) или $25/месяц (Pro)
- Cloudflare R2: $0 (до 10 GB)
- Cloudflare CDN: $0
- Sentry: $0 (Developer)

**Итого:** $0–$50/месяц для старта.

---

## 10. Разработка

### 10.1 Окружения

- **Development** — локальная разработка
- **Staging** — тестовая среда (автодеплой из `develop` ветки)
- **Production** — боевая среда (автодеплой из `main` ветки)

### 10.2 Git Flow

**Ветки:**
- `main` — production
- `develop` — staging
- `feature/*` — новые функции
- `bugfix/*` — исправления

**Pull Requests обязательны.**

### 10.3 Code Style

**ESLint + Prettier**

**Конфигурация:**
- `eslint-config-next` (для Next.js)
- `eslint-plugin-react`
- `@typescript-eslint`

**Pre-commit hooks:** Husky + lint-staged

### 10.4 Testing (опционально для MVP)

**Unit Tests:** Jest + React Testing Library

**E2E Tests:** Playwright (будущая функция, после подключения MCP сервера)

**Рекомендация:** Начать без тестов, добавить после MVP.

---

## 11. Зависимости (ключевые)

### Frontend
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.0.0",
  "@radix-ui/react-*": "^1.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "@tanstack/react-query": "^5.0.0",
  "@tanstack/react-table": "^8.0.0"
}
```

### Backend
```json
{
  "@prisma/client": "^5.0.0",
  "prisma": "^5.0.0",
  "bcrypt": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "node-telegram-bot-api": "^0.64.0",
  "sharp": "^0.33.0",
  "winston": "^3.0.0",
  "zod": "^3.0.0"
}
```

---

## 12. Масштабирование (будущее)

### Когда потребуется масштабирование

- > 100 000 визитов/месяц
- > 1000 автомобилей в каталоге
- > 10 000 заказов
- Медленные запросы к БД

### Возможные решения

1. **Database:**
   - Индексы
   - Read Replicas (для чтения)
   - Connection Pooling (PgBouncer)

2. **Backend:**
   - Вынести API в отдельный сервис
   - Horizontal scaling (несколько инстансов)
   - Redis для кэширования

3. **File Storage:**
   - Увеличить CDN
   - Lazy loading изображений

4. **Frontend:**
   - ISR (Incremental Static Regeneration) для каталога
   - Edge Functions для персонализации

---

## 13. Альтернативные стеки (не рекомендуются для MVP)

### PHP (Laravel) + Vue.js
**Причина отказа:** Меньшая производительность, устаревшая архитектура, сложнее найти разработчиков.

### Python (Django/FastAPI) + React
**Причина отказа:** Python медленнее Node.js для реал-тайм, меньше интеграции с фронтендом.

### Ruby on Rails
**Причина отказа:** Меньше разработчиков, медленнее, не подходит для modern SPA.

---

## 14. Финальная рекомендация

```
Frontend:            Next.js 14+ (TypeScript)
Backend:             Next.js API Routes + Prisma
Database:            PostgreSQL (Supabase)
File Storage:        Cloudflare R2
CDN:                 Cloudflare
Deployment:          Vercel
Monitoring:          Vercel Analytics + Sentry
Notifications:       Telegram Bot (node-telegram-bot-api)
CI/CD:               GitHub Actions
```

**Этот стек обеспечивает:**
- Быструю разработку MVP
- Production-ready качество
- Низкую стоимость на старте
- Возможность масштабирования
- Хорошую производительность
- TypeScript типизацию end-to-end
- SEO-оптимизацию
- Безопасность

---

**Версия документа:** 1.0  
**Дата:** 22.08.2026  
**Статус:** Approved for implementation
