# Data Model — ЗаказАвто

## Назначение документа

Описание структуры данных, сущностей, связей и правил обработки информации в системе ЗаказАвто.

---

## 1. Общие принципы

1. **Разделение публичных и внутренних данных** — клиент видит не всё, что видит админ
2. **Версионирование изменений** — все критические изменения логируются
3. **Безопасность ПДн** — персональные данные защищены и обезличены там, где возможно
4. **Ручной ввод** — автомобили добавляются только вручную через админ-панель
5. **Централизованный финансовый расчёт** — все расчёты проходят через единый движок
6. **Статусная модель** — каждая сущность имеет чёткий статус
7. **Файловое хранилище** — фото/видео/документы хранятся отдельно с метаданными

---

## 2. Основные сущности

### 2.1 Vehicle (Автомобиль)

**Описание:** Автомобиль в каталоге компании.

**Поля:**

```typescript
interface Vehicle {
  id: string // UUID
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string // User ID
  updatedBy: string // User ID
  
  // Основная информация
  make: string // Марка
  model: string // Модель
  generation?: string // Поколение
  year: number // Год выпуска
  country: 'japan' | 'korea' | 'china' // Страна
  
  // Технические характеристики
  mileage: number // Пробег (км)
  engine: string // Двигатель (например, "1.5L Turbo")
  engineVolume: number // Объём двигателя (куб.см)
  power: number // Мощность (л.с.)
  transmission: 'manual' | 'automatic' | 'cvt' | 'robot' // КПП
  drivetrain: 'fwd' | 'rwd' | 'awd' | '4wd' // Привод
  fuel: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'gas' // Топливо
  bodyType: string // Тип кузова
  color?: string // Цвет
  vin?: string // VIN (если доступен)
  
  // Комплектация
  trim?: string // Комплектация
  features?: string[] // Опции
  
  // Ценообразование (внутренние)
  vehiclePrice: number // Цена автомобиля (валюта страны)
  vehiclePriceCurrency: 'JPY' | 'KRW' | 'CNY'
  shippingCost?: number // Доставка (RUB)
  customsCost?: number // Таможня (RUB)
  utilisationFee?: number // Утилизационный сбор (RUB)
  brokerageCost?: number // Брокерские/прочие расходы (RUB)
  otherCosts?: number // Другие расходы (RUB)
  commission: number // Комиссия ЗаказАвто (RUB)
  totalCost: number // Итоговая стоимость (RUB, рассчитывается)
  
  // Публичное отображение цен (решение не зафиксировано)
  showPricePublic: boolean // Показывать ли цену публично
  publicPrice?: number // Публичная цена (если showPricePublic = true)
  
  // Статус
  status: VehicleStatus
  
  // Медиа
  photos: Media[] // Фотографии
  videos: Media[] // Видео
  documents: Media[] // Документы
  
  // Описание
  description?: string // Описание на русском
  internalNotes?: string // Внутренние заметки (не публичные)
  
  // Проверка
  inspection?: VehicleInspection // Данные проверки
  
  // Аукционные данные (если применимо)
  auctionData?: AuctionData
  
  // Метаданные
  isPublished: boolean // Опубликован ли в каталоге
  isFeatured: boolean // Рекомендуемый (показывать на главной)
  viewCount: number // Количество просмотров
  
  // SEO
  slug: string // ЧПУ (например, "toyota-camry-2020-abc123")
  metaTitle?: string
  metaDescription?: string
}

type VehicleStatus =
  | 'available' // Доступен для заказа
  | 'reserved' // Зарезервирован
  | 'in_verification' // На проверке
  | 'verified' // Проверен
  | 'purchased' // Выкуплен
  | 'in_transit' // В пути
  | 'arrived_vladivostok' // Прибыл во Владивосток
  | 'customs_clearance' // Таможенное оформление
  | 'delivery_russia' // Доставка по России
  | 'delivered' // Выдан клиенту
  | 'sold' // Продан
  | 'unavailable' // Недоступен
```

**Связи:**
- `Vehicle` 1:1 `VehicleInspection` (опционально)
- `Vehicle` 1:N `Media`
- `Vehicle` 1:N `Order` (может быть заказан несколько раз, если статус "available")

