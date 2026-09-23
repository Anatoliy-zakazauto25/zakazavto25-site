# Prompt 10: Интеграция главной страницы

Интегрируй новые компоненты в `src/app/page.tsx`.

Порядок публичной страницы: `SiteTopbar`, `SiteHeader`, Hero с `SocialProof`, преимущества с `FounderCard`, 9 этапов через `WorkSteps`, FAQ с id `faq`, существующие витрина/кейсы/отзывы, `ManagersGrid` с id `contacts`, `TrustBlock`, `LeadForm`, `SiteFooter`.

Требования:
- Импортируй данные из `@/lib/mock-data` и компоненты из их фактических путей.
- Сохрани работающие каталог, кейсы, отзывы и форму.
- Не оставляй дублирующие 5-шаговые секции.
- Добавь id `advantages`, `reviews` там, где они отсутствуют.
- Не превращай страницу в client component без необходимости.
- Запусти `npm run lint` и `npm run build`.
