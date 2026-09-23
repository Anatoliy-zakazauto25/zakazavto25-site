# First Tasks for Coding AI — ЗаказАвто

## Назначение документа

Список первых исполнимых задач для AI, которая будет писать код. Задачи декомпозированы и готовы к выполнению.

---

## TASK-001: Setup Project Foundation

**Приоритет:** Критический  
**Зависимости:** Нет  
**Оценка:** 2-3 часа

### Цель
Создать базовую структуру Next.js проекта с TypeScript, Tailwind CSS и необходимыми зависимостями.

### Что сделать

1. **Инициализировать Next.js проект:**
   ```bash
   npx create-next-app@latest zakazavto --typescript --tailwind --app --src-dir --import-alias "@/*"
   ```

2. **Установить дополнительные зависимости:**
   ```bash
   npm install @prisma/client prisma
   npm install @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-toast
   npm install react-hook-form zod @hookform/resolvers
   npm install @tanstack/react-query
   npm install bcrypt jsonwebtoken
   npm install sharp
   npm install -D @types/bcrypt @types/jsonwebtoken
   npm install -D eslint-config-prettier prettier
   ```

3. **Создать структуру папок:**
   ```
   src/
   ├── app/
   │   ├── (public)/          # Публичный сайт
   │   ├── (admin)/           # Админ-панель
   │   └── api/               # API Routes
   ├── components/
   │   ├── ui/                # UI компоненты (Radix)
   │   ├── layout/            # Layout компоненты
   │   └── features/          # Feature-специфичные компоненты
   ├── lib/
   │   ├── prisma.ts          # Prisma client
   │   ├── auth.ts            # Auth utilities
   │   └── utils.ts           # Общие утилиты
   ├── types/
   │   └── index.ts           # TypeScript типы
   └── styles/
       └── globals.css        # Глобальные стили
   
   prisma/
   ├── schema.prisma          # Prisma schema
   └── seed.ts                # Seed данные
   ```

4. **Настроить ESLint + Prettier:**
   - Создать `.prettierrc`
   - Обновить `.eslintrc.json`

5. **Настроить environment variables:**
   - Создать `.env.example`
   - Создать `.env.local` (не коммитить)

6. **Создать `README.md` с инструкциями по запуску**

### Acceptance Criteria

- [x] Next.js проект создан и запускается (`npm run dev`)
- [x] TypeScript настроен без ошибок
- [x] Tailwind CSS работает
- [x] Структура папок создана
- [x] Зависимости установлены
- [x] ESLint + Prettier настроены
- [x] `.env.example` создан
- [x] README.md содержит инструкции по запуску

### Negative Criteria

- ❌ Не устанавливать ненужные зависимости
- ❌ Не коммитить `.env.local`
- ❌ Не использовать Pages Router (только App Router)

### Test Steps

1. `npm run dev` — проект запускается без ошибок
2. `npm run build` — проект собирается без ошибок
3. `npm run lint` — нет ошибок линтера
4. Открыть http://localhost:3000 — видна дефолтная страница Next.js

---

## TASK-002: Setup Prisma & Database Schema

**Приоритет:** Критический  
**Зависимости:** TASK-001  
**Оценка:** 3-4 часа

### Цель
Настроить Prisma и создать базовую схему БД на основе DATA_MODEL.md.

### Что сделать

1. **Инициализировать Prisma:**
   ```bash
   npx prisma init
   ```

2. **Настроить `prisma/schema.prisma`:**
   
   Создать модели:
   - User
   - Vehicle
   - VehicleInspection
   - Order
   - OrderTimeline
   - Client
   - Review
   - Case
   - Media
   - Settings
   - Page

   **Использовать UUID для всех ID:**
   ```prisma
   id String @id @default(uuid())
   ```

3. **Создать Prisma Client singleton:**
   
   `src/lib/prisma.ts`:
   ```typescript
   import { Prisma

Client } from '@prisma/client'
   
   const globalForPrisma = global as unknown as { prisma: PrismaClient }
   
   export const prisma =
     globalForPrisma.prisma ||
     new PrismaClient({
       log: ['query'],
     })
   
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

4. **Создать seed файл** `prisma/seed.ts` с тестовыми данными:
   - 1 Admin user (email: admin@zakazavto.ru, password: admin123)
   - Settings (defaultCommission: 50000, курсы валют)
   - 3-5 тестовых автомобилей
   - 2-3 тестовых отзыва

5. **Настроить database URL:**
   
   `.env.local`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/zakazavto?schema=public"
   ```

6. **Запустить миграции:**
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

### Acceptance Criteria