### 2.2 VehicleInspection (Проверка автомобиля)

**Описание:** Данные проверки состояния автомобиля.

**Поля:**

```typescript
interface VehicleInspection {
  id: string
  vehicleId: string // FK to Vehicle
  createdAt: DateTime
  updatedAt: DateTime
  inspectedBy: string // User ID специалиста
  inspectionDate: DateTime
  
  // Кузов и ЛКП
  body: {
    condition: InspectionCondition
    notes?: string
    photos: Media[]
  }
  
  // Двигатель
  engine: {
    condition: InspectionCondition
    notes?: string
    photos: Media[]
  }
  
  // Коробка передач
  transmission: {
    condition: InspectionCondition
    notes?: string
    photos: Media[]
  }
  
  // Ходовая
  suspension: {
    condition: InspectionCondition
    notes?: string
    photos: Media[]
  }
  
  // Электрика
  electronics: {
    condition: InspectionCondition
    notes?: string
    photos: Media[]
  }
  
  // Пробег
  mileageVerification: {
    verified: boolean
    actualMileage?: number
    notes?: string
  }
  
  // История
  history: {
    hasAccidents: boolean
    accidentDetails?: string
    hasFloodDamage: boolean
    hasPreviousOwners: boolean
    ownerCount?: number
    notes?: string
  }
  
  // Аукционный лист
  auctionSheet?: {
    available: boolean
    grade?: string
    photos: Media[]
  }
  
  // Документы
  documents: {
    verified: boolean
    notes?: string
    files: Media[]
  }
  
  // Юридическая чистота
  legalCheck: {
    verified: boolean
    notes?: string
  }
  
  // Общее заключение
  overallCondition: InspectionCondition
  recommendation: 'approved' | 'approved_with_notes' | 'not_recommended'
  specialistComment: string
  
  // Полный отчёт
  fullReportUrl?: string // Ссылка на PDF-отчёт
  
  // Публичность
  isPublic: boolean // Показывать ли клиентам
}

type InspectionCondition =
  | 'excellent' // Отличное
  | 'good' // Хорошее
  | 'fair' // Удовлетворительное
  | 'poor' // Плохое
  | 'unknown' // Не проверено
```

**Источники данных:**
- `company_verified` — проверено компанией
- `seller_provided` — предоставлено продавцом
- `external_database` — получено из внешней базы
- `requires_confirmation` — требует дополнительного подтверждения

### 2.3 Order (Заказ)

**Описание:** Заказ клиента на автомобиль.

**Поля:**

```typescript
interface Order {
  id: string // UUID
  orderNumber: string // Публичный номер заказа (например, "ЗА-4821")
  createdAt: DateTime
  updatedAt: DateTime
  
  // Клиент
  clientId: string // FK to Client
  
  // Автомобиль
  vehicleId?: string // FK to Vehicle (если конкретный автомобиль)
  vehicleRequest?: VehicleRequest // Если заказ по параметрам
  
  // Финансы
  pricing: OrderPricing
  
  // Статус
  status: OrderStatus
  statusHistory: OrderStatusHistory[]
  
  // Timeline
  timeline: OrderTimeline[]
  
  // Документы и медиа
  documents: Media[]
  photos: Media[]
  videos: Media[]
  
  // Коммуникация
  managerNotes?: string // Заметки менеджера (не публичные)
  clientNotes?: string // Комментарии клиента
  
  // Отслеживание
  trackingEnabled: boolean
  trackingToken: string // Уникальный токен для отслеживания (UUID)
  
  // Метаданные
  source?: string // Откуда пришла заявка (сайт, Telegram, звонок и т.д.)
}

type OrderStatus =
  | 'new' // Новая заявка
  | 'in_progress' // В работе
  | 'vehicle_found' // Автомобиль найден
  | 'inspection_scheduled' // Назначена проверка
  | 'inspection_completed' // Проверка завершена
  | 'report_provided' // Отчёт предоставлен клиенту
  | 'awaiting_client_approval' // Ожидание подтверждения клиента
  | 'approved' // Подтверждено клиентом
  | 'vehicle_purchased' // Автомобиль выкуплен
  | 'preparation_for_shipping' // Подготовка к отправке
  | 'in_transit' // В пути
  | 'arrived_vladivostok' // Прибыл во Владивосток
  | 'customs_clearance' // Таможенное оформление
  | 'delivery_russia' // Доставка по России
  | 'ready_for_pickup' // Готов к выдаче
  | 'delivered' // Передан клиенту
  | 'completed' // Завершён
  | 'cancelled' // Отменён

interface OrderStatusHistory {
  status: OrderStatus
  changedAt: DateTime
  changedBy: string // User ID
  comment?: string
}

interface OrderTimeline {
  id: string
  timestamp: DateTime
  type: 'status_change' | 'document_added' | 'note_added' | 'photo_added'
  title: string
  description?: string
  isPublic: boolean // Видно ли клиенту
  relatedMedia?: Media[]
}

interface VehicleRequest {
  make?: string
  model?: string
  yearFrom?: number
  yearTo?: number
  budget?: number
  requirements?: string
}

interface OrderPricing {
  vehiclePrice: number
  vehiclePriceCurrency: 'JPY' | 'KRW' | 'CNY'
  currencyRate: number // Курс валюты на момент расчёта
  shippingCost: number
  customsCost: number
  utilisationFee: number
  brokerageCost: number
  otherCosts: number
  commission: number
  totalCost: number
  currency: 'RUB'
}
```

