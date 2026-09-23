# Prompt 08: ManagersGrid

Создай `src/components/features/managers-grid.tsx` с props `{ categories: ManagerCategory[]; showCTA?: boolean }`.

Для каждой категории покажи название и список менеджеров. Телефон должен быть ссылкой `tel:`, мессенджер — внешней ссылкой.

Требования:
- Импортируй тип `ManagerCategory`.
- Нормализуй телефон для `tel:` без изменения отображаемого номера.
- Не показывай персональные контакты, которые отсутствуют в переданных данных.
- Обеспечь responsive layout, видимый focus и понятные accessible labels.
- CTA «Оставить заявку» ведет на `/request`.
