# API Specification — ЗаказАвто

## Назначение документа

Описание REST API для взаимодействия между frontend и backend системы ЗаказАвто.

---

## 1. Общие принципы

1. **REST API** с JSON-форматом данных
2. **Версионирование** через префикс `/api/v1`
3. **Аутентификация** через JWT для админ-панели
4. **Публичные эндпоинты** не требуют авторизации
5. **Rate limiting** для защиты от злоупотреблений
6. **CORS** настроен для публичного сайта и админ-панели
7. **Пагинация** для списков (limit/offset или cursor-based)
8. **Фильтрация** через query parameters
9. **Сортировка** через query parameter `sort`
10. **Ошибки** в стандартном формате

---

## 2. Базовый URL

```
Production:  https://api.zakazavto.ru/api/v1
Development: http://localhost:3000/api/v1
```

---

## 3. Аутентификация

### 3.1 Публичные эндпоинты

Не требуют авторизации:
- `GET /vehicles` (публичный каталог)
- `GET /vehicles/:slug`
- `GET /reviews`
- `GET /cases`
- `GET /pages/:slug`
- `POST /leads` (заявки)
- `GET /orders/track/:token` (отслеживание заказа)

### 3.2 Защищённые эндпоинты (админ-панель)

Требуют JWT-токен в заголовке:

```
Authorization: Bearer <JWT_TOKEN>
```

**Логин:**

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@zakazavto.ru",
  "password": "password"
}

Response 200:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@zakazavto.ru",
    "name": "Admin",
    "role": "admin"
  }
}
```

**Обновление токена:**

```http
POST /auth/refresh
Authorization: Bearer <JWT_TOKEN>

Response 200:
{
  "token": "new_token"
}
```

**Логаут:**

```http
POST /auth/logout
Authorization: Bearer <JWT_TOKEN>

Response 204: No Content
```

---

## 4. Формат ответов

### 4.1 Успешный ответ

```json
{
  "success": true,
  "data": { ... }
}
```

### 4.2 Список с пагинацией

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8
  }
}
```

### 4.3 Ошибка

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 4.4 Коды ошибок

```
400 Bad Request          — неверные данные
401 Unauthorized         — не авторизован
403 Forbidden            — нет прав доступа
404 Not Found            — ресурс не найден
409 Conflict             — конфликт данных (например, дубликат)
422 Unprocessable Entity — ошибка валидации
429 Too Many Requests    — превышен rate limit
500 Internal Server Error — внутренняя ошибка сервера
```

---

## 5. Публичные эндпоинты

### 5.1 Каталог автомобилей

**Получить список автомобилей**

```http
GET /vehicles?page=1&limit=20&make=Toyota&country=japan&status=available&sort=-year

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "mileage": 50000,
      "country": "japan",
      "transmission": "automatic",
      "fuel": "petrol",
      "power": 150,
      "bodyType": "sedan",
      "status": "available",
      "photos": [
        { "id": "uuid", "url": "https://...", "thumbnailUrl": "https://..." }
      ],
      "publicPrice": 2500000,
      "slug": "toyota-camry-2020-abc123"
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "perPage": 20,
    "totalPages": 3
  }
}
```

**Query parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `make` (string)
- `model` (string)
- `country` (japan | korea | china)
- `yearFrom` (number)
- `yearTo` (number)
- `priceFrom` (number)
- `priceTo` (number)
- `status` (available | reserved | sold)
- `fuel` (petrol | diesel | hybrid | electric)
- `transmission` (manual | automatic | cvt | robot)
- `sort` (year | -year | price | -price | mileage | -mileage)

**Получить автомобиль по slug**

```http
GET /vehicles/:slug

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    "generation": "XV70",
    "year": 2020,
    "country": "japan",
    "mileage": 50000,
    "engine": "2.5L",
    "engineVolume": 2500,
    "power": 181,
    "transmission": "automatic",
    "drivetrain": "fwd",
    "fuel": "petrol",
    "bodyType": "sedan",
    "color": "White",
    "trim": "Premium",
    "features": ["Leather seats", "Navigation", "Sunroof"],
    "status": "available",
    "description": "Отличное состояние, полная комплектация...",
    "showPricePublic": true,
    "publicPrice": 2500000,
    "photos": [...],
    "videos": [...],
    "inspection": {
      "overallCondition": "excellent",
      "recommendation": "approved",
      "inspectionDate": "2026-08-15T10:00:00Z",
      "specialistComment": "Автомобиль в отличном состоянии...",
      "body": { "condition": "excellent", "notes": "..." },
      "engine": { "condition": "good", "notes": "..." },
      "isPublic": true
    },
    "viewCount": 245,
    "slug": "toyota-camry-2020-abc123",
    "createdAt": "2026-08-01T12:00:00Z"
  }
}
```

### 5.2 Отзывы

**Получить список отзывов**