**Связи:**
- `Order` N:1 `Client`
- `Order` N:1 `Vehicle` (опционально)
- `Order` 1:N `OrderTimeline`
- `Order` 1:N `Media`

### 2.4 Client (Клиент)

**Описание:** Клиент компании.

**Поля:**

```typescript
interface Client {
  id: string
  createdAt: DateTime
  updatedAt: DateTime
  
  // Персональные данные (защищённые)
  name: string
  phone?: string
  email?: string
  telegram?: string
  
  // Адрес доставки (опционально)
  deliveryAddress?: {
    city: string
    region?: string
    address?: string
    postalCode?: string
  }
  
  // Метаданные
  source?: string // Откуда пришёл (сайт, реклама, рекомендация и т.д.)
  notes?: string // Внутренние заметки
  
  // GDPR / 152-ФЗ
  consentGiven: boolean
  consentDate?: DateTime
}
```

**Связи:**
- `Client` 1:N `Order`
- `Client` 1:N `Review` (опционально)

### 2.5 Review (Отзыв)

**Описание:** Отзыв клиента о работе компании.

**Поля:**

```typescript
interface Review {
  id: string
  createdAt: DateTime
  updatedAt: DateTime
  
  // Клиент
  clientId?: string // FK to Client (опционально, может быть анонимный)
  clientName: string // Публичное имя (может быть обезличено)
  clientCity?: string
  
  // Заказ
  orderId?: string // FK to Order (опционально)
  vehicleName?: string // Название автомобиля (для контекста)
  
  // Отзыв
  rating: number // 1-5
  text: string
  
  // Медиа
  photos: Media[]
  videos: Media[]
  
  // Публикация
  isPublished: boolean
  publishedAt?: DateTime
  isFeatured: boolean // Показывать на главной
  
  // Модерация
  moderatedBy?: string // User ID
  moderatedAt?: DateTime
}
```

**Связи:**
- `Review` N:1 `Client` (опционально)
- `Review` N:1 `Order` (опционально)
- `Review` 1:N `Media`

### 2.6 Case (Кейс)

**Описание:** Кейс выполненного заказа для публикации на сайте.

**Поля:**

```typescript
interface Case {
  id: string
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string // User ID
  
  // Заказ
  orderId?: string // FK to Order (опционально)
  
  // Клиент (обезличенно)
  clientLabel: string // Например, "Клиент из Москвы" или "Иван К."
  
  // Задача
  challenge: string // Задача клиента
  budget?: number
  
  // Автомобиль
  vehicleName: string
  vehicleSpecs?: string
  
  // Проверка
  inspectionSummary?: string
  
  // Стоимость
  finalCost?: number
  
  // Срок
  deliveryTime?: string // Например, "3 недели"
  
  // Логистика
  logisticsSummary?: string
  
  // Результат
  result: string
  
  // Медиа
  photos: Media[]
  videos: Media[]
  
  // Отзыв
  clientReview?: string
  
  // Публикация
  isPublished: boolean
  publishedAt?: DateTime
  isFeatured: boolean // Показывать на главной
  
  // SEO
  slug: string
  metaTitle?: string
  metaDescription?: string
}
```

