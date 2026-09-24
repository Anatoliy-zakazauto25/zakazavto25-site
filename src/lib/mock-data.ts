import type {
  ExternalReview,
  FAQItem,
  Founder,
  ManagerCategory,
  OfficeHours,
  SocialLink,
  WorkStep,
  NewsItem,
} from "@/types/components";

export type Review = {
  name: string;
  city: string;
  text: string;
  initials: string;
  image: string;
};

export type MockVehicle = {
  id: string;
  name: string;
  country: string;
  year: number;
  mileage: string;
  engine: string;
  drive: string;
  price: string;
  status: string;
  image: string;
  tag: string;
};

export const vehicles: MockVehicle[] = [
  {
    id: "toyota-crown-2022",
    name: "Toyota Crown",
    country: "Япония",
    year: 2022,
    mileage: "31 000 км",
    engine: "2.5 л · гибрид",
    drive: "4WD",
    price: "4 280 000 ₽",
    status: "Проверен",
    tag: "Выбор недели",
    image:
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "kia-k5-2023",
    name: "Kia K5",
    country: "Корея",
    year: 2023,
    mileage: "18 400 км",
    engine: "2.0 л · бензин",
    drive: "FWD",
    price: "2 690 000 ₽",
    status: "В пути",
    tag: "Новый приход",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "zeekr-001-2024",
    name: "Zeekr 001",
    country: "Китай",
    year: 2024,
    mileage: "12 800 км",
    engine: "Электро · 544 л.с.",
    drive: "AWD",
    price: "5 190 000 ₽",
    status: "Доступен",
    tag: "Электромобиль",
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "lexus-rx-2021",
    name: "Lexus RX 300",
    country: "Япония",
    year: 2021,
    mileage: "48 200 км",
    engine: "2.0 л · бензин",
    drive: "AWD",
    price: "4 060 000 ₽",
    status: "Доступен",
    tag: "Семейный выбор",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "hyundai-palisade-2022",
    name: "Hyundai Palisade",
    country: "Корея",
    year: 2022,
    mileage: "39 700 км",
    engine: "2.2 л · дизель",
    drive: "AWD",
    price: "4 470 000 ₽",
    status: "На проверке",
    tag: "7 мест",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "li-auto-l7-2023",
    name: "Li Auto L7",
    country: "Китай",
    year: 2023,
    mileage: "22 100 км",
    engine: "1.5 л · гибрид",
    drive: "AWD",
    price: "4 890 000 ₽",
    status: "Доступен",
    tag: "Комфорт",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "toyota-land-cruiser-2021",
    name: "Toyota Land Cruiser",
    country: "Япония",
    year: 2021,
    mileage: "54 000 км",
    engine: "3.5 л · бензин",
    drive: "4WD",
    price: "6 180 000 ₽",
    status: "Доступен",
    tag: "Внедорожник",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "hyundai-santa-fe-2023",
    name: "Hyundai Santa Fe",
    country: "Корея",
    year: 2023,
    mileage: "16 800 км",
    engine: "2.5 л · бензин",
    drive: "AWD",
    price: "3 780 000 ₽",
    status: "Доступен",
    tag: "Новый приход",
    image:
      "https://images.unsplash.com/photo-1568844293986-8c3f9c7f3f6b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "geely-monjaro-2024",
    name: "Geely Monjaro",
    country: "Китай",
    year: 2024,
    mileage: "9 200 км",
    engine: "2.0 л · бензин",
    drive: "AWD",
    price: "3 420 000 ₽",
    status: "Доступен",
    tag: "2024 год",
    image:
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1000&q=85",
  },
  ...[
    ["toyota-alphard-2022", "Toyota Alphard", "2022", "42 000 км", "2.5 л · гибрид", "4WD", "5 240 000 ₽", "Минивэн"],
    ["nissan-x-trail-2021", "Nissan X-Trail", "2021", "36 500 км", "2.0 л · бензин", "4WD", "2 780 000 ₽", "Кроссовер"],
    ["honda-vezel-2023", "Honda Vezel", "2023", "19 800 км", "1.5 л · гибрид", "4WD", "2 460 000 ₽", "Гибрид"],
    ["toyota-harrier-2022", "Toyota Harrier", "2022", "27 400 км", "2.5 л · гибрид", "4WD", "3 860 000 ₽", "Премиум"],
    ["mazda-cx-5-2021", "Mazda CX-5", "2021", "44 100 км", "2.0 л · бензин", "AWD", "2 930 000 ₽", "Кроссовер"],
    ["subaru-forester-2020", "Subaru Forester", "2020", "51 200 км", "2.0 л · бензин", "AWD", "2 690 000 ₽", "Для города"],
  ].map(([id, name, year, mileage, engine, drive, price, tag], index) => ({
    id,
    name,
    country: "Япония",
    year: Number(year),
    mileage,
    engine,
    drive,
    price,
    status: index === 1 ? "На проверке" : "Доступен",
    tag,
    image: [
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=85",
    ][index % 3],
  })),
  ...[
    ["genesis-gv70-2023", "Genesis GV70", "2023", "21 300 км", "2.5 л · бензин", "AWD", "4 280 000 ₽", "Премиум"],
    ["kia-sorento-2022", "Kia Sorento", "2022", "33 600 км", "2.2 л · дизель", "AWD", "3 640 000 ₽", "Семейный"],
    ["hyundai-grandeur-2021", "Hyundai Grandeur", "2021", "29 100 км", "2.5 л · бензин", "FWD", "2 980 000 ₽", "Бизнес-класс"],
    ["kia-carnival-2023", "Kia Carnival", "2023", "14 700 км", "2.2 л · дизель", "FWD", "4 120 000 ₽", "7 мест"],
    ["hyundai-tucson-2022", "Hyundai Tucson", "2022", "26 800 км", "1.6 л · гибрид", "AWD", "3 180 000 ₽", "Гибрид"],
    ["kia-sportage-2021", "Kia Sportage", "2021", "38 200 км", "1.6 л · бензин", "AWD", "2 760 000 ₽", "Кроссовер"],
  ].map(([id, name, year, mileage, engine, drive, price, tag], index) => ({
    id,
    name,
    country: "Корея",
    year: Number(year),
    mileage,
    engine,
    drive,
    price,
    status: index === 3 ? "В пути" : "Доступен",
    tag,
    image: [
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1000&q=85",
    ][index % 3],
  })),
  ...[
    ["byd-han-2024", "BYD Han", "2024", "8 600 км", "Электро · 517 л.с.", "AWD", "4 080 000 ₽", "Электромобиль"],
    ["voyah-free-2023", "Voyah Free", "2023", "17 500 км", "1.5 л · гибрид", "AWD", "4 360 000 ₽", "Комфорт"],
    ["zeekr-009-2024", "Zeekr 009", "2024", "6 900 км", "Электро · 544 л.с.", "AWD", "6 240 000 ₽", "Минивэн"],
    ["chery-tiggo-8-2023", "Chery Tiggo 8 Pro", "2023", "18 300 км", "2.0 л · бензин", "AWD", "2 940 000 ₽", "7 мест"],
    ["tank-500-2022", "Tank 500", "2022", "24 700 км", "3.0 л · бензин", "4WD", "5 280 000 ₽", "Внедорожник"],
    ["nio-es6-2023", "NIO ES6", "2023", "11 200 км", "Электро · 490 л.с.", "AWD", "4 580 000 ₽", "Электромобиль"],
  ].map(([id, name, year, mileage, engine, drive, price, tag], index) => ({
    id,
    name,
    country: "Китай",
    year: Number(year),
    mileage,
    engine,
    drive,
    price,
    status: index === 2 ? "На проверке" : "Доступен",
    tag,
    image: [
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1000&q=85",
    ][index % 3],
  })),
];

