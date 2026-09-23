# Prompt 09: TrustBlock

Создай `src/components/features/trust-block.tsx` с props `{ reviews: ExternalReview[]; officeHours: OfficeHours }`.

Отобрази внешние отзывы и режим работы офиса: будни, субботу при наличии и часы выдачи автомобилей.

Требования:
- Все внешние ссылки имеют `target="_blank" rel="noreferrer"`.
- Рендери коллекции из props.
- Не добавляй рейтинг или количество отзывов, если этих данных нет.
- Используй существующую темную тему и mobile-first layout.
