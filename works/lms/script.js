/* ==========================================================================
   SkillUp LMS — script.js
   Бургер • Фильтры • Поиск • Аккордеон • Прогресс localStorage
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 1. Бургер-меню (все страницы) ---------- */
  var burger = document.querySelector("[data-burger]");
  var nav = document.querySelector("[data-nav]");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("nav--open");
      burger.classList.toggle("burger--open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Закрывать меню при клике по ссылке (мобильный UX)
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("nav--open");
        burger.classList.remove("burger--open");
        burger.setAttribute("aria-expanded", "false");
      });
    });

    // Закрывать по Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        nav.classList.remove("nav--open");
        burger.classList.remove("burger--open");
      }
    });
  }

  /* ---------- 2. Фильтры каталога по категориям ---------- */
  var filterBtns = document.querySelectorAll("[data-filter]");
  var courseCards = document.querySelectorAll("[data-category]");
  var emptyState = document.querySelector("[data-empty]");
  var countLabel = document.querySelector("[data-count]");

  function applyFilters() {
    var activeBtn = document.querySelector(".filter-btn--active[data-filter]");
    var activeCat = activeBtn ? activeBtn.getAttribute("data-filter") : "all";
    var searchInput = document.querySelector("[data-search]");
    var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var visible = 0;

    courseCards.forEach(function (card) {
      var cat = card.getAttribute("data-category");
      var titleEl = card.querySelector("[data-title]");
      var title = titleEl ? titleEl.textContent.toLowerCase() : "";
      var matchCat = activeCat === "all" || cat === activeCat;
      var matchQuery = !query || title.indexOf(query) !== -1;
      var show = matchCat && matchQuery;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });

    if (emptyState) {
      emptyState.style.display = visible === 0 ? "block" : "none";
    }
    if (countLabel) {
      countLabel.textContent = "Показано курсов: " + visible + " из " + courseCards.length;
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) { b.classList.remove("filter-btn--active"); });
      btn.classList.add("filter-btn--active");
      applyFilters();
    });
  });

  /* ---------- 3. Поиск по названию ---------- */
  var searchInput = document.querySelector("[data-search]");
  var searchClear = document.querySelector("[data-search-clear]");

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
    // Небольшой дебаунс для плавности уже встроен через input-событие
  }

  if (searchClear && searchInput) {
    searchClear.addEventListener("click", function () {
      searchInput.value = "";
      searchInput.focus();
      applyFilters();
    });
  }

  // Первичный подсчёт на странице каталога
  if (courseCards.length && countLabel) {
    applyFilters();
  }

  /* ---------- 4. Аккордеон программы курса (8 модулей) ---------- */
  var accBtns = document.querySelectorAll("[data-acc-btn]");

  accBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest("[data-acc]");
      if (!item) return;
      var panel = item.querySelector("[data-acc-panel]");
      var isOpen = item.classList.contains("acc--open");

      // Закрыть остальные (классический аккордеон)
      document.querySelectorAll("[data-acc].acc--open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("acc--open");
          var p = other.querySelector("[data-acc-panel]");
          if (p) p.style.maxHeight = null;
          var b = other.querySelector("[data-acc-btn]");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("acc--open");
        if (panel) panel.style.maxHeight = null;
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("acc--open");
        if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Открыть первый модуль по умолчанию на странице курса
  var firstAcc = document.querySelector("[data-acc]");
  if (firstAcc && accBtns.length) {
    firstAcc.classList.add("acc--open");
    var firstPanel = firstAcc.querySelector("[data-acc-panel]");
    if (firstPanel) {
      // Ждём раскладку, чтобы scrollHeight был корректным
      window.addEventListener("load", function () {
        firstPanel.style.maxHeight = firstPanel.scrollHeight + "px";
      });
      firstPanel.style.maxHeight = firstPanel.scrollHeight + "px";
    }
  }

  // Пересчёт высоты при ресайзе
  window.addEventListener("resize", function () {
    document.querySelectorAll("[data-acc].acc--open [data-acc-panel]").forEach(function (p) {
      p.style.maxHeight = p.scrollHeight + "px";
    });
  });

  /* ---------- 5. Прогресс обучения + localStorage ---------- */
  var STORAGE_KEY = "skillup_progress_v1";

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* приватный режим — молча игнорируем */
    }
  }

  var progress = loadProgress();

  // Дефолтные значения для демо-кабинета
  var defaults = {
    "html-css": 68,
    "python-start": 42,
    "figma-design": 85,
    "english-a2": 25
  };

  Object.keys(defaults).forEach(function (k) {
    if (typeof progress[k] === "undefined") progress[k] = defaults[k];
  });
  saveProgress(progress);

  function renderProgressBars() {
    document.querySelectorAll("[data-progress-id]").forEach(function (wrap) {
      var id = wrap.getAttribute("data-progress-id");
      var val = Math.max(0, Math.min(100, parseInt(progress[id] ?? 0, 10)));
      var bar = wrap.querySelector("[data-progress-bar]");
      var label = wrap.querySelector("[data-progress-label]");
      if (bar) bar.style.width = val + "%";
      if (label) label.textContent = val + "%";
    });
  }

  renderProgressBars();

  // Кнопки «Продолжить / +10%»
  document.querySelectorAll("[data-continue]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-continue");
      var current = parseInt(progress[id] ?? 0, 10);
      current = Math.min(100, current + 10);
      progress[id] = current;
      saveProgress(progress);
      renderProgressBars();
      btn.textContent = current >= 100 ? "✅ Курс завершён!" : "▶ Продолжить урок (" + current + "%)";
      if (typeof updateOverall === "function") updateOverall();
    });
  });

  // Кнопки «Сбросить прогресс»
  document.querySelectorAll("[data-reset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-reset");
      progress[id] = 0;
      saveProgress(progress);
      renderProgressBars();
      if (typeof updateOverall === "function") updateOverall();
    });
  });

  // Кнопка «Сбросить всё»
  var resetAll = document.querySelector("[data-reset-all]");
  if (resetAll) {
    resetAll.addEventListener("click", function () {
      Object.keys(progress).forEach(function (k) { progress[k] = 0; });
      saveProgress(progress);
      renderProgressBars();
      if (typeof updateOverall === "function") updateOverall();
      alert("Прогресс сброшен. Начните обучение заново! 🎓");
    });
  }

  // Общий прогресс в кабинете
  function updateOverall() {
    var overallBar = document.querySelector("[data-overall-bar]");
    var overallLabel = document.querySelector("[data-overall-label]");
    if (!overallBar) return;
    var keys = Object.keys(progress);
    if (!keys.length) return;
    var sum = keys.reduce(function (a, k) { return a + (parseInt(progress[k], 10) || 0); }, 0);
    var avg = Math.round(sum / keys.length);
    overallBar.style.width = avg + "%";
    if (overallLabel) overallLabel.textContent = avg + "%";
  }
  // Делаем доступной для обработчиков выше
  window.updateOverall = updateOverall;
  updateOverall();

  /* ---------- 6. Формы-заглушки (запись, настройки) ---------- */
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector("[data-form-msg]");
      var nameInput = form.querySelector('input[name="name"]');
      var name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "студент";
      if (msg) {
        msg.style.display = "block";
        msg.textContent = "Спасибо, " + name + "! 🎉 Это демо: заявка сохранена локально. Мы позвоним с +998 93 507-64-73.";
      } else {
        alert("Спасибо, " + name + "! Демо-заявка отправлена 🎓");
      }
      form.reset();
    });
  });

  /* ---------- 7. Текущий год в футере ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 8. Плавный скролл к тарифам ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

})();