export const reviews: Review[] = [
  {
    name: "Алексей",
    city: "Владивосток",
    text: "Заказывал Volkswagen tharu xr 2026 г.в. новую. Машину привезли. Претензий нет. Никаких проблем не было. Рекомендую.",
    initials: "АК",
    image: "/reviews/review-01.png",
  },
  {
    name: "Александр",
    city: "Ижевск",
    text: "Диалог был продуктивный и познавательный. Менеджер Виталий объяснял все мелочи и понимал мои страхи. Нужна была машина жене — Пежо 3008. Машину привезли прямо к порогу дома.",
    initials: "АС",
    image: "/reviews/review-02.png",
  },
  {
    name: "Марина",
    city: "Екатеринбург",
    text: "Огромное спасибо Виталию и Анатолию за помощь в подборе авто и полному сопровождению по покупке и доставке! Очень классные и компетентные ребята, клиентоориентированность, доброжелательность и оперативность — это все о них.",
    initials: "МС",
    image: "/reviews/review-03.png",
  },
  {
    name: "Дмитрий",
    city: "Новосибирск",
    text: "Заказал себе машину. Менеджер Иван быстро подобрал хороший вариант и сопровождал весь процесс сделки, включая доставку. Покупкой доволен. Огромное спасибо Ивану. Приятно работать с профессионалами!",
    initials: "ДР",
    image: "/reviews/review-04.png",
  },
  {
    name: "Сергей",
    city: "Самара",
    text: "Обратился в ЗаказАвто ещё до Нового 2026 года. В феврале 2026 обговорили все хотелки и цену, заключили договор. Всё прозрачно и понятно, на телефоны и сообщения отвечают несмотря на разницу во времени.",
    initials: "СР",
    image: "/reviews/review-05.png",
  },
  {
    name: "Елена",
    city: "Москва",
    text: "Покупали автомобиль с Иваном, всем рекомендую покупать только с ним. Специалист с большой буквы, отзывчивый, коммуникабельный, всегда был на связи. Быстро подобрал нам автомобиль по нашим запросам, на всех этапах четко объяснял, что нужно делать. Мы очень довольны!",
    initials: "ЕМ",
    image: "/reviews/review-06.png",
  },
];

