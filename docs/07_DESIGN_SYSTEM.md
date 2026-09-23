# Design System — ЗаказАвто

## Назначение документа

Описание визуального языка, компонентов и дизайн-паттернов проекта ЗаказАвто.

---

## 1. Визуальная концепция

### Ключевая идея

Объединить **автомобильный стиль** (надёжность, мощь, качество) и **современный digital-сервис** (технологичность, прозрачность, интерактивность).

**Не копировать** стандарт automotive-рынка:

> огромная фотография автомобиля → заголовок → красная кнопка → преимущества → отзывы.

Создать **самостоятельный визуальный язык**, который отражает:
- Надёжность компании
- Экспертность специалистов
- Технологичность сервиса
- Прозрачность процесса
- Современность подхода

---

## 2. Цветовая палитра

### 2.1 Основные цвета

**Primary (красный):**
```
Red 600: #DC2626 (основной акцент, CTA)
Red 700: #B91C1C (hover состояния)
Red 500: #EF4444 (светлые акценты)
Red 900: #7F1D1D (тёмные акценты)
```

**Не использовать** визуально дешёвую кислотную красную (#FF0000).

**Neutral (чёрный/серый/белый):**
```
Black:    #000000 (заголовки, основной текст)
Gray 900: #111827 (вторичный текст)
Gray 800: #1F2937 (borders, разделители)
Gray 700: #374151
Gray 600: #4B5563
Gray 500: #6B7280
Gray 400: #9CA3AF
Gray 300: #D1D5DB
Gray 200: #E5E7EB (фоны)
Gray 100: #F3F4F6 (светлые фоны)
Gray 50:  #F9FAFB (очень светлые фоны)
White:    #FFFFFF (основной фон)
```

### 2.2 Семантические цвета

**Success:**
```
Green 600: #16A34A (успешные операции)
Green 100: #DCFCE7 (фон уведомлений)
```

**Warning:**
```
Yellow 600: #CA8A04 (предупреждения)
Yellow 100: #FEF3C7 (фон уведомлений)
```

**Error:**
```
Red 600: #DC2626 (ошибки)
Red 100: #FEE2E2 (фон уведомлений)
```

**Info:**
```
Blue 600: #2563EB (информационные сообщения)
Blue 100: #DBEAFE (фон уведомлений)
```

### 2.3 Использование цветов

**Фоны:**
- Основной: White (#FFFFFF)
- Альтернативный: Gray 50 (#F9FAFB)
- Карточки: White с тенью
- Секции: чередование White и Gray 50

**Текст:**
- Основной: Black (#000000) или Gray 900 (#111827)
- Вторичный: Gray 600 (#4B5563)
- Placeholder: Gray 400 (#9CA3AF)

**Акценты:**
- CTA кнопки: Red 600 (#DC2626)
- Ссылки: Red 600 (#DC2626)
- Активные элементы: Red 600 (#DC2626)

**Границы:**
- Основные: Gray 300 (#D1D5DB)
- Тонкие: Gray 200 (#E5E7EB)
- Акцентные: Red 600 (#DC2626)

---

## 3. Типографика

### 3.1 Шрифты

**Sans-serif (основной):**

Использовать системный шрифт-стек для производительности:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Альтернатива (если нужен веб-шрифт):** Inter

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

### 3.2 Размеры шрифтов

**Desktop:**
```
Hero H1:         64px / line-height 1.1 / font-weight 700
H1:              48px / line-height 1.2 / font-weight 700
H2:              36px / line-height 1.3 / font-weight 700
H3:              30px / line-height 1.4 / font-weight 600
H4:              24px / line-height 1.4 / font-weight 600
H5:              20px / line-height 1.5 / font-weight 600
Body Large:      18px / line-height 1.6 / font-weight 400
Body:            16px / line-height 1.6 / font-weight 400
Body Small:      14px / line-height 1.5 / font-weight 400
Caption:         12px / line-height 1.5 / font-weight 400
```

**Mobile:**
```
Hero H1:         40px / line-height 1.2 / font-weight 700
H1:              32px / line-height 1.3 / font-weight 700
H2:              28px / line-height 1.3 / font-weight 700
H3:              24px / line-height 1.4 / font-weight 600
H4:              20px / line-height 1.4 / font-weight 600
H5:              18px / line-height 1.5 / font-weight 600
Body Large:      16px / line-height 1.6 / font-weight 400
Body:            15px / line-height 1.6 / font-weight 400
Body Small:      14px / line-height 1.5 / font-weight 400
Caption:         12px / line-height 1.5 / font-weight 400
```

### 3.3 Веса шрифтов

```
Regular: 400
Medium:  500
Semibold: 600
Bold:    700
```

**Не использовать:**
- Light (300) — плохо читается на мобильных
- Extra Bold (800+) — визуально дешёво

---

## 4. Spacing (отступы)

**Система отступов (8px grid):**

```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
24:  96px
32:  128px
```

**Использование:**
- Между элементами: 4-8px
- Между группами: 16-24px
- Между секциями: 48-96px
- Padding контейнеров: 16-32px (mobile), 32-64px (desktop)

---

## 5. Layout

### 5.1 Container

**Max-width:**
```
Default: 1280px
Wide:    1440px
Narrow:  1024px
```

**Padding:**
```
Mobile:  16px (horizontal)
Tablet:  24px (horizontal)
Desktop: 32px (horizontal)
```

### 5.2 Grid

**Desktop:** 12 columns

**Mobile:** 4 columns (или fluid layout)

**Gap:** 24px (desktop), 16px (mobile)

### 5.3 Breakpoints

```
Mobile:      < 640px
Tablet:      640px - 1023px
Desktop:     >= 1024px
Large:       >= 1440px
```

---

## 6. Компоненты

### 6.1 Button

**Primary (CTA):**
```css
background: Red 600 (#DC2626)
color: White
padding: 12px 24px (desktop), 10px 20px (mobile)
border-radius: 8px
font-weight: 600
font-size: 16px (desktop), 15px (mobile)
min-height: 44px (mobile для touch)

hover: Red 700 (#B91C1C)
active: Red 900 (#7F1D1D)
disabled: Gray 300, cursor not-allowed
```

**Secondary:**
```css
background: White
color: Red 600
border: 2px solid Red 600
padding: 10px 22px (desktop), 8px 18px (mobile)
border-radius: 8px
font-weight: 600

hover: background Gray 50
```

**Ghost:**
```css
background: transparent
color: Gray 900
padding: 10px 22px

hover: background Gray 100
```

**Размеры:**
```
Large:  padding 16px 32px, font-size 18px
Medium: padding 12px 24px, font-size 16px (default)
Small:  padding 8px 16px, font-size 14px
```

### 6.2 Input

```css
background: White
border: 1px solid Gray 300
border-radius: 8px
padding: 12px 16px
font-size: 16px (чтобы iOS не зумил)
min-height: 44px (mobile)

focus: border Red 600, box-shadow 0 0 0 3px rgba(220, 38, 38, 0.1)
error: border Red 600
disabled: background Gray 100, color Gray 500
```

**Label:**
```css
font-size: 14px
font-weight: 600
color: Gray 900
margin-bottom: 6px
```

**Error message:**
```css
font-size: 14px
color: Red 600
margin-top: 4px
```

### 6.3 Card

**Стиль 1 (карточка автомобиля):**
```css
background: White
border-radius: 12px
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
overflow: hidden

hover: box-shadow 0 4px 12px rgba(0, 0, 0, 0.15), transform translateY(-2px)
transition: all 0.2s ease
```

**Стиль 2 (информационная карточка):**
```css
background: White
border: 1px solid Gray 200
border-radius: 8px
padding: 24px
```

### 6.4 Badge (статусы)

```css
padding: 4px 12px
border-radius: 12px
font-size: 12px
font-weight: 600
text-transform: uppercase
letter-spacing: 0.5px

Доступен:     background Green 100, color Green 700
Зарезервирован: background Yellow 100, color Yellow 700
В пути:       background Blue 100, color Blue 700
Продан:       background Gray 100, color Gray 700
```

### 6.5 Modal

```css
overlay: background rgba(0, 0, 0, 0.5), backdrop-filter blur(4px)
content: background White, border-radius 16px, max-width 600px
padding: 32px (desktop), 24px (mobile)
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3)

animation: fade-in + scale-up
```

### 6.6 Toast (уведомления)

```css
background: White
border-left: 4px solid <semantic color>
border-radius: 8px
padding: 16px
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
max-width: 400px

Success: border-color Green 600
Error:   border-color Red 600
Warning: border-color Yellow 600
Info:    border-color Blue 600
```

### 6.7 Timeline (отслеживание заказа)

```css
Линия: 2px solid Gray 300
Активная линия: 2px solid Red 600

Точка: 
  default: background Gray 300, size 12px
  active:  background Red 600, size 16px, box-shadow 0 0 0 4px rgba(220, 38, 38, 0.2)
  completed: background Green 600, size 12px
```

---

## 7. Иконки

**Библиотека:** Lucide Icons или Heroicons

**Размеры:**
```
Small:  16px
Medium: 20px (default)
Large:  24px
XLarge: 32px
```

**Stroke width:** 2px

**Цвет:** Наследуется от текста

---

## 8. Тени

```css
/* Карточки */
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05)
shadow:     0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1)

/* Hover состояния */
shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15)

/* Модальные окна */
shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.3)
```

---

## 9. Анимации

**Timing functions:**
```css
ease-out:    cubic-bezier(0, 0, 0.2, 1)
ease-in:     cubic-bezier(0.4, 0, 1, 1)
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

**Duration:**
```css
Fast:   150ms (hover, focus)
Normal: 200ms (transitions)
Slow:   300ms (модальные окна)
```

**Примеры:**
```css
/* Hover на кнопках */
transition: all 0.2s ease-out;

/* Hover на карточках */
transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;

/* Появление модального окна */
animation: fade-in 0.3s ease-out, scale-up 0.3s ease-out;
```

---

## 10. Изображения

### 10.1 Обработка

**Форматы:**
- WebP (основной)
- JPEG (fallback)
- PNG (для прозрачности)

**Размеры:**
- Thumbnail: 300x200
- Medium: 800x600
- Large: 1920x1080

**Оптимизация:**
- Компрессия: 80-85% (JPEG), 85-90% (WebP)
- Lazy loading
- Blur placeholder

### 10.2 Aspect Ratios

```
Карточки автомобилей: 3:2
Hero: 16:9 (desktop), 4:3 (mobile)
Галерея: 16:9
Thumbnail: 4:3
```

### 10.3 Object-fit

```css
Карточки: object-fit cover
Галерея: object-fit contain (для детального просмотра)
```

---

## 11. Responsive

### 11.1 Принципы

1. **Mobile-first** — проектировать сначала для мобильных
2. **Touch-friendly** — минимум 44x44px для кликабельных элементов
3. **Readable** — минимум 15px для основного текста на мобильных
4. **Thumb-zone** — важные действия в нижней трети экрана (mobile)

### 11.2 Адаптация компонентов

**Навигация:**
- Mobile: бургер-меню
- Desktop: горизонтальная

**Карточки автомобилей:**
- Mobile: 1 колонка
- Tablet: 2 колонки
- Desktop: 3-4 колонки

**Формы:**
- Mobile: vertical stacking
- Desktop: 2 колонки (где уместно)

**Timeline:**
- Mobile: вертикальный
- Desktop: вертикальный (или горизонтальный для компактности)

---

## 12. Accessibility

### 12.1 Контраст

Минимальный контраст: **4.5:1** для основного текста, **3:1** для крупного текста.

**Проверенные комбинации:**
- Black (#000000) на White (#FFFFFF): 21:1 ✅
- Gray 900 (#111827) на White: 16.9:1 ✅
- Gray 600 (#4B5563) на White: 7.7:1 ✅
- Red 600 (#DC2626) на White: 5.5:1 ✅
- White на Red 600: 5.5:1 ✅

### 12.2 Focus States

```css
focus-visible: 
  outline: 2px solid Red 600
  outline-offset: 2px
```

### 12.3 ARIA Labels

Обязательно для:
- Кнопок без текста (иконки)
- Интерактивных элементов
- Форм

### 12.4 Keyboard Navigation

Все интерактивные элементы доступны через Tab.

---

## 13. Темная тема (будущая функция)

Пока не реализуется в MVP.

**Подготовка:** использовать CSS-переменные для цветов.

```css
:root {
  --color-primary: #DC2626;
  --color-bg: #FFFFFF;
  --color-text: #000000;
}

[data-theme="dark"] {
  --color-primary: #EF4444;
  --color-bg: #111827;
  --color-text: #F9FAFB;
}
```

---

## 14. Паттерны

### 14.1 Hero Section

```
Layout: 
  - Desktop: 50% контент, 50% визуал (side-by-side)
  - Mobile: вертикальный стек (контент сверху)

Контент:
  - Заголовок (Hero H1)
  - Подзаголовок (Body Large)
  - Цифры опыта (grid 3 колонки)
  - CTA (Primary Button + Secondary Button)

Визуал:
  - Не просто большая фотография автомобиля
  - Показать процесс/контроль/технологичность
```

### 14.2 Карточка автомобиля

```
Структура:
  1. Фото (3:2)
  2. Марка + Модель (H4)
  3. Год, пробег, мощность (Body Small, Gray 600)
  4. Статус (Badge)
  5. Цена (H3, Red 600) — если публичная
  6. Кнопка "Подробнее" (Secondary Button)

Hover:
  - Lift эффект (transform translateY(-4px))
  - Тень увеличивается
```

### 14.3 Форма заявки

```
Структура:
  1. Заголовок (H3)
  2. Описание (Body)
  3. Поля формы (vertical stacking)
  4. CTA кнопка (Primary, full-width на mobile)
  5. Уведомление о политике конфиденциальности (Caption)

Валидация:
  - Inline ошибки (под полем)
  - Иконка ошибки (красная)
  - Красная граница поля
```

---

## 15. Брендовые элементы

### 15.1 Логотип

**Использование:**
- Header: высота 32px (mobile), 40px (desktop)
- Footer: высота 40px
- Favicon: 32x32, 64x64, 128x128

**Цвета:**
- На белом фоне: полноцветный или Black
- На чёрном фоне: White

### 15.2 Паттерны

**Акцентные линии:**
- Использовать тонкие красные линии (2px) как акценты
- Не перегружать

**Геометрия:**
- Скругления: 8px (default), 12px (карточки), 16px (модальные окна)
- Не использовать острые углы (0px) для интерактивных элементов

---

## 16. Контент-правила

### 16.1 Тон голоса

- Профессиональный, но не формальный
- Экспертный, но понятный
- Уверенный, но не агрессивный

### 16.2 Форматирование

- Заголовки: краткие, до 60 символов
- Абзацы: до 3-4 строк на desktop, до 5-6 на mobile
- Списки: использовать для перечислений
- Выделение: жирный шрифт для ключевых слов (не подчёркивание)

### 16.3 Placeholder-изображения

Если реального контента нет:

```
IMAGE_PLACEHOLDER: [Описание]
```

Не использовать случайные стоковые фотографии.

---

## 17. Чек-лист реализации

**Frontend-разработчик должен:**

- [ ] Использовать системный шрифт или Inter
- [ ] Применять цветовую палитру из документа
- [ ] Соблюдать spacing систему (8px grid)
- [ ] Обеспечить минимальный контраст 4.5:1
- [ ] Сделать touch-элементы минимум 44x44px
- [ ] Использовать WebP с JPEG fallback
- [ ] Добавить lazy loading для изображений
- [ ] Реализовать hover/focus состояния
- [ ] Проверить на mobile (360px, 390px, 430px)
- [ ] Добавить ARIA labels
- [ ] Использовать semantic HTML

---

**Версия документа:** 1.0  
**Дата:** 22.08.2026  
**Статус:** Approved for implementation
