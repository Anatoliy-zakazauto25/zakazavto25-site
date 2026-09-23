# CRM SYSTEM — REST API SPECIFICATION

> **Version:** 1.0  
> **Base URL:** `https://api.crm-system.com/v1`  
> **Authentication:** JWT Bearer Token  
> **Content-Type:** `application/json`

---

## AUTHENTICATION & AUTHORIZATION

### POST `/auth/register`
**Description:** Регистрация нового пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongP@ss123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid_xyz",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "SALES_REP",
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
- `firstName`, `lastName`: Required, 2-50 chars
- `phone`: Optional, valid phone format

**Error 400:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists",
    "details": [
      {
        "field": "email",
        "message": "This email is already registered"
      }
    ]
  }
}
```

---

### POST `/auth/login`
**Description:** Вход в систему

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongP@ss123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid_xyz",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "SALES_REP",
      "avatar": "https://cdn.example.com/avatars/user.jpg"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 3600
    }
  }
}
```

**Error 401:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

---

### POST `/auth/refresh`
**Description:** Обновление access token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

### POST `/auth/logout`
**Description:** Выход из системы (инвалидация токена)

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## LEADS MODULE

### GET `/leads`
**Description:** Получить список лидов с фильтрацией и пагинацией

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `status` (enum: NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED, LOST)
- `source` (enum: WEBSITE, REFERRAL, COLD_CALL, etc.)
- `ownerId` (string)
- `search` (string) — full-text search by name, email, company
- `sortBy` (string: createdAt, updatedAt, score) — default: createdAt
- `sortOrder` (enum: asc, desc) — default: desc

**Response 200:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "lead_123",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@company.com",
        "phone": "+1234567890",
        "company": "Tech Corp",
        "jobTitle": "CTO",
        "status": "NEW",
        "source": "WEBSITE",
        "score": 75,
        "owner": {
          "id": "user_456",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "https://cdn.example.com/avatars/john.jpg"
        },
        "createdAt": "2026-09-20T10:00:00Z",
        "updatedAt": "2026-09-21T08:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET `/leads/:id`
**Description:** Получить детальную информацию о лиде

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "lead_123",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@company.com",
    "phone": "+1234567890",
    "company": "Tech Corp",
    "jobTitle": "CTO",
    "website": "https://techcorp.com",
    "status": "QUALIFIED",
    "source": "WEBSITE",
    "score": 85,
    "notes": "Very interested in enterprise plan",
    "metadata": {
      "utm_source": "google",
      "utm_campaign": "enterprise_2026"
    },
    "owner": {
      "id": "user_456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@crm.com",
      "avatar": "https://cdn.example.com/avatars/john.jpg"
    },
    "tasks": [
      {
        "id": "task_789",
        "title": "Follow-up call",
        "type": "CALL",
        "status": "TODO",
        "priority": "HIGH",
        "dueDate": "2026-09-22T14:00:00Z"
      }
    ],
    "activities": [
      {
        "id": "activity_101",
        "type": "NOTE",
        "title": "Initial contact made",
        "description": "Discussed pricing and features",
        "createdAt": "2026-09-21T09:00:00Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "createdAt": "2026-09-20T10:00:00Z",
    "updatedAt": "2026-09-21T09:00:00Z"
  }
}
```

**Error 404:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Lead not found"
  }
}
```

---

### POST `/leads`
**Description:** Создать нового лида

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "jobTitle": "CTO",
  "website": "https://techcorp.com",
  "source": "WEBSITE",
  "notes": "Interested in enterprise plan",
  "ownerId": "user_456"
}
```

**Validation Rules:**
- `firstName`: Required, 2-50 chars
- `lastName`: Required, 2-50 chars
- `email`: Optional, valid email, unique among active leads
- `phone`: Optional, valid phone
- `source`: Required, valid enum value
- `ownerId`: Optional, valid user ID

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "lead_124",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@company.com",
    "status": "NEW",
    "score": 0,
    "createdAt": "2026-09-21T10:00:00Z"
  }
}
```

---

### PATCH `/leads/:id`
**Description:** Обновить информацию о лиде

**Headers:** `Authorization: Bearer {token}`

**Request Body (все поля опциональны):**
```json
{
  "firstName": "Jane",
  "status": "QUALIFIED",
  "score": 85,
  "ownerId": "user_789",
  "notes": "Updated notes"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "lead_123",
    "firstName": "Jane",
    "status": "QUALIFIED",
    "score": 85,
    "updatedAt": "2026-09-21T11:00:00Z"
  }
}
```

---