export const cases = [
  {
    title: "Toyota Crown для семьи",
    meta: "Москва · Япония · 2022",
    text: "Нужен был комфортный автомобиль для города и поездок. Сравнили несколько вариантов, проверили историю и выбрали оптимальный.",
    result: "Автомобиль выдан клиенту",
    image: vehicles[0].image,
  },
  {
    title: "Первый электромобиль",
    meta: "Екатеринбург · Китай · 2024",
    text: "Клиент искал современный электромобиль с понятной историей. Подготовили проверку, расчёт и организовали доставку.",
    result: "Zeekr 001 в пути",
    image: vehicles[2].image,
  },
];

export const socialLinks: SocialLink[] = [
  { platform: "telegram", url: "https://t.me/zakazauto25", followers: "Наш Telegram" },
  { platform: "whatsapp", url: "https://wa.me/message/VT7EORIQ27HAH1", followers: "Наш WhatsApp" },
  { platform: "vk", url: "https://vk.ru/zakazauto125", followers: "Наш VK" },
  { platform: "max", url: "https://max.ru/u/f9LHodD0cOLUjaxblAgvkS6iFQ4OchUV8-E7ScjS_42Wn34RNp0e4iAHYn8", followers: "Наш Max" },
];

export const founder: Founder = {
  name: "Понамарев Анатолий Андреевич",
  title: "Директор компании",
  photo: "/Ponoparev.jpg",
  description: "Лично контролируем подбор, проверку и доставку автомобилей из Азии.",
};

