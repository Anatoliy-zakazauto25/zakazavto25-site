# CRM System — Auto Sales (Order-based)

CRM система для продажи автомобилей под заказ (B2C).

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- npm 10+
- (Опционально) Docker Desktop + WSL2 для PostgreSQL/Redis
- (Опционально) PostgreSQL 15+ для production режима

### Установка и запуск

```bash
# 1. Перейти в папку backend
cd apps/api

# 2. Установить зависимости
npm install

# 3. Настроить переменные окружения (уже создан .env)
# По умолчанию используется SQLite для тестового запуска

# 4. Сгенерировать Prisma Client
npx prisma generate

# 5. Запустить миграции
npx prisma migrate dev

# 6. Загрузить тестовые данные
npx prisma db seed

# 7. Запустить сервер
npm run start:dev
```

Сервер запустится на http://localhost:3001/api/v1

### Проверка работы

```bash
curl http://localhost:3001/api/v1/health
```

### Тестовые пользователи

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@crm.com | Admin123! |
| Manager | manager@crm.com | Manager123! |
| Sales Rep | rep@crm.com | Rep123! |

## 🗄️ База данных

### Тестовый режим (SQLite)
По умолчанию используется SQLite (`file:./dev.db`). Не требует установки PostgreSQL/Docker.

### Production режим (PostgreSQL)
1. Установить Docker Desktop + WSL2 или PostgreSQL
2. Запустить `docker-compose up -d`
3. Изменить `DATABASE_URL` в `.env` на PostgreSQL URL
4. Заменить `prisma/schema.prisma` на `prisma/schema.postgresql.prisma`
5. Перегенерировать Prisma Client и миграции

## 📁 Структура проекта

```
apps/
├── api/            # NestJS Backend
└── web/            # Next.js Frontend (будет реализован позже)
packages/
├── types/          # Shared TypeScript types
└── utils/          # Shared utilities
```

## 🛠️ Доступные команды

```bash
# Backend
npm run start:dev      # Запуск в режиме разработки
npm run build          # Сборка production
npm run start:prod     # Запуск production
npx prisma studio      # Prisma Studio (GUI для БД)
npx prisma migrate dev # Создать миграцию
npx prisma db seed     # Загрузить тестовые данные
```

## 📚 Документация

- `CRM_ARCHITECTURE.md` — архитектура системы
- `prisma-schema.prisma` — исходная схема PostgreSQL
- `API_SPECIFICATION.md` — REST API спецификация
- `RBAC_SECURITY.md` — модель безопасности и RBAC
- `PROMPTS_FOR_CODER.md` — промпты для AI-кодера

## ⚠️ Важные замечания

### SQLite ограничения
Тестовая SQLite схема имеет следующие отличия от production PostgreSQL:
- `Decimal` заменен на `Float`
- `String[]` заменен на `String?` (JSON-строка)
- Убраны PostgreSQL-специфичные индексы и `fullTextSearch`
- Для production используйте `schema.postgresql.prisma`

### Docker/WSL
На текущей машине Docker Desktop требует WSL2. Для production развертывания рекомендуется установить WSL2 и использовать Docker Compose с PostgreSQL + Redis.

## 📞 Поддержка

По вопросам обращайтесь к техническому заданию в корне проекта.
