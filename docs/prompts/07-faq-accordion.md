# Prompt 07: FAQAccordion

Создай клиентский компонент `src/components/features/faq-accordion.tsx` с props `{ items: FAQItem[]; showCTA?: boolean }`.

Реализуй доступный accordion: кнопка вопроса, `aria-expanded`, `aria-controls`, уникальный id панели и один открытый пункт по умолчанию.

Требования:
- `answer: string` рендери абзацем, `string[]` рендери списком.
- Не используй небезопасный `dangerouslySetInnerHTML`.
- Анимация не должна скрывать содержимое от скринридеров некорректным использованием `display: none`.
- CTA «Оформить заявку прямо сейчас» ведет на `/request`.
- Учти пустой массив и клавиатурную навигацию.
