"use client";

import { FormEvent, useState } from "react";
import { createPortal } from "react-dom";
import { clientApi } from "@/lib/client-api";

export function LeadForm({ compact = false, vehicleId }: { compact?: boolean; vehicleId?: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const { response, error } = await clientApi("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: vehicleId ? "VEHICLE_CALCULATION" : "VEHICLE_REQUEST", vehicleId, contact: { name: form.get("name"), phone: form.get("phone") }, comment: form.get("message"), consentGiven: form.get("consent") === "on" }) });
    setLoading(false);
    if (!response.ok) { setError(error ?? "Не удалось отправить заявку"); return; }
    setSent(true);
    event.currentTarget.reset();
  }
  if (sent)
    return (
      <div className="form-success">
        <span>✓</span>
        <h3>Заявка принята</h3>
        <p>
           Менеджер свяжется с вами в ближайшее время, чтобы уточнить задачу и следующий шаг.
        </p>
        <button onClick={() => setSent(false)} className="text-button">
          Отправить ещё одну
        </button>
      </div>
    );
  return (
    <form
      className={`lead-form ${compact ? "lead-form-compact" : ""}`}
      onSubmit={submit}
    >
      <div className="form-heading">
        <h2>{compact ? "Получить расчёт" : "Подберём автомобиль под вашу задачу"}</h2>
        <p>Оставьте контакты. Обсудим бюджет, страны и подходящие варианты.</p>
      </div>
      <label>
        Ваше имя
        <input name="name" required placeholder="Как к вам обращаться?" />
      </label>
      <label>
        Телефон
        <input name="phone" required type="tel" placeholder="+7 (___) ___-__-__" />
      </label>
      <label>
        Что ищете?
        <textarea
          name="message"
          rows={compact ? 2 : 3}
          placeholder="Марка, модель, бюджет или любые пожелания"
        />
      </label>
      <button className="button button-red" type="submit">
         {loading ? "Отправляем..." : "Отправить заявку"}
      </button>
       <div className="consent-label">
         <input name="consent" type="checkbox" required checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} />
         <button className="consent-trigger" type="button" onClick={() => setConsentOpen(true)}>
           Нажимая кнопку «Отправить», я даю свое согласие на обработку моих персональных данных, в соответствии с Федеральным законом от 27.07.2006 года №152-ФЗ «О персональных данных», на условиях и для целей, определенных в Согласии на обработку персональных данных *
         </button>
       </div>
       {error && <p className="form-error">{error}</p>}
        {consentOpen && typeof document !== "undefined" && createPortal((
         <div className="consent-modal-backdrop" role="presentation" onMouseDown={() => setConsentOpen(false)}>
           <div className="consent-modal" role="dialog" aria-modal="true" aria-labelledby="consent-title" onMouseDown={(event) => event.stopPropagation()}>
             <button className="consent-modal-close" type="button" aria-label="Закрыть" onClick={() => setConsentOpen(false)}>×</button>
             <h2 id="consent-title">Согласие на обработку персональных данных</h2>
             <div className="consent-modal-body">
               <p>Настоящим в соответствии с Федеральным законом № 152-ФЗ «О персональных данных» от 27.07.2006 года свободно, своей волей и в своем интересе выражаю свое безусловное согласие на обработку моих персональных данных &lt;Без имени&gt;, зарегистрированным в соответствии с законодательством РФ по адресу: (далее по тексту - Оператор).</p>
               <p>1. Согласие дается на обработку одной, нескольких или всех категорий персональных данных, не являющихся специальными или биометрическими, предоставляемых мною, которые могут включать:</p>
               <ul><li>Имя;</li><li>Телефон;</li><li>Ваш город;</li><li>Какой авто вас интересует?;</li><li>Из какой страны везём авто?;</li><li>Бюджет в рублях;</li><li>Как с вами лучше связаться?;</li><li>Ник телеграмм (@username).</li></ul>
               <p>2. Оператор может совершать следующие действия: сбор; запись; систематизация; накопление; хранение; уточнение (обновление, изменение); извлечение; использование; блокирование; удаление; уничтожение.</p>
               <p>3. Способы обработки: как с использованием средств автоматизации, так и без их использования.</p>
               <p>4. Цель обработки: предоставление мне услуг/работ, включая, направление в мой адрес уведомлений, касающихся предоставляемых услуг/работ, подготовка и направление ответов на мои запросы, направление в мой адрес информации о мероприятиях/товарах/услугах/работах Оператора.</p>
               <p>5. В связи с тем, что Оператор может осуществлять обработку моих персональных данных посредством программы для ЭВМ «1С-Битрикс24», я даю свое согласие Оператору на осуществление соответствующего поручения ООО «1С-Битрикс», (ОГРН 5077746476209), зарегистрированному по адресу: 109544, г. Москва, б-р Энтузиастов, д. 2, эт.13, пом. 8-19.</p>
               <p>6. Настоящее согласие действует до момента его отзыва путем направления соответствующего уведомления на электронный адрес bitrixlogika@yandex.ru или направления по адресу .</p>
               <p>7. В случае отзыва мною согласия на обработку персональных данных Оператор вправе продолжить обработку персональных данных без моего согласия при наличии оснований, предусмотренных Федеральным законом №152-ФЗ «О персональных данных» от 27.07.2006 г.</p>
             </div>
             <div className="consent-modal-actions">
               <button className="button button-red" type="button" onClick={() => { setConsentAccepted(true); setConsentOpen(false); }}>Принимаю</button>
               <button className="button button-ghost" type="button" onClick={() => { setConsentAccepted(false); setConsentOpen(false); }}>Не принимаю</button>
             </div>
           </div>
         </div>
        ), document.body)}
    </form>
  );
}