export const workSteps: WorkStep[] = [
  ["1", "Заключение договора", "Прописываем характеристики автомобиля, бюджет и условия работы."],
  ["2", "Предоплата", "Вы вносите депозит, который входит в конечную стоимость автомобиля."],
  ["3", "Подбираем автомобиль", "Показываем варианты с подробным описанием, фото и результатами проверки."],
  ["4", "Покупка авто", "Выкупаем согласованный автомобиль в рамках утвержденного бюджета."],
  ["5", "Оплата", "После покупки оплачивается стоимость автомобиля и его доставка в Россию."],
  ["6", "Оформление документов", "Сопровождаем таможенное оформление и получение документов."],
  ["7", "Таможенное оформление", "Рассчитываем и организуем оплату обязательных таможенных платежей."],
  ["8", "Последний блок платежей", "СВХ, лаборатория, брокер и другие расходы согласуются заранее."],
  ["9", "Доставка", "Передаем автомобиль во Владивостоке или отправляем транспортной компанией."],
].map(([number, title, description]) => ({ number, title, description }));

export const faqItems: FAQItem[] = [
  {
    question: "Как заказать автомобиль?",
    answer: [
      "Заключаем договор, фиксируем характеристики и бюджет.",
      "Менеджер предлагает варианты с фото, характеристиками и переводом.",
      "Проверяем выбранный автомобиль до покупки.",
      "После прибытия во Владивосток сопровождаем оформление документов.",
      "Передаем автомобиль или организуем доставку до вашего города.",
    ],
  },
  {
    question: "Какие гарантии?",
    answer: "Работаем по договору, показываем результаты проверки и сопровождаем оформление документов в соответствии с законодательством РФ.",
  },
  {
    question: "Оплачивать авто нужно заранее?",
    answer: "Вся сумма не вносится сразу: платежи разделены на аванс, оплату автомобиля и обязательные расходы по доставке и оформлению.",
  },
  {
    question: "Доставите ли в мой город?",
    answer: "Да. После оформления во Владивостоке организуем отправку транспортной компанией до вашего города и поможем со страхованием.",
  },
  {
    question: "Есть ли офис в моем городе?",
    answer: "Офис и выдача находятся во Владивостоке. С клиентами из других регионов работаем дистанционно и организуем доставку.",
  },
];

export const managerCategories: ManagerCategory[] = [
  { emoji: "🇯🇵", title: "Менеджеры по Японии", managers: [] },
  { emoji: "🇰🇷", title: "Менеджеры по Корее", managers: [] },
  { emoji: "🇨🇳", title: "Менеджеры по Китаю", managers: [] },
  { emoji: "🏍", title: "Менеджеры по мотоциклам", managers: [] },
];

export const externalReviews: ExternalReview[] = [
  { platform: "2gis", url: "https://go.2gis.com/kdBPo", label: "Отзывы в 2ГИС" },
  { platform: "yandex", url: "https://yandex.ru/maps/org/zakazavto/180480711316/?ll=131.933622%2C43.119687&z=17", label: "Отзывы в Яндекс Картах" },
  { platform: "avito", url: "https://www.avito.ru/brands/zakazauto25/all/avtomobili?gdlkerfdnwq=101&shopId=8582658&page_from=from_item_card_icon&iid=8231990334&sellerId=6d946d51b5d92be1f1377e3d8339bb2e", label: "Avito" },
];

export const officeHours: OfficeHours = {
  weekdays: "Понедельник - Пятница, 10:00 - 19:00",
  saturday: "Суббота, 10:00 - 14:00",
  pickupHours: "Отдел выдачи: 11:00 - 18:00 (Пн-Пт), 10:00 - 14:00 (Сб)",
};