- [x] `prisma/schema.prisma` содержит все модели из DATA_MODEL.md
- [x] Все ID — UUID
- [x] Миграции применены успешно
- [x] Seed данные загружены
- [x] Prisma Studio открывается (`npx prisma studio`)
- [x] В БД есть тестовые данные

### Negative Criteria

- ❌ Не использовать auto-increment ID
- ❌ Не хранить пароли в открытом виде (использовать bcrypt)
- ❌ Не создавать избыточные связи

### Test Steps

1. `npx prisma studio` — открывается Prisma Studio
2. Проверить наличие таблиц в БД
3. Проверить наличие seed-данных
4. Проверить, что пароль admin хеширован (bcrypt)

---

## TASK-003: Setup Authentication (Admin)

**Приоритет:** Критический  
**Зависимости:** TASK-002  
**Оценка:** 4-5 часов

### Цель
Реализовать JWT-аутентификацию для админ-панели.

### Что сделать

1. **Создать auth utilities** `src/lib/auth.ts`:
   - `hashPassword(password: string): Promise<string>` — bcrypt
   - `verifyPassword(password: string, hash: string): Promise<boolean>`
   - `generateToken(userId: string, expiresIn: string): string` — JWT
   - `verifyToken(token: string): { userId: string } | null`

2. **Создать API endpoint для login:**
   
   `src/app/api/auth/login/route.ts`:
   ```typescript
   POST /api/auth/login
   Body: { email: string, password: string }
   Response: { token: string, user: { id, email, name, role } }
   ```

3. **Создать API endpoint для logout:**
   
   `src/app/api/auth/logout/route.ts`:
   ```typescript
   POST /api/auth/logout
   Response: 204 No Content
   ```

4. **Создать middleware для защиты admin routes:**
   
   `src/lib/middleware/auth.ts`:
   - Проверка JWT токена из заголовка Authorization
   - Возврат 401 если токен невалиден

5. **Создать Login страницу:**
   
   `src/app/(admin)/login/page.tsx`:
   - Форма с email и password
   - Валидация через react-hook-form + zod
   - Отправка на `/api/auth/login`
   - Сохранение токена в localStorage
   - Редирект на `/admin` после успешного логина

6. **Создать auth context:**
   
   `src/lib/context/auth-context.tsx`:
   - Хранение текущего пользователя
   - Функции login/logout
   - Проверка авторизации

### Security

- Пароли хешируются через bcrypt (cost 10)
- JWT токены: Access token (1 час)
- Токен передаётся в заголовке `Authorization: Bearer <token>`
- Rate limiting: 5 попыток входа в 15 минут

### Acceptance Criteria

- [x] `/api/auth/login` работает корректно
- [x] Пароли хешируются через bcrypt
- [x] JWT токены генерируются корректно
- [x] Login страница работает
- [x] Токен сохраняется в localStorage
- [x] Middleware защищает admin routes
- [x] Logout очищает токен

### Negative Criteria

- ❌ Не хранить пароли в открытом виде
- ❌ Не использовать слабые токены
- ❌ Не пропускать неавторизованные запросы в admin API

### Test Steps

1. Открыть `/login`
2. Ввести `admin@zakazavto.ru` / `admin123`
3. Нажать "Войти"
4. Проверить редирект на `/admin`
5. Проверить наличие токена в localStorage
6. Обновить страницу — пользователь остаётся залогинен
7. Нажать "Выйти" — токен удалён, редирект на `/login`
8. Попробовать открыть `/admin` без токена — редирект на `/login`

---

## TASK-004: Create Admin Layout

**Приоритет:** Высокий  
**Зависимости:** TASK-003  
**Оценка:** 3-4 часа

### Цель
Создать базовый layout для админ-панели с навигацией.

### Что сделать

1. **Создать Admin Layout:**
   
   `src/app/(admin)/layout.tsx`:
   - Проверка авторизации (если нет токена → редирект на `/login`)
   - Header с логотипом и user menu
   - Sidebar с навигацией
   - Главная область контента

2. **Создать компоненты:**
   
   `src/components/layout/admin/AdminHeader.tsx`:
   - Логотип "ЗаказАвто Админ"
   - User menu (имя пользователя, logout)
   
   `src/components/layout/admin/AdminSidebar.tsx`:
   - Навигация:
     - Dashboard (будущее)
     - Автомобили
     - Заказы
     - Клиенты
     - Отзывы
     - Кейсы
     - Страницы
     - Настройки

3. **Стилизация:**
   - Использовать Tailwind CSS
   - Цвета из DESIGN_SYSTEM.md
   - Responsive: sidebar сворачивается на mobile

4. **Создать placeholder страницу `/admin`:**
   
   `src/app/(admin)/admin/page.tsx`:
   - Заголовок "Админ-панель"
   - Статистика (placeholder)