**Связи:**
- `Case` N:1 `Order` (опционально)
- `Case` 1:N `Media`

### 2.7 Media (Медиа)

**Описание:** Файл (фото, видео, документ).

**Поля:**

```typescript
interface Media {
  id: string
  createdAt: DateTime
  uploadedBy: string // User ID
  
  // Файл
  fileName: string
  fileSize: number // bytes
  mimeType: string
  url: string // URL файла в хранилище
  thumbnailUrl?: string // Для изображений/видео
  
  // Метаданные
  type: 'photo' | 'video' | 'document'
  title?: string
  description?: string
  alt?: string // Для изображений
  
  // Привязка
  entityType: 'vehicle' | 'inspection' | 'order' | 'review' | 'case' | 'page'
  entityId: string
  
  // Порядок отображения
  sortOrder: number
  
  // Публичность
  isPublic: boolean
}
```

### 2.8 User (Пользователь системы)

**Описание:** Сотрудник компании с доступом к админ-панели.

**Поля:**

```typescript
interface User {
  id: string
  createdAt: DateTime
  updatedAt: DateTime
  
  // Аутентификация
  email: string
  passwordHash: string
  
  // Персональная информация
  name: string
  role: UserRole
  
  // Статус
  isActive: boolean
  lastLoginAt?: DateTime
  
  // Метаданные
  createdBy?: string // User ID
}

type UserRole =
  | 'admin' // Администратор (полный доступ)
  | 'manager' // Менеджер (работа с заказами и клиентами)
  | 'supervisor' // Руководитель (просмотр отчётов)
```

**На старте у всех одинаковые права.**

Архитектура должна быть совместима с будущим RBAC (Role-Based Access Control).

### 2.9 Settings (Настройки)

**Описание:** Глобальные настройки системы.

**Поля:**

```typescript
interface Settings {
  id: string
  updatedAt: DateTime
  updatedBy: string // User ID
  
  // Финансы
  defaultCommission: number // Комиссия по умолчанию (RUB)
  
  // Курсы валют (ручной ввод)
  currencyRates: {
    JPY: number // Йена к рублю
    KRW: number // Вона к рублю
    CNY: number // Юань к рублю
    updatedAt: DateTime
  }
  
  // Контакты
  companyPhone?: string
  companyEmail?: string
  companyTelegram?: string
  companyAddress: string
  
  // Telegram Bot
  telegramBotToken?: string
  telegramChatId?: string // Для уведомлений
  
  // Режим работы (пока не зафиксирован)
  workingHours?: string
  
  // Публичные настройки
  siteTitle: string
  siteDescription: string
}
```

### 2.10 Page (Страница контента)

**Описание:** Статическая страница сайта (О компании, Схема работы и т.д.).

**Поля:**

```typescript
interface Page {
  id: string
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: string // User ID
  
  // Контент
  title: string
  slug: string // ЧПУ
  content: string // HTML или Markdown
  
  // Публикация
  isPublished: boolean
  publishedAt?: DateTime
  
  // SEO
  metaTitle?: string
  metaDescription?: string
  
  // Навигация
  showInMenu: boolean
  menuOrder?: number
}
```

---

## 3. Связи между сущностями

```
User 1:N Order (createdBy)
User 1:N Vehicle (createdBy, updatedBy)
User 1:N VehicleInspection (inspectedBy)
User 1:N Review (moderatedBy)
User 1:N Case (createdBy)
User 1:N Page (createdBy)
User 1:N Media (uploadedBy)

Client 1:N Order
Client 1:N Review

Vehicle 1:1 VehicleInspection
Vehicle 1:N Media
Vehicle 1:N Order

Order N:1 Vehicle
Order N:1 Client
Order 1:N OrderTimeline
Order 1:N Media

Review N:1 Client
Review N:1 Order
Review 1:N Media

Case N:1 Order
Case 1:N Media

VehicleInspection 1:N Media

Settings 1:1 (singleton)
```

---

## 4. Правила обработки данных

### 4.1 Финансовый расчёт

**Единая централизованная формула:**