```http
GET /reviews?page=1&limit=10

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientName": "Иван К.",
      "clientCity": "Москва",
      "vehicleName": "Toyota Camry 2020",
      "rating": 5,
      "text": "Отличная работа компании...",
      "photos": [...],
      "videos": [...],
      "publishedAt": "2026-07-20T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### 5.3 Кейсы

**Получить список кейсов**

```http
GET /cases?page=1&limit=10

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "clientLabel": "Клиент из Москвы",
      "challenge": "Нужен был надёжный семейный автомобиль...",
      "vehicleName": "Toyota Camry 2020",
      "result": "Автомобиль доставлен за 3 недели...",
      "photos": [...],
      "slug": "toyota-camry-moscow-client",
      "publishedAt": "2026-07-15T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

**Получить кейс по slug**

```http
GET /cases/:slug

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientLabel": "Клиент из Москвы",
    "challenge": "...",
    "budget": 3000000,
    "vehicleName": "Toyota Camry 2020",
    "vehicleSpecs": "2.5L, 181 л.с., автомат",
    "inspectionSummary": "Автомобиль проверен полностью...",
    "finalCost": 2800000,
    "deliveryTime": "3 недели",
    "logisticsSummary": "Доставка морем из Японии...",
    "result": "...",
    "photos": [...],
    "videos": [...],
    "clientReview": "Очень доволен работой компании...",
    "publishedAt": "2026-07-15T10:00:00Z"
  }
}
```

### 5.4 Страницы контента

**Получить страницу по slug**

```http
GET /pages/:slug

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "О компании",
    "content": "<html>...</html>",
    "slug": "about",
    "metaTitle": "О компании — ЗаказАвто",
    "metaDescription": "...",
    "updatedAt": "2026-08-01T12:00:00Z"
  }
}
```

### 5.5 Заявки

**Создать заявку**

```http
POST /leads
Content-Type: application/json

{
  "type": "vehicle_request" | "vehicle_calculation",
  "vehicleId": "uuid", // опционально (для calculation)
  "vehicleRequest": {   // опционально (для request)
    "make": "Toyota",
    "model": "Camry",
    "budget": 3000000,
    "requirements": "..."
  },
  "contact": {
    "name": "Иван Иванов",
    "phone": "+79001234567",
    "telegram": "@username"
  },
  "comment": "..."
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ЗА-4821",
    "message": "Заявка принята. Мы свяжемся с вами в ближайшее время."
  }
}
```

**Валидация:**
- `type` — обязательно
- `contact.name` — обязательно
- Хотя бы один контакт (`phone` или `telegram`) — обязательно
- Если `type = vehicle_calculation`, то `vehicleId` обязательно
- Если `type = vehicle_request`, то хотя бы одно поле `vehicleRequest` обязательно

### 5.6 Отслеживание заказа

**Получить статус заказа по токену**

```http
GET /orders/track/:token

Response 200:
{
  "success": true,
  "data": {
    "orderNumber": "ЗА-4821",
    "status": "in_transit",
    "vehicle": {
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "photo": "..."
    },
    "timeline": [
      {
        "id": "uuid",
        "timestamp": "2026-08-01T10:00:00Z",
        "title": "Заявка принята",
        "description": "Ваша заявка принята в работу",
        "type": "status_change"
      },
      {
        "id": "uuid",
        "timestamp": "2026-08-03T14:30:00Z",
        "title": "Автомобиль найден",
        "description": "Подобран автомобиль по вашим критериям",
        "type": "status_change"
      },
      {
        "id": "uuid",
        "timestamp": "2026-08-05T09:00:00Z",
        "title": "Проверка завершена",
        "description": "Автомобиль прошёл полную проверку",
        "type": "status_change",
        "relatedMedia": [...]
      }
    ],
    "createdAt": "2026-08-01T10:00:00Z"
  }
}

Response 404:
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}
```

**Безопасность:**
- Rate limiting: максимум 10 запросов в минуту с одного IP
- Токен сложный (UUID v4)
- Только публичные данные (без ПДн клиента)

---

## 6. Защищённые эндпоинты (Админ-панель)

### 6.1 Автомобили (Admin)

**Получить список всех автомобилей**

```http
GET /admin/vehicles?page=1&limit=20&status=all

Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "status": "available",
      "vehiclePrice": 2000000,
      "vehiclePriceCurrency": "JPY",
      "totalCost": 2500000,
      "isPublished": true,
      "createdAt": "2026-08-01T12:00:00Z"
    }
  ],
  "meta": { ... }
}
```

**Создать автомобиль**

```http
POST /admin/vehicles
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "country": "japan",
  "mileage": 50000,
  "engine": "2.5L",
  "engineVolume": 2500,
  "power": 181,
  "transmission": "automatic",
  "drivetrain": "fwd",
  "fuel": "petrol",
  "bodyType": "sedan",
  "vehiclePrice": 2000000,
  "vehiclePriceCurrency": "JPY",
  "shippingCost": 100000,
  "customsCost": 200000,
  "commission": 50000,
  "status": "available",
  "isPublished": false
}

Response 201:
{
  "success": true,
  "data": { /* созданный автомобиль */ }
}
```

**Обновить автомобиль**

```http
PATCH /admin/vehicles/:id
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "status": "sold",
  "isPublished": false
}

Response 200:
{
  "success": true,
  "data": { /* обновлённый автомобиль */ }
}
```

