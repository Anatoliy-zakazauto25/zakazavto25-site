# CRM СИСТЕМА — ПОЛНАЯ АРХИТЕКТУРА И ТЕХНИЧЕСКОЕ ЗАДАНИЕ

> **Дата:** 2026-09-21  
> **Версия:** 1.0  
> **Архитектор:** Principal System Architect

---

## EXECUTIVE SUMMARY

**Цель системы:** Полнофункциональная CRM-система для B2B отделов продаж с управлением лидами, сделками, воронкой продаж, автоматизацией задач и аналитикой.

**Целевая аудитория:**
- Менеджеры по продажам (Sales Reps)
- Руководители отделов продаж (Sales Managers)
- Администраторы системы (System Admins)
- Клиенты (Client Portal — опционально)

**Масштаб:**
- 50-500 пользователей на инстанс
- До 1M контактов/лидов
- До 500K активных сделок
- 99.9% uptime SLA

---

## 1. ТЕХНИЧЕСКИЙ СТЕК

### Frontend Stack
```
├── Next.js 14 (App Router)
├── React 18 + TypeScript 5.x
├── Tailwind CSS 3.x
├── Shadcn UI (Radix UI primitives)
├── React Query (TanStack Query)
├── Zustand (state management)
├── React Hook Form + Zod (validation)
├── Recharts / Chart.js (аналитика)
└── Socket.io-client (real-time)
```

### Backend Stack
```
├── Node.js 20.x LTS
├── NestJS 10.x + TypeScript
├── Prisma ORM
├── PostgreSQL 15+
├── Redis 7+ (cache + queue)
├── Bull (job queue)
├── Passport + JWT (auth)
├── Socket.io (WebSocket server)
├── Nodemailer / SendGrid (email)
└── Winston (logging)
```

### Infrastructure
```
├── Docker + Docker Compose
├── Nginx (reverse proxy)
├── PM2 (process manager)
├── AWS S3 / Minio (file storage)
└── GitHub Actions (CI/CD)
```

---

## 2. HIGH-LEVEL ARCHITECTURE

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Next.js App (SSR/CSR)  │  Mobile App (React Native)        │
│  - Dashboard             │  - On-the-go CRM                  │
│  - Kanban Board          │  - Quick Lead Entry               │
│  - Analytics             │  - Task Management                │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS / WebSocket
┌─────────────────▼───────────────────────────────────────────┐
│                   API GATEWAY / NGINX                        │
│  - Load Balancing                                            │
│  - Rate Limiting                                             │
│  - SSL Termination                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                 NESTJS BACKEND (Microservices)               │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Auth Module  │ Leads Module │ Deals Module │ Tasks Module   │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ Users/RBAC   │ Contacts     │ Pipeline     │ Notifications  │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ Analytics    │ Files Module │ Email Module │ Webhooks       │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐ ┌──────▼────────┐
│ PostgreSQL  │ │   Redis   │ │  AWS S3    │ │  Bull Queue   │
│  (Primary)  │ │  (Cache)  │ │  (Files)   │ │ (Background)  │
└─────────────┘ └───────────┘ └────────────┘ └───────────────┘
```

### Core Modules

1. **Auth & Users Module**
   - JWT-based authentication
   - Role-Based Access Control (RBAC)
   - Session management
   - Password reset / 2FA

2. **Leads Module**
   - Lead capture (web forms, API, import)
   - Lead scoring & qualification
   - Lead assignment rules
   - Lead status lifecycle

3. **Deals Module (Pipeline)**
   - Multi-stage pipeline (configurable)
   - Drag-and-drop Kanban board
   - Deal probability & forecasting
   - Win/Loss analysis

4. **Contacts & Companies**
   - Contact profiles (B2B/B2C)
   - Company hierarchies
   - Contact history & timeline
   - Duplicate detection

5. **Tasks & Activities**
   - Task management (TODO, Call, Email, Meeting)
   - Calendar integration
   - Reminders & notifications
   - Activity logging

6. **Analytics & Reporting**
   - Sales funnel analytics
   - Conversion rates
   - Team performance dashboards
   - Custom report builder

7. **Files & Documents**
   - File upload/download
   - Document versioning
   - Access control per file

8. **Notifications & Webhooks**
   - In-app notifications
   - Email notifications
   - Webhook integrations (Zapier, etc.)

---

## 3. МОДУЛЬНАЯ СТРУКТУРА ПРОЕКТА

```
crm-system/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── leads/
│   │   │   │   ├── deals/
│   │   │   │   ├── contacts/
│   │   │   │   ├── tasks/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── api/            # Next.js API Routes (proxy)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn components
│   │   │   ├── leads/
│   │   │   ├── deals/
│   │   │   ├── kanban/
│   │   │   └── charts/
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   └── api/                    # NestJS Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── guards/
│       │   │   │   ├── strategies/
│       │   │   │   └── dto/
│       │   │   ├── users/
│       │   │   ├── leads/
│       │   │   ├── deals/
│       │   │   ├── contacts/
│       │   │   ├── companies/
│       │   │   ├── tasks/
│       │   │   ├── activities/
│       │   │   ├── analytics/
│       │   │   ├── files/
│       │   │   └── notifications/
│       │   ├── common/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── interceptors/
│       │   │   └── pipes/
│       │   ├── config/
│       │   ├── prisma/
│       │   │   ├── schema.prisma
│       │   │   ├── migrations/
│       │   │   └── seed.ts
│       │   ├── main.ts
│       │   └── app.module.ts
│       ├── test/
│       └── package.json
│
├── packages/
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utilities
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. СУЩНОСТИ И СВЯЗИ (Entity Relationship)

### Core Entities

```
User (Пользователь системы)
  ↓ 1:N
Lead (Лид — потенциальный клиент)
  ↓ 1:1 (конвертация)
Contact (Контакт — реальный клиент)
  ↓ N:1
Company (Компания)
  ↓ 1:N
Deal (Сделка)
  ↓ N:1
Pipeline Stage (Этап воронки)
  ↓ 1:N
Task / Activity (Задачи и активности)
```

### Relationships Matrix

| Entity       | Related To      | Relationship | Description                     |
|--------------|-----------------|--------------|----------------------------------|
| User         | Lead            | 1:N          | Менеджер владеет лидами         |
| User         | Deal            | 1:N          | Менеджер владеет сделками       |
| User         | Task            | 1:N          | Пользователь создает задачи     |
| Lead         | Contact         | 1:1          | Лид конвертируется в контакт    |
| Contact      | Company         | N:1          | Контакт работает в компании     |
| Contact      | Deal            | N:M          | Контакт участвует в сделках     |
| Deal         | PipelineStage   | N:1          | Сделка в определенном этапе     |
| Deal         | Task            | 1:N          | У сделки есть задачи            |
| Company      | Deal            | 1:N          | У компании много сделок         |
| User         | Team            | N:M          | Пользователи в командах         |

---