### Acceptance Criteria

- [x] Admin layout отображается корректно
- [x] Header содержит логотип и user menu
- [x] Sidebar содержит навигацию
- [x] Навигация работает (переход между разделами)
- [x] Logout работает
- [x] Неавторизованный пользователь редиректится на `/login`
- [x] Responsive на mobile

### Negative Criteria

- ❌ Не делать сложный dashboard в этой задаче (только layout)
- ❌ Не добавлять лишние разделы навигации

### Test Steps

1. Залогиниться как admin
2. Открыть `/admin`
3. Проверить отображение header и sidebar
4. Кликнуть по пунктам навигации — переход работает (даже если страницы пустые)
5. Кликнуть Logout — редирект на `/login`
6. Открыть на mobile — sidebar сворачивается

---

## TASK-005: Create Settings Management

**Приоритет:** Высокий  
**Зависимости:** TASK-004  
**Оценка:** 4-5 часов

### Цель
Реализовать управление настройками (курсы валют, комиссия, контакты).

### Что сделать

1. **Создать API endpoints:**
   
   `src/app/api/admin/settings/route.ts`:
   ```typescript
   GET /api/admin/settings
   Authorization: Bearer <token>
   Response: Settings
   
   PATCH /api/admin/settings
   Authorization: Bearer <token>
   Body: Partial<Settings>
   Response: Settings
   ```

2. **Создать страницу настроек:**
   
   `src/app/(admin)/admin/settings/page.tsx`:
   - Форма редактирования настроек
   - Разделы:
     - Финансы (комиссия, курсы валют JPY/KRW/CNY)
     - Контакты (телефон, email, Telegram, адрес)
     - Telegram Bot (токен, chat ID) — опционально

3. **Форма:**
   - react-hook-form + zod валидация
   - Кнопка "Сохранить"
   - Toast-уведомление об успешном сохранении

4. **Валидация:**
   - Комиссия >= 0
   - Курсы валют > 0
   - Email валидный формат (если указан)
   - Телефон валидный формат (если указан)

### Acceptance Criteria

- [x] GET /api/admin/settings возвращает настройки
- [x] PATCH /api/admin/settings обновляет настройки
- [x] Страница настроек отображается
- [x] Форма валидируется корректно
- [x] Изменения сохраняются в БД
- [x] Toast-уведомление показывается после сохранения
- [x] Middleware защищает endpoints (требуется auth)

### Negative Criteria

- ❌ Не позволять отрицательные значения для комиссии и курсов
- ❌ Не сохранять невалидные данные

### Test Steps

1. Залогиниться как admin
2. Открыть `/admin/settings`
3. Изменить комиссию на 55000
4. Изменить курс JPY на 0.62
5. Нажать "Сохранить"
6. Проверить toast-уведомление
7. Обновить страницу — изменения сохранены
8. Попробовать ввести отрицательный курс — валидация не пропускает

---

## Следующие задачи (после TASK-005)

После выполнения первых 5 задач coding AI должна продолжить с:

- TASK-006: Create Vehicle CRUD (Admin)
- TASK-007: Implement Financial Engine
- TASK-008: Create Public Homepage Layout
- И т.д. согласно ROADMAP.md

---

## Как выполнять задачи

### Для coding AI:

1. **Читать документацию** перед началом задачи:
   - DATA_MODEL.md — для структуры данных
   - API_SPEC.md — для API endpoints
   - DESIGN_SYSTEM.md — для стилизации
   - TECH_STACK.md — для технологий
   - SECURITY.md — для безопасности

2. **Не придумывать** данные компании:
   - Использовать placeholders: `PLACEHOLDER_PHONE`, `CONTENT_REQUIRED`
   - Не использовать случайные стоковые фотографии

3. **Следовать DECISIONS.md:**
   - UUID для ID
   - Mobile-first
   - Обезличивание данных в Telegram
   - И т.д.

4. **Проверять OPEN_QUESTIONS.md:**
   - Если вопрос блокирует — запросить решение
   - Если есть временное решение — использовать его

5. **Фиксировать TODO:**
   ```typescript
   // TODO: [OPEN_QUESTION КВ-001] Заменить на реальный телефон
   const COMPANY_PHONE = 'PLACEHOLDER_PHONE';
   ```

6. **Тестировать** каждую задачу согласно Test Steps.

7. **Коммитить** после завершения задачи:
   ```bash
   git add .
   git commit -m "TASK-001: Setup Project Foundation"
   ```

---

**Версия документа:** 1.0  
**Дата:** 22.08.2026  
**Статус:** Ready for implementation
