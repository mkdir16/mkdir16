/* TransAsia — общий script.js
   1. Бургер  2. Счётчики  3. Калькулятор  4. Форма + модалка
   При натяжке на WP/Tilda логика сохраняется, меняются только селекторы/хуки. */
(function () {
  'use strict';

  /* ---------- 1. Бургер (все страницы) ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('nav--open');
      burger.classList.toggle('burger--open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('nav--open');
        burger.classList.remove('burger--open');
      });
    });
  }

  /* ---------- 2. Цифры-счётчики (главная) ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * p).toLocaleString('ru-RU');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- 3. Калькулятор доставки (главная) ---------- */
  // сюда натянуть ACF: тарифы брать из Repeater calc__rates (data-атрибуты)
  var dir = document.getElementById('calcDir');
  var weight = document.getElementById('calcWeight');
  var weightVal = document.getElementById('calcWeightVal');
  var price = document.getElementById('calcPrice');
  var note = document.getElementById('calcNote');
  var ins = document.getElementById('calcIns');
  var terms = {
    '15000': 'Срок: день в день',
    '45000': 'Срок: 1–2 дня',
    '95000': 'Срок: 3–4 дня',
    '120000': 'Срок: 2–3 дня (авиа)',
    '135000': 'Срок: 3–5 дней (авиа)'
  };
  function fmt(n) { return n.toLocaleString('ru-RU') + ' сум'; }
  function calc() {
    if (!dir || !weight || !price) return;
    var parts = dir.value.split('|');
    var rate = parseInt(parts[0], 10), base = parseInt(parts[1], 10);
    var w = parseInt(weight.value, 10);
    weightVal.textContent = w + ' кг';
    var total = base + w * rate;
    if (w >= 500) total = Math.round(total * 0.9); // скидка 10%
    if (ins && ins.checked) total = Math.round(total * 1.02);
    price.textContent = fmt(total);
    if (note) note.textContent = (terms[String(rate)] || 'Срок: уточнит менеджер') + (w >= 500 ? ' • скидка 10% учтена' : ' • скидка 10% от 500 кг');
  }
  if (dir && weight) {
    dir.addEventListener('change', calc);
    weight.addEventListener('input', calc);
    if (ins) ins.addEventListener('change', calc);
    calc();
  }

  /* ---------- 4. Форма + модалка (контакты) ---------- */
  // сюда натянуть: отправку заменить на fetch к WP REST / Tilda Webhook
  var form = document.getElementById('leadForm');
  var modal = document.getElementById('modal');
  var modalClose = document.getElementById('modalClose');
  var modalText = document.getElementById('modalText');
  function openModal() { if (modal) modal.classList.add('modal--open'); }
  function closeModal() { if (modal) modal.classList.remove('modal--open'); }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('fName');
      var phone = document.getElementById('fPhone');
      var msg = document.getElementById('fMsg');
      var eName = document.getElementById('eName');
      var ePhone = document.getElementById('ePhone');
      var ok = true;

      var nameOk = name.value.trim().length >= 2;
      name.classList.toggle('form__input--error', !nameOk);
      eName.classList.toggle('form__error--show', !nameOk);
      if (!nameOk) ok = false;

      var digits = phone.value.replace(/\D/g, '');
      var phoneOk = digits.length >= 7 && digits.length <= 15;
      phone.classList.toggle('form__input--error', !phoneOk);
      ePhone.classList.toggle('form__error--show', !phoneOk);
      if (!phoneOk) ok = false;

      if (!ok) return;
      // демо: без бэкенда, просто показываем модалку
      if (modalText) modalText.textContent = 'Спасибо, ' + name.value.trim() + '! Менеджер перезвонит на ' + phone.value.trim() + ' за 10 минут.';
      form.reset();
      openModal();
    });
  }
})();