export const newsItems: NewsItem[] = [
  { slug: "japan-auctions-guide", category: "Мировой автопром", title: "Мировые автопроизводители готовят новую волну моделей", excerpt: "Какие премьеры и обновления определят автомобильный рынок в ближайшем сезоне.", date: "27 августа 2026", image: vehicles[0].image, content: ["Автомобильные бренды продолжают обновлять модельные линейки, сочетая гибридные силовые установки, электрификацию и классические двигатели.", "Главный тренд рынка — одновременное развитие разных технологий под конкретные регионы и задачи водителей."] },
  { slug: "korea-car-delivery", category: "Электромобили", title: "Продажи электромобилей продолжают расти по всему миру", excerpt: "Рынок меняется: производители конкурируют запасом хода, скоростью зарядки и ценой.", date: "22 августа 2026", image: vehicles[1].image, content: ["Производители электромобилей расширяют присутствие на разных рынках и работают над снижением стоимости батарей.", "Покупатели все чаще сравнивают не только мощность, но и инфраструктуру зарядки, гарантию батареи и обновления программного обеспечения."] },
  { slug: "china-electric-cars", category: "Технологии", title: "Автомобили становятся полноценными цифровыми платформами", excerpt: "Мультимедиа, ассистенты водителя и обновления по воздуху меняют привычный опыт владения.", date: "18 августа 2026", image: vehicles[2].image, content: ["Современные автомобили получают более тесную интеграцию с сервисами, навигацией и системами помощи водителю.", "При этом производителям приходится уделять больше внимания кибербезопасности и защите пользовательских данных."] },
  { slug: "customs-costs", category: "Рынок", title: "Глобальный авторынок адаптируется к новым правилам торговли", excerpt: "Тарифы, локализация производства и логистика влияют на цены автомобилей в разных странах.", date: "12 августа 2026", image: vehicles[3].image, content: ["Изменения в торговой политике влияют на цепочки поставок, производство компонентов и конечную стоимость автомобилей.", "Компании диверсифицируют производство и ищут более устойчивые маршруты поставок."] },
  { slug: "inspection-checklist", category: "Безопасность", title: "Системы безопасности получают новые функции", excerpt: "Производители развивают ассистентов водителя и технологии предотвращения аварий.", date: "7 августа 2026", image: vehicles[4].image, content: ["Камеры, радары и программные алгоритмы помогают автомобилям распознавать дорожную ситуацию и предупреждать водителя.", "Эксперты отмечают, что электронные ассистенты дополняют внимание человека, но не заменяют его."] },
  { slug: "delivery-to-regions", category: "Автоспорт", title: "Автоспорт продолжает влиять на серийные автомобили", excerpt: "Гоночные технологии находят путь в силовые установки, аэродинамику и материалы.", date: "1 августа 2026", image: vehicles[5].image, content: ["Соревнования остаются испытательным полигоном для новых решений в эффективности, охлаждении и управляемости.", "Часть разработок постепенно появляется в серийных спортивных и массовых моделях."] },
  { slug: "popular-models", category: "Дизайн", title: "Кроссоверы сохраняют популярность, но дизайн становится смелее", excerpt: "Бренды экспериментируют с пропорциями, световой графикой и интерьером автомобилей.", date: "25 июля 2026", image: vehicles[6].image, content: ["Покупатели по-прежнему выбирают универсальные кузова, но ожидают от них большего комфорта и индивидуальности.", "Новые модели получают выразительную оптику, модульные салоны и больше цифровых функций."] },
  { slug: "order-process-update", category: "Индустрия", title: "Автомобильная промышленность инвестирует в переработку", excerpt: "Производители ищут способы снизить экологический след на всем жизненном цикле автомобиля.", date: "19 июля 2026", image: vehicles[7].image, content: ["Компании работают над повторным использованием материалов, энергоэффективностью заводов и более прозрачными цепочками поставок.", "Экологические требования становятся одним из факторов, влияющих на конструкцию будущих автомобилей."] },
  { slug: "office-vladivostok", category: "Мнение", title: "Каким будет автомобиль ближайшего будущего", excerpt: "Разбираем главные направления, которые уже сегодня меняют индустрию.", date: "10 июля 2026", image: vehicles[8].image, content: ["Автомобиль будущего будет сочетать разные типы силовых установок, развитые системы безопасности и более персонализированный цифровой интерфейс.", "При этом главными критериями останутся надежность, стоимость владения и удобство для конкретного человека."] },
];
