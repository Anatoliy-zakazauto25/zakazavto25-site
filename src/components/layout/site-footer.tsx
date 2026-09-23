import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand" href="/">
          ЗаказАвто<span>25</span>
        </Link>
        <p>
          Привоз автомобилей из Азии
          <br />с контролем на каждом этапе.
        </p>
        <div className="footer-social" aria-label="Социальные сети">
          <a href="https://t.me/zakazauto25" target="_blank" rel="noreferrer">Telegram</a>
        </div>
      </div>
      <div className="footer-links">
        <div>
          <small>Навигация</small>
          <Link href="/catalog">Автомобили</Link>
          <Link href="/cases">Кейсы</Link>
          <Link href="/about">О компании</Link>
        </div>
        <div id="contacts">
          <small>Контакты</small>
          <a href="tel:+79241310410">+7 924 131 04 10</a>
          <a href="tel:+79505926759">+7 950 592 67 59</a>
          <a href="tel:+79502999333">+7 950 299 93 33</a>
          <span className="footer-address">Владивосток, 13-я Рабочая, 12с3, офис 1</span>
          <a className="footer-map-link" href="https://t.me/zakazauto25" target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a className="footer-map-link" href="https://go.2gis.com/kdBPo" target="_blank" rel="noreferrer">
            Открыть в 2ГИС
          </a>
        </div>
        <div className="footer-requisites">
          <small>Реквизиты компании</small>
          <span>ИНН 2536352819</span>
          <span>КПП 253601001</span>
          <span>ОГРН 1252500026789</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Все права защищены © 2021-2026 ЗаказАвто25</span>
        <a className="footer-credits" href="https://vk.ru/iskatel.vitaly" target="_blank" rel="noreferrer">
          <span>Сайт разработан Кислицын В.</span>
        </a>
        <Link href="/privacy">Политика конфиденциальности</Link>
      </div>
    </footer>
  );
}