### POST `/leads/:id/convert`
**Description:** Конвертировать лид в контакт и создать сделку

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "createDeal": true,
  "dealData": {
    "title": "Enterprise Plan for Tech Corp",
    "amount": 50000,
    "currency": "USD",
    "pipelineId": "pipeline_1",
    "stageId": "stage_1",
    "expectedCloseDate": "2026-12-31"
  },
  "createCompany": true,
  "companyData": {
    "name": "Tech Corp",
    "website": "https://techcorp.com",
    "industry": "Technology"
  }
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "contact": {
      "id": "contact_456",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@company.com"
    },
    "company": {
      "id": "company_789",
      "name": "Tech Corp"
    },
    "deal": {
      "id": "deal_101",
      "title": "Enterprise Plan for Tech Corp",
      "amount": 50000,
      "status": "OPEN"
    }
  }
}
```

---

### DELETE `/leads/:id`
**Description:** Удалить лид

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

**Permission:** Only ADMIN or lead owner can delete

---

## DEALS MODULE

### GET `/deals`
**Description:** Получить список сделок

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (number)
- `limit` (number)
- `status` (enum: OPEN, WON, LOST, ABANDONED)
- `stageId` (string)
- `pipelineId` (string)
- `ownerId` (string)
- `companyId` (string)
- `minAmount` (number)
- `maxAmount` (number)
- `search` (string)
- `sortBy` (string: createdAt, amount, expectedCloseDate)
- `sortOrder` (enum: asc, desc)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "deals": [
      {
        "id": "deal_101",
        "title": "Enterprise Plan for Tech Corp",
        "amount": 50000,
        "currency": "USD",
        "status": "OPEN",
        "probability": 60,
        "stage": {
          "id": "stage_2",
          "name": "Proposal Sent",
          "probability": 60
        },
        "pipeline": {
          "id": "pipeline_1",
          "name": "Sales Pipeline"
        },
        "company": {
          "id": "company_789",
          "name": "Tech Corp"
        },
        "owner": {
          "id": "user_456",
          "firstName": "John",
          "lastName": "Doe",
          "avatar": "https://cdn.example.com/avatars/john.jpg"
        },
        "expectedCloseDate": "2026-12-31",
        "createdAt": "2026-09-21T10:00:00Z",
        "updatedAt": "2026-09-21T11:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 85,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET `/deals/:id`
**Description:** Получить детальную информацию о сделке

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "deal_101",
    "title": "Enterprise Plan for Tech Corp",
    "description": "Annual subscription for 500 users",
    "amount": 50000,
    "currency": "USD",
    "status": "OPEN",
    "probability": 60,
    "stage": {
      "id": "stage_2",
      "name": "Proposal Sent",
      "probability": 60,
      "order": 2
    },
    "pipeline": {
      "id": "pipeline_1",
      "name": "Sales Pipeline"
    },
    "company": {
      "id": "company_789",
      "name": "Tech Corp",
      "website": "https://techcorp.com"
    },
    "contacts": [
      {
        "id": "contact_456",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@company.com",
        "jobTitle": "CTO",
        "role": "decision_maker",
        "isPrimary": true
      }
    ],
    "owner": {
      "id": "user_456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@crm.com",
      "avatar": "https://cdn.example.com/avatars/john.jpg"
    },
    "tasks": [
      {
        "id": "task_201",
        "title": "Send contract",
        "type": "EMAIL",
        "status": "TODO",
        "priority": "HIGH",
        "dueDate": "2026-09-23T12:00:00Z"
      }
    ],
    "activities": [
      {
        "id": "activity_301",
        "type": "DEAL_UPDATED",
        "title": "Stage changed",
        "description": "Moved to Proposal Sent",
        "createdAt": "2026-09-21T11:30:00Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ],
    "files": [
      {
        "id": "file_401",
        "filename": "proposal.pdf",
        "originalName": "Enterprise Proposal.pdf",
        "mimeType": "application/pdf",
        "size": 1048576,
        "url": "https://cdn.example.com/files/proposal.pdf",
        "createdAt": "2026-09-21T10:30:00Z"
      }
    ],
    "expectedCloseDate": "2026-12-31",
    "createdAt": "2026-09-21T10:00:00Z",
    "updatedAt": "2026-09-21T11:30:00Z"
  }
}
```

---

### POST `/deals`
**Description:** Создать новую сделку

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Enterprise Plan for Tech Corp",
  "description": "Annual subscription for 500 users",
  "amount": 50000,
  "currency": "USD",
  "pipelineId": "pipeline_1",
  "stageId": "stage_1",
  "companyId": "company_789",
  "contactIds": ["contact_456"],
  "expectedCloseDate": "2026-12-31",
  "probability": 30
}
```

**Validation Rules:**
- `title`: Required, 3-200 chars
- `amount`: Required, positive number
- `currency`: Required, valid ISO 4217 code
- `pipelineId`: Required, valid pipeline ID
- `stageId`: Required, valid stage ID (must belong to pipeline)
- `expectedCloseDate`: Optional, future date

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "deal_102",
    "title": "Enterprise Plan for Tech Corp",
    "amount": 50000,
    "status": "OPEN",
    "createdAt": "2026-09-21T12:00:00Z"
  }
}
```

---

### PATCH `/deals/:id`
**Description:** Обновить сделку

**Headers:** `Authorization: Bearer {token}`