```
Итоговая стоимость =
  Цена автомобиля (в рублях по курсу)
  + Доставка
  + Таможенные расходы
  + Утилизационный сбор
  + Брокерские/прочие расходы
  + Другие расходы
  + Комиссия
```

**Все расчёты проходят через централизованный модуль.**

Не размазывать финансовую формулу по UI-компонентам.

### 4.2 Курсы валют

Курсы вводятся **вручную** через админ-панель.

Минимум:
- JPY (йена)
- KRW (вона)
- CNY (юань)

При сохранении заказа курс фиксируется (snapshot) для истории.

### 4.3 Комиссия

Текущая комиссия: **50 000 ₽**

Комиссия должна изменяться через админ-панель.

При создании заказа используется актуальная комиссия из настроек.

### 4.4 Публичное отображение цен

**Решение не зафиксировано окончательно.**

Архитектура должна поддерживать:
- Внутреннюю финансовую информацию (всегда доступна админу)
- Публичную стоимость (опционально показывается клиенту)
- Будущий прозрачный breakdown (детализация расходов)

Не публиковать финансовые данные клиента без подтверждённого решения.

### 4.5 Статусы автомобилей

**Внутренние и публичные статусы могут различаться.**

Например:
- Внутренний: `in_verification`
- Публичный: `На проверке`

Публичные статусы должны быть понятны клиенту.

### 4.6 Персональные данные (152-ФЗ)

**Критически важное требование:**

1. **Минимизация данных** — собирать только необходимое
2. **Обезличивание** — где возможно, использовать обезличенные идентификаторы
3. **Защита передачи** — не передавать ПДн в Telegram и другие внешние системы
4. **Согласие** — получать согласие на обработку ПДн
5. **Логирование доступа** — фиксировать, кто и когда получал доступ к ПДн

**Telegram-уведомления:**

Можно отправлять:
- ID заявки (например, "Новая заявка #1234")
- ID автомобиля
- Статус заказа
- Обезличенную техническую информацию

Нельзя отправлять:
- Имя клиента
- Телефон
- Email
- Username
- Адрес
- Любые другие ПДн

### 4.7 Отслеживание заказа

**Безопасность:**

1. **Уникальный токен** — генерируется при создании заказа (UUID)
2. **Защита от перебора** — rate limiting, сложность токена
3. **Не публичный поиск** — нельзя найти заказ по публичному номеру без токена
4. **Уникальная ссылка** — клиент получает ссылку вида `https://zakazavto.ru/track/{token}`

**Публичный timeline:**

Только те события, которые помечены как `isPublic: true`.

Не показывать клиенту внутренние заметки менеджера.

---

## 5. Валидация данных

### Vehicle
- `make`, `model`, `year` — обязательны
- `year` — от 1990 до текущего года + 1
- `mileage` >= 0
- `power` > 0
- `vehiclePrice` > 0
- `slug` — уникальный

### Order
- `clientId` — обязательно
- `vehicleId` или `vehicleRequest` — обязательно хотя бы одно
- `orderNumber` — уникальный, генерируется автоматически
- `trackingToken` — уникальный UUID

### Client
- `name` — обязательно
- Хотя бы один контакт (`phone`, `email`, `telegram`) — обязательно
- `phone` — валидация формата (если указан)
- `email` — валидация формата (если указан)

### Review
- `clientName` — обязательно
- `rating` — от 1 до 5
- `text` — минимум 10 символов

### User
- `email` — уникальный, валидация формата
- `passwordHash` — минимум 8 символов исходного пароля
- `role` — из списка разрешённых ролей

---

## 6. Индексы (для производительности)

### Vehicle
- `make` + `model` + `year`
- `status`
- `isPublished`
- `slug` (уникальный)
- `country`

### Order
- `orderNumber` (уникальный)
- `trackingToken` (уникальный)
- `clientId`
- `vehicleId`
- `status`
- `createdAt` (для сортировки)

### Client
- `phone` (если используется для поиска)
- `email` (уникальный, если используется)

### Review
- `isPublished`
- `isFeatured`
- `createdAt`

### User
- `email` (уникальный)

---

**Версия документа:** 1.0  
**Дата:** 22.08.2026  
**Статус:** Approved for implementation