**Удалить автомобиль**

```http
DELETE /admin/vehicles/:id
Authorization: Bearer <TOKEN>

Response 204: No Content
```

**Загрузить фото автомобиля**

```http
POST /admin/vehicles/:id/photos
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

file: <image file>
title: "Фото экстерьера"
sortOrder: 1

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://cdn.zakazavto.ru/vehicles/abc123.jpg",
    "thumbnailUrl": "https://cdn.zakazavto.ru/vehicles/abc123_thumb.jpg"
  }
}
```

### 6.2 Заказы (Admin)

**Получить список заказов**

```http
GET /admin/orders?page=1&limit=20&status=in_progress

Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ЗА-4821",
      "client": {
        "id": "uuid",
        "name": "Иван Иванов",
        "phone": "+79001234567"
      },
      "vehicle": {
        "id": "uuid",
        "make": "Toyota",
        "model": "Camry"
      },
      "status": "in_progress",
      "totalCost": 2500000,
      "createdAt": "2026-08-01T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

**Получить заказ по ID**

```http
GET /admin/orders/:id
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderNumber": "ЗА-4821",
    "client": { /* полные данные клиента */ },
    "vehicle": { /* полные данные автомобиля */ },
    "vehicleRequest": { ... },
    "pricing": { ... },
    "status": "in_progress",
    "statusHistory": [...],
    "timeline": [...],
    "documents": [...],
    "photos": [...],
    "managerNotes": "...",
    "clientNotes": "...",
    "trackingToken": "uuid",
    "createdAt": "2026-08-01T10:00:00Z"
  }
}
```

**Обновить статус заказа**

```http
PATCH /admin/orders/:id/status
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "status": "vehicle_purchased",
  "comment": "Автомобиль выкуплен на аукционе"
}

Response 200:
{
  "success": true,
  "data": { /* обновлённый заказ */ }
}
```

**Добавить событие в timeline**

```http
POST /admin/orders/:id/timeline
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Получены документы",
  "description": "Получены оригиналы документов от продавца",
  "type": "document_added",
  "isPublic": true
}

Response 201:
{
  "success": true,
  "data": { /* созданное событие */ }
}
```

### 6.3 Клиенты (Admin)

**Получить список клиентов**

```http
GET /admin/clients?page=1&limit=20&search=Иван

Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Иван Иванов",
      "phone": "+79001234567",
      "email": "ivan@example.com",
      "ordersCount": 2,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### 6.4 Отзывы (Admin)

**Получить список отзывов**

```http
GET /admin/reviews?page=1&limit=20&status=all

Authorization: Bearer <TOKEN>
```

**Опубликовать отзыв**

```http
PATCH /admin/reviews/:id/publish
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": { /* опубликованный отзыв */ }
}
```

### 6.5 Настройки (Admin)

**Получить настройки**

```http
GET /admin/settings
Authorization: Bearer <TOKEN>

Response 200:
{
  "success": true,
  "data": {
    "defaultCommission": 50000,
    "currencyRates": {
      "JPY": 0.6,
      "KRW": 0.055,
      "CNY": 12.5,
      "updatedAt": "2026-08-20T10:00:00Z"
    },
    "companyPhone": "+7 (XXX) XXX-XX-XX",
    "companyEmail": "info@zakazavto.ru",
    "companyTelegram": "@zakazauto_channel",
    "companyAddress": "г. Владивосток, ул. 13-я Рабочая, 12с3"
  }
}
```

**Обновить настройки**

```http
PATCH /admin/settings
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "defaultCommission": 55000,
  "currencyRates": {
    "JPY": 0.62,
    "KRW": 0.056,
    "CNY": 12.8
  }
}

Response 200:
{
  "success": true,
  "data": { /* обновлённые настройки */ }
}
```

---

## 7. Rate Limiting

```
Публичные эндпоинты:  100 requests/minute/IP
Заявки (POST /leads): 5 requests/minute/IP
Отслеживание заказа:  10 requests/minute/IP
Админ-панель:         1000 requests/minute/user
```

**Response при превышении:**

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

---

## 8. Файловое хранилище

**Загрузка файлов:**

```http
POST /admin/media/upload
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

file: <file>
entityType: "vehicle" | "order" | "review" | "case"
entityId: "uuid"
type: "photo" | "video" | "document"

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://cdn.zakazavto.ru/...",
    "thumbnailUrl": "https://cdn.zakazavto.ru/..."
  }
}
```

**Максимальный размер файла:**
- Фото: 10 MB
- Видео: 100 MB
- Документы: 20 MB

**Поддерживаемые форматы:**
- Фото: JPEG, PNG, WebP
- Видео: MP4, WebM
- Документы: PDF, DOC, DOCX

---

## 9. WebSocket (опционально, будущая функция)

**Для real-time обновлений статусов заказов в админ-панели:**

```
wss://api.zakazavto.ru/ws?token=<JWT_TOKEN>

События:
- order.status_changed
- order.timeline_updated
- vehicle.status_changed
- new_lead
```

---

**Версия документа:** 1.0  
**Дата:** 22.08.2026  
**Статус:** Approved for implementation