**Request Body (все поля опциональны):**
```json
{
  "title": "Updated title",
  "amount": 55000,
  "stageId": "stage_3",
  "probability": 75,
  "expectedCloseDate": "2026-11-30"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "deal_101",
    "title": "Updated title",
    "amount": 55000,
    "probability": 75,
    "updatedAt": "2026-09-21T13:00:00Z"
  }
}
```

---

### POST `/deals/:id/win`
**Description:** Пометить сделку как выигранную

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "actualCloseDate": "2026-09-21",
  "notes": "Client signed the contract"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "deal_101",
    "status": "WON",
    "actualCloseDate": "2026-09-21T00:00:00Z"
  }
}
```

---

### POST `/deals/:id/lose`
**Description:** Пометить сделку как проигранную

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "lossReason": "Chose competitor",
  "actualCloseDate": "2026-09-21"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "deal_101",
    "status": "LOST",
    "lossReason": "Chose competitor",
    "actualCloseDate": "2026-09-21T00:00:00Z"
  }
}
```

---

## CONTACTS MODULE

### GET `/contacts`
**Description:** Получить список контактов

**Query Parameters:**
- `page`, `limit`, `search`, `sortBy`, `sortOrder`
- `companyId` (string)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "contact_456",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@company.com",
        "phone": "+1234567890",
        "jobTitle": "CTO",
        "company": {
          "id": "company_789",
          "name": "Tech Corp"
        },
        "createdAt": "2026-09-21T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST `/contacts`
**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "phone": "+1234567890",
  "mobile": "+0987654321",
  "jobTitle": "CTO",
  "companyId": "company_789",
  "linkedinUrl": "https://linkedin.com/in/janesmith"
}
```

---

## TASKS MODULE

### GET `/tasks`
**Query Parameters:**
- `page`, `limit`
- `status` (TODO, IN_PROGRESS, DONE, CANCELLED)
- `priority` (LOW, MEDIUM, HIGH, URGENT)
- `type` (CALL, EMAIL, MEETING, TODO, FOLLOW_UP)
- `assigneeId` (string)
- `leadId`, `dealId`, `contactId` (string)
- `dueDateFrom`, `dueDateTo` (ISO date)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "task_201",
        "title": "Follow-up call",
        "description": "Discuss pricing options",
        "type": "CALL",
        "status": "TODO",
        "priority": "HIGH",
        "assignee": {
          "id": "user_456",
          "firstName": "John",
          "lastName": "Doe"
        },
        "deal": {
          "id": "deal_101",
          "title": "Enterprise Plan"
        },
        "dueDate": "2026-09-22T14:00:00Z",
        "createdAt": "2026-09-21T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST `/tasks`
**Request Body:**
```json
{
  "title": "Follow-up call",
  "description": "Discuss pricing",
  "type": "CALL",
  "priority": "HIGH",
  "assigneeId": "user_456",
  "dealId": "deal_101",
  "dueDate": "2026-09-22T14:00:00Z"
}
```

---

## ANALYTICS MODULE

### GET `/analytics/dashboard`
**Description:** Получить основные метрики дашборда

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `period` (enum: today, week, month, quarter, year)
- `startDate`, `endDate` (ISO date)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 1250000,
      "won": 850000,
      "pipeline": 400000,
      "change": 15.5
    },
    "deals": {
      "total": 125,
      "open": 45,
      "won": 32,
      "lost": 18,
      "winRate": 64.0,
      "avgDealSize": 26562.50
    },
    "leads": {
      "total": 450,
      "new": 89,
      "qualified": 156,
      "converted": 45,
      "conversionRate": 10.0
    },
    "activities": {
      "calls": 234,
      "meetings": 89,
      "emails": 456
    }
  }
}
```

---

### GET `/analytics/funnel`
**Description:** Статистика по воронке продаж

**Response 200:**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "id": "stage_1",
        "name": "Qualification",
        "dealsCount": 45,
        "totalAmount": 2250000,
        "avgDealSize": 50000,
        "conversionRate": 75.0
      },
      {
        "id": "stage_2",
        "name": "Proposal",
        "dealsCount": 34,
        "totalAmount": 1700000,
        "avgDealSize": 50000,
        "conversionRate": 65.0
      }
    ]
  }
}
```

---

## ERROR CODES

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Ошибка валидации входных данных |
| `UNAUTHORIZED` | 401 | Не авторизован |
| `FORBIDDEN` | 403 | Недостаточно прав доступа |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `CONFLICT` | 409 | Конфликт данных (duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Превышен лимит запросов |
| `INTERNAL_ERROR` | 500 | Внутренняя ошибка сервера |

---

## RATE LIMITING

- Authenticated requests: 1000 requests/hour per user
- Unauthenticated requests: 100 requests/hour per IP
- Response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## PAGINATION

All list endpoints support pagination:
- Default `limit`: 20
- Max `limit`: 100
- Response includes `pagination` object with meta information

---

## FILTERING & SEARCH

- Full-text search via `search` query parameter
- Field-specific filters via query parameters
- Multiple filters combined with AND logic

---

## SORTING

- `sortBy`: Field name
- `sortOrder`: `asc` or `desc`
- Default sort: `createdAt desc`
