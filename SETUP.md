# Инструкция по первоначальной настройке

## Шаг 1: Создание Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Укажите имя бота (например: "ЗаказАвто Бот")
4. Укажите username бота (должен заканчиваться на `bot`, например: `zakazavto_crm_bot`)
5. Скопируйте токен бота (выглядит как `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. Сохраните токен — это ваш `BOT_TOKEN`

## Шаг 2: Создание чата менеджеров

1. Создайте новую группу в Telegram
2. Добавьте вашего бота в эту группу (найдите по username)
3. Сделайте бота администратором группы (права: отправка сообщений, редактирование сообщений)
4. Чтобы получить ID чата:
   - Добавьте в группу бота [@userinfobot](https://t.me/userinfobot)
   - Он пришлёт ID группы (будет отрицательным, например: `-1001234567890`)
   - Удалите @userinfobot из группы
5. Скопируйте ID — это ваш `MANAGER_CHAT_ID`

## Шаг 3: Получение вашего Telegram ID

1. Откройте диалог с [@userinfobot](https://t.me/userinfobot)
2. Он отправит ваш ID (например: `123456789`)
3. Скопируйте ID — это ваш `ADMIN_TELEGRAM_IDS`
4. Если админов несколько, укажите через запятую: `123456789,987654321`

## Шаг 4: Настройка файла .env

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Заполните следующие обязательные параметры:

```env
# Токен бота из @BotFather
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# ID группы менеджеров (с минусом!)
MANAGER_CHAT_ID=-1001234567890

# Придумайте сложный секретный ключ для API
API_SECRET=your-strong-secret-key-min-32-symbols

# Telegram ID администраторов
ADMIN_TELEGRAM_IDS=123456789

# База данных (можно оставить как есть для Docker)
DATABASE_URL=postgresql+asyncpg://zakazavto:password@postgres:5432/zakazavto_db
```

## Шаг 5: Запуск системы

```bash
# Запуск всех сервисов
docker compose up -d

# Проверка, что всё запустилось
docker compose ps

# Должны быть запущены: postgres, api, bot
```

## Шаг 6: Проверка работоспособности

### Проверка API

```bash
curl http://localhost:8000/health
# Ответ: {"status":"healthy"}
```

### Проверка бота

1. Откройте диалог с вашим ботом в Telegram
2. Отправьте команду `/start`
3. Бот должен ответить (если вы ещё не добавлены как менеджер, будет сообщение об этом)

## Шаг 7: Добавление первого менеджера

### Вариант 1: Через базу данных (для себя как админа)

```bash
# Войдите в контейнер бота
docker compose exec bot python

# В Python консоли:
from backend.db import AsyncSessionLocal
from backend.services import ManagerService
from backend.schemas import ManagerCreate
import asyncio

async def add_admin():
    async with AsyncSessionLocal() as db:
        service = ManagerService(db)
        manager = await service.create_manager(
            ManagerCreate(
                telegram_id=123456789,  # Ваш Telegram ID
                username="your_username",
                full_name="Ваше Имя",
                is_admin=True
            )
        )
        await db.commit()
        print(f"Менеджер создан: {manager.full_name}")

asyncio.run(add_admin())
```

### Вариант 2: Через SQL

```bash
# Подключитесь к БД
docker compose exec postgres psql -U zakazavto -d zakazavto_db

# Выполните SQL
INSERT INTO managers (telegram_id, username, full_name, is_active, is_admin)
VALUES (123456789, 'your_username', 'Ваше Имя', true, true);

# Выход
\q
```

## Шаг 8: Проверка работы

1. Отправьте боту `/start` — он должен узнать вас как менеджера
2. Отправьте боту `/admin` — должна открыться админ-панель
3. Создайте тестовую заявку через API:

```bash
curl -X POST http://localhost:8000/api/v1/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Secret: your-strong-secret-key-min-32-symbols" \
  -d '{
    "client_name": "Тестовый клиент",
    "client_phone": "+79161234567",
    "service": "Тестовая услуга",
    "comment": "Проверка работы системы"
  }'
```

4. Вы должны получить заявку:
   - В личные сообщения бота
   - В группу менеджеров

## Шаг 9: Добавление других менеджеров

Теперь вы можете добавлять менеджеров через команду:

```
/add_manager @username Полное Имя
```

После этого менеджер должен отправить `/start` боту.

## Решение проблем

### Бот не отвечает

1. Проверьте, что контейнер запущен:
```bash
docker compose ps
docker compose logs bot
```

2. Проверьте токен в `.env`

3. Проверьте, что бот не заблокирован Telegram

### Бот не отправляет сообщения в группу

1. Убедитесь, что бот добавлен в группу
2. Убедитесь, что бот является администратором
3. Проверьте правильность `MANAGER_CHAT_ID` (должен быть с минусом)

### API возвращает ошибку 401

Проверьте, что `X-API-Secret` в запросе совпадает с `API_SECRET` в `.env`

### База данных не запускается

```bash
# Удалите старые данные и запустите заново
docker compose down -v
docker compose up -d
```

## Следующие шаги

1. Настройте домен и SSL-сертификат для production
2. Измените пароль базы данных в `.env` и `docker-compose.yml`
3. Настройте резервное копирование БД
4. Интегрируйте API на ваш сайт
5. Добавьте остальных менеджеров

## Полезные команды

```bash
# Просмотр логов
docker compose logs -f bot
docker compose logs -f api

# Перезапуск сервиса
docker compose restart bot

# Остановка всех сервисов
docker compose down

# Обновление после изменения кода
docker compose up -d --build

# Вход в контейнер для отладки
docker compose exec bot bash

# Выполнение миграций
docker compose exec bot alembic upgrade head
```
